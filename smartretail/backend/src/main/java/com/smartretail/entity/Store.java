package com.smartretail.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "stores")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Store {
    @Id
    private String id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String gstNumber;
    private String phone;
    private String email;
    private String ownerId;   // reference to User.id
    private LocalDateTime createdAt;
}
