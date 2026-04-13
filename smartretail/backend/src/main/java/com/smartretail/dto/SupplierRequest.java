package com.smartretail.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierRequest {
    @NotBlank
    private String name;
    private String contactName;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String gstNumber;
}
