package com.smartretail.service;

import com.smartretail.dto.*;
import com.smartretail.entity.*;
import com.smartretail.exception.BusinessException;
import com.smartretail.repository.*;
import com.smartretail.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    public LoginResponse login(LoginRequest req) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(req.getUsername());
        String token = jwtUtils.generateToken(userDetails);

        User user = userRepo.findByUsername(req.getUsername()).orElseThrow();
        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .roles(new ArrayList<>(user.getRoles()))
                .build();
    }

    public String register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new BusinessException("Username already taken: " + req.getUsername());
        if (req.getEmail() != null && userRepo.existsByEmail(req.getEmail()))
            throw new BusinessException("Email already registered: " + req.getEmail());

        Set<String> roles = new HashSet<>();
        if (req.getRoles() == null || req.getRoles().isEmpty()) {
            roles.add("ROLE_STAFF");
        } else {
            roles.addAll(req.getRoles());
        }

        User user = User.builder()
                .username(req.getUsername())
                .password(encoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .roles(roles)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        userRepo.save(user);
        return "User registered successfully";
    }
}
