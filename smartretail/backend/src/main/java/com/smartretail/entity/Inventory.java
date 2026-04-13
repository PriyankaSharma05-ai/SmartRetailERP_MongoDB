package com.smartretail.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "inventory")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory {
    @Id
    private String id;
    private String productId;   // ref to Product
    private String storeId;     // ref to Store
    @Builder.Default private Integer quantity = 0;
    @Builder.Default private Integer minQuantity = 10;
    @Builder.Default private Integer maxQuantity = 1000;
    private LocalDateTime lastUpdated;

    public boolean isLowStock()   { return quantity <= minQuantity; }
    public boolean isOutOfStock() { return quantity <= 0; }
}
