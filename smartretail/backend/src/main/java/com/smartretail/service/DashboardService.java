package com.smartretail.service;

import com.smartretail.dto.*;
import com.smartretail.entity.Order;
import com.smartretail.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;
    private final InventoryRepository inventoryRepo;
    private final ProductService productService;
    private final OrderService orderService;
    private final OrderAggregationService aggService;

    public DashboardStats getDashboardStats(String storeId) {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd   = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime weekStart  = LocalDate.now().minusDays(6).atStartOfDay();
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime now        = LocalDateTime.now();

        BigDecimal todayRev  = aggService.sumRevenue(storeId, todayStart, todayEnd);
        BigDecimal weekRev   = aggService.sumRevenue(storeId, weekStart, now);
        BigDecimal monthRev  = aggService.sumRevenue(storeId, monthStart, now);
        BigDecimal todayPro  = aggService.sumProfit(storeId, todayStart, todayEnd);
        long todayOrders     = aggService.countOrders(storeId, todayStart, todayEnd);

        List<DailySale>    weeklySales = aggService.getDailySales(storeId, weekStart, now);
        List<CategorySale> catSales    = aggService.getCategorySales(storeId, monthStart, now);

        List<ProductResponse> lowStock = productService.getLowStock(storeId).stream()
                .limit(5).collect(Collectors.toList());

        List<OrderResponse> recentOrders = orderRepo
                .findByStoreAndDateRange(storeId, todayStart.minusDays(3), now).stream()
                .limit(5).map(orderService::toResponse).collect(Collectors.toList());

        BigDecimal pendingDue = orderRepo.findPendingDueOrders(storeId).stream()
                .map(o -> o.getDueAmount() != null ? o.getDueAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardStats.builder()
                .todayRevenue(todayRev).weekRevenue(weekRev).monthRevenue(monthRev)
                .todayProfit(todayPro).todayOrders(todayOrders)
                .totalProducts(productRepo.findByStoreId(storeId).stream().filter(p -> Boolean.TRUE.equals(p.getIsActive())).count())
                .lowStockCount((long) inventoryRepo.findLowStockByStore(storeId).size())
                .outOfStockCount((long) inventoryRepo.findOutOfStockByStore(storeId).size())
                .totalCustomers(customerRepo.count()).pendingDue(pendingDue)
                .weeklySales(weeklySales).categorySales(catSales)
                .lowStockAlerts(lowStock).recentOrders(recentOrders)
                .build();
    }
}
