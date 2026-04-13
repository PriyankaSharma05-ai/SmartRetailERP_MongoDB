package com.smartretail.repository;

import com.smartretail.entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    Optional<Product> findBySku(String sku);
    Optional<Product> findByBarcode(String barcode);
    List<Product> findByCategoryId(String categoryId);
    List<Product> findBySupplierId(String supplierId);
    List<Product> findByStoreId(String storeId);
    List<Product> findByIsActiveTrue();

    @Query("{ 'isActive': true, '$or': [ { 'name': { '$regex': ?0, '$options': 'i' } }, { 'sku': { '$regex': ?0, '$options': 'i' } }, { 'barcode': { '$regex': ?0 } } ] }")
    List<Product> search(String query);

    @Query("{ '$expr': { '$lt': [ '$sellingPrice', '$costPrice' ] }, 'isActive': true }")
    List<Product> findLossItems();
}
