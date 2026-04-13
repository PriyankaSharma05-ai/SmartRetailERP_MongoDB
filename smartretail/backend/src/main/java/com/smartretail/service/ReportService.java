package com.smartretail.service;

import com.smartretail.dto.*;
import com.smartretail.entity.Order;
import com.smartretail.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepo;
    private final OrderService orderService;
    private final OrderAggregationService aggService;

    public ReportResponse getReport(String storeId, LocalDateTime from, LocalDateTime to) {
        List<Order> orders     = orderRepo.findByStoreAndDateRange(storeId, from, to);
        BigDecimal totalRev    = aggService.sumRevenue(storeId, from, to);
        BigDecimal totalProfit = aggService.sumProfit(storeId, from, to);
        long totalOrders       = aggService.countOrders(storeId, from, to);

        List<DailySale>  daily    = aggService.getDailySales(storeId, from, to);
        List<TopProduct> topProds = aggService.getTopProducts(storeId, from, to);

        return ReportResponse.builder()
                .totalRevenue(totalRev).totalProfit(totalProfit).totalOrders(totalOrders)
                .completedOrders(orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED).count())
                .partialOrders(orders.stream().filter(o -> o.getStatus() == Order.OrderStatus.PARTIAL).count())
                .dailySales(daily).topProducts(topProds)
                .orders(orders.stream().map(orderService::toResponse).collect(Collectors.toList()))
                .build();
    }
}
