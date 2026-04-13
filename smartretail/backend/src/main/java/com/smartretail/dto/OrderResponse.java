package com.smartretail.dto;
import lombok.*; import java.math.BigDecimal; import java.time.LocalDateTime; import java.util.List;
@Data @Builder
public class OrderResponse {
    private String id;
    private String invoiceNumber;
    private String customerName;
    private String customerId;
    private String createdBy;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal dueAmount;
    private String paymentMode;
    private String status;
    private List<OrderItemResponse> items;
    private LocalDateTime orderDate;
}
