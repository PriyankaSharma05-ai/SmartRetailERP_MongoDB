package com.smartretail.service;

import com.smartretail.dto.*;
import com.smartretail.entity.*;
import com.smartretail.exception.*;
import com.smartretail.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepo;
    private final OrderRepository orderRepo;

    public List<CustomerResponse> getAll() {
        return customerRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CustomerResponse getById(String id) {
        return toResponse(customerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id)));
    }

    public List<CustomerResponse> search(String query) {
        return customerRepo.search(query).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CustomerResponse create(CustomerRequest req) {
        if (customerRepo.existsByPhone(req.getPhone()))
            throw new BusinessException("Customer already exists with phone: " + req.getPhone());
        Customer c = Customer.builder()
                .name(req.getName()).phone(req.getPhone()).email(req.getEmail())
                .address(req.getAddress()).city(req.getCity())
                .createdAt(LocalDateTime.now()).build();
        return toResponse(customerRepo.save(c));
    }

    public CustomerResponse update(String id, CustomerRequest req) {
        Customer c = customerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
        c.setName(req.getName()); c.setEmail(req.getEmail());
        c.setAddress(req.getAddress()); c.setCity(req.getCity());
        return toResponse(customerRepo.save(c));
    }

    public CustomerResponse toResponse(Customer c) {
        List<Order> orders = orderRepo.findByCustomerId(c.getId());
        BigDecimal totalSpent = orders.stream()
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return CustomerResponse.builder()
                .id(c.getId()).name(c.getName()).phone(c.getPhone()).email(c.getEmail())
                .address(c.getAddress()).city(c.getCity()).loyaltyPoints(c.getLoyaltyPoints())
                .totalOrders((long) orders.size()).totalSpent(totalSpent).createdAt(c.getCreatedAt())
                .build();
    }
}
