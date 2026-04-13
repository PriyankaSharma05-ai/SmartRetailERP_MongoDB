package com.smartretail.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.*;

@Document(collection = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private String password;
    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String phone;

    @Builder.Default
    private Boolean enabled = true;

    @Builder.Default
    private Set<String> roles = new HashSet<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
