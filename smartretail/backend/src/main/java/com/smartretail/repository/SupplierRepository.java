package com.smartretail.repository;

import com.smartretail.entity.Supplier;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SupplierRepository extends MongoRepository<Supplier, String> {
    List<Supplier> findByStatus(Supplier.Status status);
    List<Supplier> findByBalanceDueGreaterThan(BigDecimal amount);

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'contactName': { '$regex': ?0, '$options': 'i' } } ] }")
    List<Supplier> search(String query);
}
