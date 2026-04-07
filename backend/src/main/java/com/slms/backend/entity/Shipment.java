package com.slms.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Data
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String pickupLocation;
    private String dropLocation;
    private String packageDetails;
    private String status; // "Pending", "Picked Up", "In Transit", "Delivered"

    private Long assignedDriverId;
    private Long customerId;
    
    private Double deliveryCost;
    private LocalDateTime estimatedDeliveryTime;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
