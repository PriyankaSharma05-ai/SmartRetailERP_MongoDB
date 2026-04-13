package com.smartretail.dto;
import lombok.*; import java.math.BigDecimal; import java.time.LocalDateTime;
@Data @Builder
public class SupplierResponse {
    private String id;
    private String name;
    private String contactName;
    private String phone;
    private String email;
    private String city;
    private String gstNumber;
    private BigDecimal balanceDue;
    private String status;
    private LocalDateTime createdAt;
}
