package com.smartretail.repository;

import com.smartretail.entity.StockMovement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends MongoRepository<StockMovement, String> {
    List<StockMovement> findByProductIdOrderByCreatedAtDesc(String productId);
    List<StockMovement> findByStoreIdAndCreatedAtBetween(String storeId, LocalDateTime from, LocalDateTime to);
}
