package com.smartretail.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "suppliers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Supplier {
    @Id
    private String id;
    private String name;
    private String contactName;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String gstNumber;
    @Builder.Default private BigDecimal balanceDue = BigDecimal.ZERO;
    @Builder.Default private Status status = Status.ACTIVE;
    private LocalDateTime createdAt;
    public enum Status { ACTIVE, INACTIVE }
}
