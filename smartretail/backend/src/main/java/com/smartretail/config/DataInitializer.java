package com.smartretail.config;

import com.smartretail.entity.*;
import com.smartretail.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * Seeds initial admin user + default store on first startup.
 * Safe to re-run — checks existence before inserting.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final StoreRepository storeRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seed admin user
        if (!userRepo.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .email("admin@smartretail.com")
                    .roles(Set.of("ROLE_ADMIN", "ROLE_OWNER"))
                    .enabled(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userRepo.save(admin);
            log.info("✅ Default admin user created  → username: admin  password: admin123");
        }

        // Seed default store
        if (storeRepo.findAll().isEmpty()) {
            userRepo.findByUsername("admin").ifPresent(admin -> {
                Store store = Store.builder()
                        .name("Main Store")
                        .address("123 Main Street")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .pincode("400001")
                        .phone("9999999999")
                        .email("store@smartretail.com")
                        .ownerId(admin.getId())
                        .createdAt(LocalDateTime.now())
                        .build();
                Store saved = storeRepo.save(store);
                log.info("✅ Default store created  → id: {}  name: {}", saved.getId(), saved.getName());
            });
        }
    }
}
