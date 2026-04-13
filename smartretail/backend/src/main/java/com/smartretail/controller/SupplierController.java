package com.smartretail.controller;

import com.smartretail.dto.*;
import com.smartretail.service.SupplierService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController @RequestMapping("/api/suppliers")
@RequiredArgsConstructor @Tag(name = "Suppliers")
@SecurityRequirement(name = "Bearer Authentication")
public class SupplierController {
    private final SupplierService service;

    @GetMapping                     public ResponseEntity<ApiResponse<List<SupplierResponse>>> getAll()                                               { return ResponseEntity.ok(ApiResponse.ok(service.getAll())); }
    @GetMapping("/{id}")            public ResponseEntity<ApiResponse<SupplierResponse>> getById(@PathVariable String id)                             { return ResponseEntity.ok(ApiResponse.ok(service.getById(id))); }
    @PostMapping @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
                                    public ResponseEntity<ApiResponse<SupplierResponse>> create(@Valid @RequestBody SupplierRequest req)               { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Supplier created", service.create(req))); }
    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
                                    public ResponseEntity<ApiResponse<SupplierResponse>> update(@PathVariable String id, @Valid @RequestBody SupplierRequest req) { return ResponseEntity.ok(ApiResponse.ok("Supplier updated", service.update(id, req))); }
    @PostMapping("/{id}/payment") @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
                                    public ResponseEntity<ApiResponse<String>> recordPayment(@PathVariable String id, @RequestParam BigDecimal amount) { return ResponseEntity.ok(ApiResponse.ok(service.recordPayment(id, amount))); }
}
