package com.smartretail.controller;

import com.smartretail.dto.*;
import com.smartretail.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/products")
@RequiredArgsConstructor @Tag(name = "Products")
@SecurityRequirement(name = "Bearer Authentication")
public class ProductController {
    private final ProductService service;

    @GetMapping                       public ResponseEntity<ApiResponse<List<ProductResponse>>> getAll(@RequestParam String storeId)                { return ResponseEntity.ok(ApiResponse.ok(service.getAllByStore(storeId))); }
    @GetMapping("/search")            public ResponseEntity<ApiResponse<List<ProductResponse>>> search(@RequestParam String q)                      { return ResponseEntity.ok(ApiResponse.ok(service.search(q))); }
    @GetMapping("/{id}")              public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable String id)                          { return ResponseEntity.ok(ApiResponse.ok(service.getById(id))); }
    @GetMapping("/barcode/{barcode}") public ResponseEntity<ApiResponse<ProductResponse>> getByBarcode(@PathVariable String barcode)                { return ResponseEntity.ok(ApiResponse.ok(service.getByBarcode(barcode))); }
    @GetMapping("/low-stock")         public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStock(@RequestParam String storeId)            { return ResponseEntity.ok(ApiResponse.ok(service.getLowStock(storeId))); }
    @GetMapping("/loss-items") @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
                                      public ResponseEntity<ApiResponse<List<ProductResponse>>> getLossItems()                                       { return ResponseEntity.ok(ApiResponse.ok(service.getLossItems())); }
    @PostMapping @PreAuthorize("hasAnyRole('ADMIN','OWNER','STAFF')")
                                      public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest req, Authentication auth) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Product created", service.create(req, auth.getName()))); }
    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
                                      public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable String id, @Valid @RequestBody ProductRequest req) { return ResponseEntity.ok(ApiResponse.ok("Product updated", service.update(id, req))); }
    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
                                      public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id)                                       { service.delete(id); return ResponseEntity.ok(ApiResponse.ok("Product deleted", null)); }
    @PostMapping("/stock/adjust") @PreAuthorize("hasAnyRole('ADMIN','OWNER','STAFF')")
                                      public ResponseEntity<ApiResponse<Void>> adjustStock(@RequestBody StockAdjustRequest req, Authentication auth)  { service.adjustStock(req, auth.getName()); return ResponseEntity.ok(ApiResponse.ok("Stock adjusted", null)); }
}
