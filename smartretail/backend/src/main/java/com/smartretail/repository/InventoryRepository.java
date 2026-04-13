package com.smartretail.repository;

import com.smartretail.entity.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends MongoRepository<Inventory, String> {
    Optional<Inventory> findByProductId(String productId);
    Optional<Inventory> findByProductIdAndStoreId(String productId, String storeId);

    @Query("{ 'storeId': ?0, '$expr': { '$lte': [ '$quantity', '$minQuantity' ] } }")
    List<Inventory> findLowStockByStore(String storeId);

    @Query("{ 'storeId': ?0, 'quantity': 0 }")
    List<Inventory> findOutOfStockByStore(String storeId);
}
