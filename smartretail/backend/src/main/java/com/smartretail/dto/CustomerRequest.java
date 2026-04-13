package com.smartretail.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String phone;
    private String email;
    private String address;
    private String city;
}
