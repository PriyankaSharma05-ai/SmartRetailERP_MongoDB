package com.smartretail.dto;
import lombok.*; import java.util.List;
@Data @Builder
public class LoginResponse {
    private String token;
    private String type;
    private String userId;
    private String username;
    private String fullName;
    private List<String> roles;
}
