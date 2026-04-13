package com.smartretail.controller;

import com.smartretail.dto.*;
import com.smartretail.service.ReportService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController @RequestMapping("/api/reports")
@RequiredArgsConstructor @Tag(name = "Reports & Analytics")
@SecurityRequirement(name = "Bearer Authentication")
public class ReportController {
    private final ReportService service;

    @GetMapping @PreAuthorize("hasAnyRole('ADMIN','OWNER')")
    public ResponseEntity<ApiResponse<ReportResponse>> getReport(
            @RequestParam String storeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(ApiResponse.ok(service.getReport(storeId, from, to)));
    }
}
