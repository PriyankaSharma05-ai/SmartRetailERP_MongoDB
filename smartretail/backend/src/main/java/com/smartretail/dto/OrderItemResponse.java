package com.smartretail.dto;
import lombok.*; import java.math.BigDecimal;
@Data @Builder
public class OrderItemResponse {
    private String productId;
    private String productName;
    private String productSku;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal gstPercentage;
    private BigDecimal gstAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;
    private BigDecimal profit;
}
