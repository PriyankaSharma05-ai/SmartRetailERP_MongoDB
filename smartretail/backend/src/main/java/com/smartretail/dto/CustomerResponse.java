package com.smartretail.dto;
import lombok.*; import java.math.BigDecimal; import java.time.LocalDateTime;
@Data @Builder
public class CustomerResponse {
    private String id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String city;
    private Integer loyaltyPoints;
    private Long totalOrders;
    private BigDecimal totalSpent;
    private LocalDateTime createdAt;
}
