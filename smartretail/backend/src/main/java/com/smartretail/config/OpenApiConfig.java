package com.smartretail.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title       = "SmartRetail ERP API",
        version     = "1.0.0",
        description = "Complete REST API for SmartRetail ERP — POS, Inventory, Orders, Reports"
    )
)
@SecurityScheme(
    name         = "Bearer Authentication",
    type         = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme       = "bearer",
    in           = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
