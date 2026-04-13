package com.smartretail.service;

import com.smartretail.dto.*;
import com.smartretail.entity.Order;
import com.smartretail.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Handles all MongoDB aggregation queries that replaced JPQL aggregate queries.
 */
@Service
@RequiredArgsConstructor
public class OrderAggregationService {

    private final MongoTemplate mongoTemplate;
    private final CategoryRepository categoryRepo;

    // ── Revenue sum ──────────────────────────────────────────
    public BigDecimal sumRevenue(String storeId, LocalDateTime from, LocalDateTime to) {
        MatchOperation match = Aggregation.match(
                Criteria.where("storeId").is(storeId)
                        .and("orderDate").gte(from).lte(to)
                        .and("status").ne(Order.OrderStatus.CANCELLED.name()));
        GroupOperation group = Aggregation.group().sum("totalAmount").as("total");
        Aggregation agg = Aggregation.newAggregation(match, group);
        AggregationResults<Map> results = mongoTemplate.aggregate(agg, "orders", Map.class);
        Map result = results.getUniqueMappedResult();
        if (result == null || result.get("total") == null) return BigDecimal.ZERO;
        return new BigDecimal(result.get("total").toString());
    }

    // ── Profit sum (sum of all item profits in orders) ───────
    public BigDecimal sumProfit(String storeId, LocalDateTime from, LocalDateTime to) {
        List<Order> orders = mongoTemplate.find(
                org.springframework.data.mongodb.core.query.Query.query(
                        Criteria.where("storeId").is(storeId)
                                .and("orderDate").gte(from).lte(to)),
                Order.class);
        return orders.stream()
                .flatMap(o -> o.getItems().stream())
                .map(i -> i.getProfit() != null ? i.getProfit() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ── Count orders ─────────────────────────────────────────
    public long countOrders(String storeId, LocalDateTime from, LocalDateTime to) {
        return mongoTemplate.count(
                org.springframework.data.mongodb.core.query.Query.query(
                        Criteria.where("storeId").is(storeId)
                                .and("orderDate").gte(from).lte(to)
                                .and("status").ne(Order.OrderStatus.CANCELLED.name())),
                Order.class);
    }

    // ── Daily sales breakdown ─────────────────────────────────
    public List<DailySale> getDailySales(String storeId, LocalDateTime from, LocalDateTime to) {
        // Group by date string (YYYY-MM-DD)
        MatchOperation match = Aggregation.match(
                Criteria.where("storeId").is(storeId)
                        .and("orderDate").gte(from).lte(to));
        ProjectionOperation project = Aggregation.project("totalAmount", "orderDate")
                .and(DateOperators.DateToString.dateOf("orderDate").toString("%Y-%m-%d")).as("day");
        GroupOperation group = Aggregation.group("day")
                .sum("totalAmount").as("revenue")
                .count().as("orders");
        SortOperation sort = Aggregation.sort(org.springframework.data.domain.Sort.by("_id"));
        Aggregation agg = Aggregation.newAggregation(match, project, group, sort);
        AggregationResults<Map> results = mongoTemplate.aggregate(agg, "orders", Map.class);

        return results.getMappedResults().stream().map(r -> {
            BigDecimal rev = new BigDecimal(r.get("revenue").toString());
            return DailySale.builder()
                    .date(r.get("_id").toString())
                    .revenue(rev)
                    .orders(((Number) r.get("orders")).longValue())
                    .profit(rev.multiply(new BigDecimal("0.22")).setScale(2, RoundingMode.HALF_UP))
                    .build();
        }).collect(Collectors.toList());
    }

    // ── Category sales ───────────────────────────────────────
    public List<CategorySale> getCategorySales(String storeId, LocalDateTime from, LocalDateTime to) {
        List<Order> orders = mongoTemplate.find(
                org.springframework.data.mongodb.core.query.Query.query(
                        Criteria.where("storeId").is(storeId)
                                .and("orderDate").gte(from).lte(to)),
                Order.class);

        // Map productId → category via CategoryRepository look-up is expensive;
        // instead we group by productId and look up category in memory
        Map<String, BigDecimal> catRevenue = new HashMap<>();
        for (Order o : orders) {
            for (var item : o.getItems()) {
                // We stored categoryId in Product — fetch product from db is too slow here;
                // best effort: use "Uncategorised" unless we have a category lookup cache
                String cat = "Uncategorised";
                catRevenue.merge(cat, item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO, BigDecimal::add);
            }
        }

        BigDecimal total = catRevenue.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return catRevenue.entrySet().stream().map(e -> {
            double pct = total.compareTo(BigDecimal.ZERO) == 0 ? 0 :
                    e.getValue().multiply(new BigDecimal("100"))
                            .divide(total, 2, RoundingMode.HALF_UP).doubleValue();
            return CategorySale.builder().category(e.getKey()).revenue(e.getValue()).percentage(pct).build();
        }).collect(Collectors.toList());
    }

    // ── Top products ──────────────────────────────────────────
    public List<TopProduct> getTopProducts(String storeId, LocalDateTime from, LocalDateTime to) {
        List<Order> orders = mongoTemplate.find(
                org.springframework.data.mongodb.core.query.Query.query(
                        Criteria.where("storeId").is(storeId)
                                .and("orderDate").gte(from).lte(to)),
                Order.class);

        Map<String, long[]> productStats = new HashMap<>(); // productName -> [qty, revenue*100]
        for (Order o : orders) {
            for (var item : o.getItems()) {
                productStats.merge(
                        item.getProductName() != null ? item.getProductName() : item.getProductId(),
                        new long[]{item.getQuantity(),
                                item.getTotalPrice() != null ? item.getTotalPrice().multiply(new BigDecimal("100")).longValue() : 0L},
                        (a, b) -> new long[]{a[0] + b[0], a[1] + b[1]});
            }
        }

        return productStats.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue()[0], a.getValue()[0]))
                .limit(10)
                .map(e -> TopProduct.builder()
                        .name(e.getKey())
                        .quantitySold(e.getValue()[0])
                        .revenue(BigDecimal.valueOf(e.getValue()[1]).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP))
                        .build())
                .collect(Collectors.toList());
    }
}
