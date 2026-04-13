package com.smartretail.dto;
import lombok.*; import java.math.BigDecimal; import java.time.LocalDateTime;
@Data @Builder
public class ProductResponse {
    private String id;
    private String name;
    private String sku;
    private String barcode;
    private String description;
    private String categoryName;
    private String categoryId;
    private String supplierName;
    private String supplierId;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private BigDecimal mrp;
    private BigDecimal gstPercentage;
    private String unit;
    private String imageUrl;
    private Boolean isActive;
    private Integer stockQuantity;
    private Integer minQuantity;
    private BigDecimal profit;
    private BigDecimal marginPct;
    private String stockStatus;
    private LocalDateTime createdAt;
}
