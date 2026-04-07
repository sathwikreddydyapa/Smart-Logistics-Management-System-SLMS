package com.slms.backend.repository;

import com.slms.backend.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShipmentRepository extends JpaRepository<Shipment, String> {
    List<Shipment> findByCustomerId(Long customerId);
    List<Shipment> findByAssignedDriverId(Long driverId);
}
