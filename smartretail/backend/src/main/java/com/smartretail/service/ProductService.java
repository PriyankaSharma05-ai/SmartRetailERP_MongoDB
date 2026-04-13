package com.smartretail.service;

import com.smartretail.dto.*;
import com.smartretail.entity.*;
import com.smartretail.exception.*;
import com.smartretail.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final SupplierRepository supplierRepo;
    private final StoreRepository storeRepo;
    private final InventoryRepository inventoryRepo;
    private final StockMovementRepository stockMovementRepo;
    private final UserRepository userRepo;

    @Cacheable(value = "products", key = "#storeId")
    public List<ProductResponse> getAllByStore(String storeId) {
        return productRepo.findByStoreId(storeId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> search(String query) {
        return productRepo.search(query).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse getById(String id) {
        return toResponse(productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id)));
    }

    public ProductResponse getByBarcode(String barcode) {
        return toResponse(productRepo.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with barcode: " + barcode)));
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse create(ProductRequest req, String username) {
        if (req.getSellingPrice().compareTo(req.getCostPrice()) < 0)
            throw new BusinessException("Selling price cannot be less than cost price.");
        if (req.getSku() != null && productRepo.findBySku(req.getSku()).isPresent())
            throw new BusinessException("SKU already exists: " + req.getSku());

        Product p = Product.builder()
                .name(req.getName()).sku(req.getSku()).barcode(req.getBarcode())
                .description(req.getDescription()).costPrice(req.getCostPrice())
                .sellingPrice(req.getSellingPrice()).mrp(req.getMrp())
                .gstPercentage(req.getGstPercentage() != null ? req.getGstPercentage() : java.math.BigDecimal.ZERO)
                .unit(req.getUnit() != null ? req.getUnit() : "piece")
                .imageUrl(req.getImageUrl())
                .categoryId(req.getCategoryId())
                .supplierId(req.getSupplierId())
                .storeId(req.getStoreId())
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();

        Product saved = productRepo.save(p);

        // Create inventory record
        Inventory inv = Inventory.builder()
                .productId(saved.getId())
                .storeId(saved.getStoreId())
                .quantity(0)
                .minQuantity(req.getMinQuantity() != null ? req.getMinQuantity() : 10)
                .lastUpdated(LocalDateTime.now())
                .build();
        inventoryRepo.save(inv);
        return toResponse(saved);
    }

    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse update(String id, ProductRequest req) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        if (req.getSellingPrice().compareTo(req.getCostPrice()) < 0)
            throw new BusinessException("Selling price cannot be less than cost price.");
        p.setName(req.getName()); p.setDescription(req.getDescription());
        p.setCostPrice(req.getCostPrice()); p.setSellingPrice(req.getSellingPrice());
        p.setMrp(req.getMrp()); p.setGstPercentage(req.getGstPercentage());
        p.setUnit(req.getUnit()); p.setImageUrl(req.getImageUrl());
        p.setCategoryId(req.getCategoryId()); p.setSupplierId(req.getSupplierId());
        p.setUpdatedAt(LocalDateTime.now());
        return toResponse(productRepo.save(p));
    }

    @CacheEvict(value = "products", allEntries = true)
    public void delete(String id) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        p.setIsActive(false);
        productRepo.save(p);
    }

    public void adjustStock(StockAdjustRequest req, String username) {
        Inventory inv = inventoryRepo.findByProductId(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory for product: " + req.getProductId()));

        StockMovement.MovementType type = StockMovement.MovementType.valueOf(req.getMovementType());
        int qty = req.getQuantity();

        if (type == StockMovement.MovementType.OUT && inv.getQuantity() < qty)
            throw new BusinessException("Insufficient stock. Available: " + inv.getQuantity());

        if (type == StockMovement.MovementType.IN || type == StockMovement.MovementType.RETURN)
            inv.setQuantity(inv.getQuantity() + qty);
        else if (type == StockMovement.MovementType.OUT)
            inv.setQuantity(inv.getQuantity() - qty);
        else
            inv.setQuantity(qty); // ADJUSTMENT = set absolute
        inv.setLastUpdated(LocalDateTime.now());
        inventoryRepo.save(inv);

        User user = userRepo.findByUsername(username).orElse(null);
        StockMovement movement = StockMovement.builder()
                .productId(req.getProductId())
                .storeId(inv.getStoreId())
                .movementType(type).quantity(qty)
                .referenceType("MANUAL").notes(req.getNotes())
                .createdById(user != null ? user.getId() : null)
                .createdAt(LocalDateTime.now())
                .build();
        stockMovementRepo.save(movement);
    }

    public List<ProductResponse> getLowStock(String storeId) {
        return inventoryRepo.findLowStockByStore(storeId).stream()
                .map(i -> productRepo.findById(i.getProductId())
                        .map(this::toResponse).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getLossItems() {
        return productRepo.findLossItems().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse toResponse(Product p) {
        Inventory inv = inventoryRepo.findByProductId(p.getId()).orElse(null);
        int stock    = inv != null ? inv.getQuantity()    : 0;
        int minStock = inv != null ? inv.getMinQuantity() : 0;
        String stockStatus = stock == 0 ? "OUT_OF_STOCK" : stock <= minStock ? "LOW_STOCK" : "IN_STOCK";

        String categoryName = null;
        if (p.getCategoryId() != null)
            categoryName = categoryRepo.findById(p.getCategoryId()).map(c -> c.getName()).orElse(null);

        String supplierName = null;
        if (p.getSupplierId() != null)
            supplierName = supplierRepo.findById(p.getSupplierId()).map(s -> s.getName()).orElse(null);

        return ProductResponse.builder()
                .id(p.getId()).name(p.getName()).sku(p.getSku()).barcode(p.getBarcode())
                .description(p.getDescription())
                .categoryName(categoryName).categoryId(p.getCategoryId())
                .supplierName(supplierName).supplierId(p.getSupplierId())
                .costPrice(p.getCostPrice()).sellingPrice(p.getSellingPrice()).mrp(p.getMrp())
                .gstPercentage(p.getGstPercentage()).unit(p.getUnit()).imageUrl(p.getImageUrl())
                .isActive(p.getIsActive()).stockQuantity(stock).minQuantity(minStock)
                .profit(p.getProfit()).marginPct(p.getMarginPct())
                .stockStatus(stockStatus).createdAt(p.getCreatedAt())
                .build();
    }
}
