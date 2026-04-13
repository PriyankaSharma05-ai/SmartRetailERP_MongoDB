package com.smartretail.entity;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {
    private String productId;
    private String productName;  // denormalized for display
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal costPrice;
    @Builder.Default private BigDecimal gstPercentage = BigDecimal.ZERO;
    @Builder.Default private BigDecimal gstAmount     = BigDecimal.ZERO;
    @Builder.Default private BigDecimal discountAmount = BigDecimal.ZERO;
    private BigDecimal totalPrice;
    private BigDecimal profit;
}
