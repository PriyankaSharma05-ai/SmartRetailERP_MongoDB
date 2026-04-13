package com.smartretail.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ReportResponse {
    private BigDecimal totalRevenue;
    private BigDecimal totalProfit;
    private BigDecimal totalCost;
    private Long totalOrders;
    private Long completedOrders;
    private Long partialOrders;
    private List<DailySale> dailySales;
    private List<CategorySale> categorySales;
    private List<TopProduct> topProducts;
    private List<OrderResponse> orders;
}
