package com.smartretail.dto;
import jakarta.validation.constraints.*; import lombok.Data; import java.math.BigDecimal;
@Data
public class OrderItemRequest {
    @NotBlank private String productId;
    @NotNull @Min(1) private Integer quantity;
    private BigDecimal discountAmount;
}
