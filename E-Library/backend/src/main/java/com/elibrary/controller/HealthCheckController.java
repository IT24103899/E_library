package com.elibrary.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthCheckController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "E-Library Backend is running");
        response.put("timestamp", System.currentTimeMillis());
        response.put("version", "1.0.0");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> readinessCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("ready", true);
        response.put("service", "elibrary-backend");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
}
