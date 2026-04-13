package com.smartretail.dto;
import jakarta.validation.constraints.*;
import lombok.Data; import java.math.BigDecimal;
@Data
public class ProductRequest {
    @NotBlank private String name;
    private String sku;
    private String barcode;
    private String description;
    private String categoryId;
    private String supplierId;
    private String storeId;
    @NotNull @DecimalMin("0") private BigDecimal costPrice;
    @NotNull @DecimalMin("0") private BigDecimal sellingPrice;
    private BigDecimal mrp;
    @DecimalMin("0") @DecimalMax("100") private BigDecimal gstPercentage;
    private String unit;
    private String imageUrl;
    private String expiryDate;
    private String batchNumber;
    private Integer minQuantity;
    private String categoryName;
}
