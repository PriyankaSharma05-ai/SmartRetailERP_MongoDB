package com.smartretail.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data; import java.math.BigDecimal; import java.util.List;
@Data
public class OrderRequest {
    private String customerId;
    @NotNull private String storeId;
    @NotNull private List<OrderItemRequest> items;
    private BigDecimal discountAmount;
    private String paymentMode;
    private BigDecimal paidAmount;
    private String notes;
}
