package com.smartretail.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "stock_movements")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovement {
    @Id
    private String id;
    private String productId;    // ref to Product
    private String storeId;      // ref to Store
    private MovementType movementType;
    private Integer quantity;
    private String referenceType;
    private String referenceId;
    private String notes;
    private String createdById;  // ref to User
    private LocalDateTime createdAt;
    public enum MovementType { IN, OUT, RETURN, ADJUSTMENT }
}
