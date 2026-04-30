package com.elibrary;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class ELibraryApplication {public static void main(String[] args) {
        SpringApplication.run(ELibraryApplication.class, args);
        System.out.println("✅ E-Library Backend started successfully on port 8080!");
    }
@Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        // Allow web frontend
                        .allowedOrigins(
                            "http://localhost:3000", 
                            "http://localhost:3001",
                            "https://localhost",      // Capacitor Android
                            "capacitor://localhost"   // Capacitor iOS/General
                        )
                        // Allow Android requests (no origin header or patterns)
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .exposedHeaders("Authorization", "Content-Type")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
    }
}
