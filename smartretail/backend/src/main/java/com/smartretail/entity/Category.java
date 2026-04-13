package com.smartretail.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "categories")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {
    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    private String description;
    private LocalDateTime createdAt;
}
