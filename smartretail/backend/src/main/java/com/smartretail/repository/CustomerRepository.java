package com.smartretail.repository;

import com.smartretail.entity.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends MongoRepository<Customer, String> {
    Optional<Customer> findByPhone(String phone);
    boolean existsByPhone(String phone);

    @Query("{ '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'phone': { '$regex': ?0 } } ] }")
    List<Customer> search(String query);

    List<Customer> findTop10ByOrderByLoyaltyPointsDesc();
}
