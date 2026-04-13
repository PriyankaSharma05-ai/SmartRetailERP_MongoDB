package com.smartretail.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "roles")
@Data @NoArgsConstructor @AllArgsConstructor
public class Role {
    @Id
    private String id;

    @Indexed(unique = true)
    private String name;
}
