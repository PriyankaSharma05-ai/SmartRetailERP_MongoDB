package com.smartretail.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class RegisterRequest {
    @NotBlank @Size(min = 3, max = 50)
    private String username;
    @NotBlank @Size(min = 6)
    private String password;
    @NotBlank
    private String fullName;
    @Email
    private String email;
    private String phone;
    private List<String> roles;
}
