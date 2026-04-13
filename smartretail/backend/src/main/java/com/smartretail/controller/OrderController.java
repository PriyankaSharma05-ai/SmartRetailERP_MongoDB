package com.smartretail.controller;

import com.smartretail.dto.*;
import com.smartretail.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController @RequestMapping("/api/orders")
@RequiredArgsConstructor @Tag(name = "Orders / POS Billing")
@SecurityRequirement(name = "Bearer Authentication")
public class OrderController {
    private final OrderService service;

    @PostMapping @Operation(summary = "Create a new order (POS billing)")
    public ResponseEntity<ApiResponse<OrderResponse>> create(@Valid @RequestBody OrderRequest req, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Order created", service.createOrder(req, auth.getName())));
    }
    @GetMapping                        public ResponseEntity<ApiResponse<List<OrderResponse>>> getByStore(@RequestParam String storeId)                { return ResponseEntity.ok(ApiResponse.ok(service.getOrdersByStore(storeId))); }
    @GetMapping("/{invoiceNumber}")     public ResponseEntity<ApiResponse<OrderResponse>> getByInvoice(@PathVariable String invoiceNumber)             { return ResponseEntity.ok(ApiResponse.ok(service.getByInvoiceNumber(invoiceNumber))); }
    @GetMapping("/customer/{id}")       public ResponseEntity<ApiResponse<List<OrderResponse>>> getByCustomer(@PathVariable String id)                  { return ResponseEntity.ok(ApiResponse.ok(service.getByCustomer(id))); }
    @GetMapping("/pending-due")         public ResponseEntity<ApiResponse<List<OrderResponse>>> getPendingDue(@RequestParam String storeId)              { return ResponseEntity.ok(ApiResponse.ok(service.getPendingDue(storeId))); }
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getByDateRange(
            @RequestParam String storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(ApiResponse.ok(service.getOrdersByDateRange(storeId, from, to)));
    }
    @PostMapping("/{orderId}/return") @Operation(summary = "Process return/refund")
    public ResponseEntity<ApiResponse<String>> processReturn(
            @PathVariable String orderId, @RequestParam String productId,
            @RequestParam int quantity, @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.ok(service.processReturn(orderId, productId, quantity, reason)));
    }
}
