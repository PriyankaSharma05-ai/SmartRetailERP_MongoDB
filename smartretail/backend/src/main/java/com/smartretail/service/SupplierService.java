package com.smartretail.service;

import com.smartretail.dto.*;
import com.smartretail.entity.Supplier;
import com.smartretail.exception.*;
import com.smartretail.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepo;

    public List<SupplierResponse> getAll() {
        return supplierRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public SupplierResponse getById(String id) {
        return toResponse(supplierRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id)));
    }

    public SupplierResponse create(SupplierRequest req) {
        Supplier s = Supplier.builder()
                .name(req.getName()).contactName(req.getContactName()).phone(req.getPhone())
                .email(req.getEmail()).address(req.getAddress()).city(req.getCity())
                .gstNumber(req.getGstNumber()).createdAt(LocalDateTime.now()).build();
        return toResponse(supplierRepo.save(s));
    }

    public SupplierResponse update(String id, SupplierRequest req) {
        Supplier s = supplierRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
        s.setName(req.getName()); s.setContactName(req.getContactName());
        s.setPhone(req.getPhone()); s.setEmail(req.getEmail());
        s.setAddress(req.getAddress()); s.setCity(req.getCity());
        return toResponse(supplierRepo.save(s));
    }

    public String recordPayment(String id, BigDecimal amount) {
        Supplier s = supplierRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
        BigDecimal newBalance = s.getBalanceDue().subtract(amount).max(BigDecimal.ZERO);
        s.setBalanceDue(newBalance);
        supplierRepo.save(s);
        return "Payment of Rs." + amount + " recorded. New balance: Rs." + newBalance;
    }

    public SupplierResponse toResponse(Supplier s) {
        return SupplierResponse.builder()
                .id(s.getId()).name(s.getName()).contactName(s.getContactName())
                .phone(s.getPhone()).email(s.getEmail()).city(s.getCity())
                .gstNumber(s.getGstNumber()).balanceDue(s.getBalanceDue())
                .status(s.getStatus().name()).createdAt(s.getCreatedAt()).build();
    }
}
