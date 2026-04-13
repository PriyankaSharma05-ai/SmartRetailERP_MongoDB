package com.smartretail.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id
    private String id;
    private String userId;       // ref to User
    private String action;
    private String entityType;
    private String entityId;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private LocalDateTime createdAt;
}
