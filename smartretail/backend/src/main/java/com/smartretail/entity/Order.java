package com.smartretail.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Document(collection = "orders")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id
    private String id;

    @Indexed(unique = true)
    private String invoiceNumber;

    private String customerId;   // ref to Customer
    private String storeId;      // ref to Store
    private String createdById;  // ref to User

    private BigDecimal subtotal;
    @Builder.Default private BigDecimal discountAmount = BigDecimal.ZERO;
    @Builder.Default private BigDecimal taxAmount      = BigDecimal.ZERO;
    private BigDecimal totalAmount;
    @Builder.Default private BigDecimal paidAmount = BigDecimal.ZERO;
    @Builder.Default private BigDecimal dueAmount  = BigDecimal.ZERO;

    @Builder.Default private PaymentMode paymentMode = PaymentMode.CASH;
    @Builder.Default private OrderStatus status      = OrderStatus.COMPLETED;

    private String notes;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    private LocalDateTime orderDate;

    public enum PaymentMode  { CASH, UPI, CARD, PART_PAYMENT, CREDIT }
    public enum OrderStatus  { COMPLETED, PARTIAL, CANCELLED, REFUNDED }
}
