package com.smartretail.entity;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.*;

@Document(collection = "products")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id
    private String id;

    @NotBlank
    private String name;

    @Indexed(unique = true)
    private String sku;
    private String barcode;
    private String description;

    private String categoryId;   // ref to Category
    private String supplierId;   // ref to Supplier
    private String storeId;      // ref to Store

    @NotNull @DecimalMin("0") private BigDecimal costPrice;
    @NotNull @DecimalMin("0") private BigDecimal sellingPrice;
    private BigDecimal mrp;

    @Builder.Default private BigDecimal gstPercentage = BigDecimal.ZERO;
    @Builder.Default private String unit = "piece";
    private String imageUrl;
    @Builder.Default private Boolean isActive = true;
    private LocalDate expiryDate;
    private String batchNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BigDecimal getProfit() {
        return sellingPrice.subtract(costPrice);
    }
    public BigDecimal getMarginPct() {
        if (sellingPrice.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return getProfit().multiply(new BigDecimal("100")).divide(sellingPrice, 2, java.math.RoundingMode.HALF_UP);
    }
}
