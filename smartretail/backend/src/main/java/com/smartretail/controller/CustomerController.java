package com.smartretail.controller;

import com.smartretail.dto.*;
import com.smartretail.service.CustomerService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/customers")
@RequiredArgsConstructor @Tag(name = "Customers")
@SecurityRequirement(name = "Bearer Authentication")
public class CustomerController {
    private final CustomerService service;

    @GetMapping                  public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAll()          { return ResponseEntity.ok(ApiResponse.ok(service.getAll())); }
    @GetMapping("/{id}")         public ResponseEntity<ApiResponse<CustomerResponse>> getById(@PathVariable String id)          { return ResponseEntity.ok(ApiResponse.ok(service.getById(id))); }
    @GetMapping("/search")       public ResponseEntity<ApiResponse<List<CustomerResponse>>> search(@RequestParam String q)       { return ResponseEntity.ok(ApiResponse.ok(service.search(q))); }
    @PostMapping                 public ResponseEntity<ApiResponse<CustomerResponse>> create(@Valid @RequestBody CustomerRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Customer created", service.create(req))); }
    @PutMapping("/{id}")         public ResponseEntity<ApiResponse<CustomerResponse>> update(@PathVariable String id, @Valid @RequestBody CustomerRequest req) { return ResponseEntity.ok(ApiResponse.ok("Customer updated", service.update(id, req))); }
}
