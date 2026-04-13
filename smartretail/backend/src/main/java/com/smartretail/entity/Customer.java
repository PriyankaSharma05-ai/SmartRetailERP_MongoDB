package com.smartretail.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "customers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {
    @Id
    private String id;
    private String name;
    @Indexed(unique = true)
    private String phone;
    private String email;
    private String address;
    private String city;
    @Builder.Default private Integer loyaltyPoints = 0;
    private LocalDateTime createdAt;
}
