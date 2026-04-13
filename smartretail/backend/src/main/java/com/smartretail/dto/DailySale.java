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
public class DailySale {
    private String date;
    private BigDecimal revenue;
    private BigDecimal profit;
    private Long orders;
}
