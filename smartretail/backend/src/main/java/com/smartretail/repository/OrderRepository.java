package com.smartretail.repository;

import com.smartretail.entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    Optional<Order> findByInvoiceNumber(String invoiceNumber);
    List<Order> findByCustomerId(String customerId);
    List<Order> findByStoreId(String storeId);
    List<Order> findByStatus(Order.OrderStatus status);

    @Query("{ 'storeId': ?0, 'orderDate': { '$gte': ?1, '$lte': ?2 } }")
    List<Order> findByStoreAndDateRange(String storeId, LocalDateTime from, LocalDateTime to);

    @Query("{ 'storeId': ?0, 'dueAmount': { '$gt': 0 } }")
    List<Order> findPendingDueOrders(String storeId);
}
