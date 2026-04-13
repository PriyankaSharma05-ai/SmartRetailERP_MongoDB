package com.smartretail.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopProduct {
    private String name;
    private Long quantitySold;
    private BigDecimal revenue;
}
