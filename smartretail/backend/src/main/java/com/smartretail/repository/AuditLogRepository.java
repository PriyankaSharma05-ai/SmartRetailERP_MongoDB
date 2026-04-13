package com.smartretail.repository;

import com.smartretail.entity.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findTop50ByOrderByCreatedAtDesc();
    List<AuditLog> findByUserId(String userId);
}
