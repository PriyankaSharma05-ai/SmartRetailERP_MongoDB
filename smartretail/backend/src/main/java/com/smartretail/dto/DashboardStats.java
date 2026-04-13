package com.smartretail.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardStats {
    private BigDecimal todayRevenue;
    private BigDecimal weekRevenue;
    private BigDecimal monthRevenue;
    private BigDecimal todayProfit;
    private Long todayOrders;
    private Long totalProducts;
    private Long lowStockCount;
    private Long outOfStockCount;
    private Long totalCustomers;
    private BigDecimal pendingDue;
    private List<DailySale> weeklySales;
    private List<CategorySale> categorySales;
    private List<ProductResponse> lowStockAlerts;
    private List<OrderResponse> recentOrders;
}
