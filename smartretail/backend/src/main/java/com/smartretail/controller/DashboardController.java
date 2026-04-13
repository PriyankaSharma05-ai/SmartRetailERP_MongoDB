package com.smartretail.controller;

import com.smartretail.dto.*;
import com.smartretail.service.DashboardService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/dashboard")
@RequiredArgsConstructor @Tag(name = "Dashboard")
@SecurityRequirement(name = "Bearer Authentication")
public class DashboardController {
    private final DashboardService service;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboard(@RequestParam String storeId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getDashboardStats(storeId)));
    }
}
