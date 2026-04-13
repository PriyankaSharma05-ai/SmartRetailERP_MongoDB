package com.smartretail.dto;
import jakarta.validation.constraints.NotNull; import lombok.Data;
@Data
public class StockAdjustRequest {
    @NotNull private String productId;
    @NotNull private Integer quantity;
    private String movementType;
    private String notes;
}
