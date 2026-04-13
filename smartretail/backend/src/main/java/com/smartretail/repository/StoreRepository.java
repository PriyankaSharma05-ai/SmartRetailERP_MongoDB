package com.smartretail.repository;

import com.smartretail.entity.Store;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StoreRepository extends MongoRepository<Store, String> {
    List<Store> findByOwnerId(String ownerId);
}
