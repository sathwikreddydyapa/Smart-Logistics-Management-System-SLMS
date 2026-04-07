package com.slms.backend.controller;

import com.slms.backend.entity.Shipment;
import com.slms.backend.repository.ShipmentRepository;
import com.slms.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    @Autowired
    ShipmentRepository shipmentRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping("/all")
    public ResponseEntity<?> getAllShipments() {
        return ResponseEntity.ok(shipmentRepository.findAll());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getCustomerShipments(@PathVariable Long customerId) {
        return ResponseEntity.ok(shipmentRepository.findByCustomerId(customerId));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<?> getDriverShipments(@PathVariable Long driverId) {
        return ResponseEntity.ok(shipmentRepository.findByAssignedDriverId(driverId));
    }
    
    @GetMapping("/track/{id}")
    public ResponseEntity<?> trackShipment(@PathVariable String id) {
        return shipmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createShipment(@RequestBody Shipment shipment) {
        if(shipment.getStatus() == null || shipment.getStatus().isEmpty()) {
            shipment.setStatus("Pending");
        }
        
        // Startup Logic: Generate Delivery Cost (Distance Sim)
        double baseRate = 15.0;
        double randomMultiplier = 5.0 + (Math.random() * 35.0);
        shipment.setDeliveryCost(Math.round((baseRate + randomMultiplier) * 100.0) / 100.0);
        
        // Startup Logic: Generate ETA (Now + 4 Days)
        shipment.setEstimatedDeliveryTime(java.time.LocalDateTime.now().plusDays(4));
        
        Shipment savedShipment = shipmentRepository.save(shipment);
        return ResponseEntity.ok(savedShipment);
    }

    @PutMapping("/update-status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        Shipment shipment = shipmentRepository.findById(id).orElseThrow();
        String newStatus = payload.get("status");
        
        // Startup Logic: Payout on Delivery
        if ("Delivered".equals(newStatus) && !"Delivered".equals(shipment.getStatus())) {
            Long driverId = shipment.getAssignedDriverId();
            if (driverId != null) {
                com.slms.backend.entity.User driver = userRepository.findById(driverId).orElse(null);
                if (driver != null) {
                    double payout = (shipment.getDeliveryCost() != null ? shipment.getDeliveryCost() : 0.0) * 0.8;
                    double currentEarnings = driver.getEarnings() != null ? driver.getEarnings() : 0.0;
                    driver.setEarnings(currentEarnings + payout);
                    userRepository.save(driver);
                }
            }
        }
        
        shipment.setStatus(newStatus);
        shipmentRepository.save(shipment);
        return ResponseEntity.ok(shipment);
    }

    @PutMapping("/assign-driver/{id}")
    public ResponseEntity<?> assignDriver(@PathVariable String id, @RequestBody Map<String, Long> payload) {
        Shipment shipment = shipmentRepository.findById(id).orElseThrow();
        shipment.setAssignedDriverId(payload.get("driverId"));
        shipmentRepository.save(shipment);
        return ResponseEntity.ok(shipment);
    }
    
    @GetMapping("/drivers")
    public ResponseEntity<?> getAllDrivers() {
        return ResponseEntity.ok(userRepository.findByRole("driver"));
    }

    @GetMapping("/recommend-driver/{id}")
    public ResponseEntity<?> recommendDriver(@PathVariable String id) {
        java.util.List<com.slms.backend.entity.User> drivers = userRepository.findByRole("driver");
        com.slms.backend.entity.User recommended = null;
        long minWorkload = Long.MAX_VALUE;

        for (com.slms.backend.entity.User driver : drivers) {
            long workload = shipmentRepository.findByAssignedDriverId(driver.getId())
                    .stream()
                    .filter(s -> !"Delivered".equals(s.getStatus()) && !"Cancelled".equals(s.getStatus()))
                    .count();
            
            if (workload < minWorkload) {
                minWorkload = workload;
                recommended = driver;
            }
        }

        return recommended != null ? ResponseEntity.ok(recommended) : ResponseEntity.notFound().build();
    }
}
