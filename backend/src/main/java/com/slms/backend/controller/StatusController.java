package com.slms.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class StatusController {

    @GetMapping("/")
    public Map<String, String> getRootStatus() {
        return Map.of(
            "status", "online",
            "message", "Smart Logistics Management System (SLMS) Backend is running",
            "version", "1.0.0"
        );
    }

    @GetMapping("/api/status")
    public Map<String, String> getApiStatus() {
        return Map.of(
            "status", "ready",
            "service", "SLMS API"
        );
    }
}
