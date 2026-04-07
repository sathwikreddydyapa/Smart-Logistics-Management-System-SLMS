package com.slms.backend.controller;

import com.slms.backend.entity.Shipment;
import com.slms.backend.repository.ShipmentRepository;
import com.slms.backend.service.GoogleDriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    GoogleDriveService googleDriveService;

    @Autowired
    ShipmentRepository shipmentRepository;

    @PostMapping("/upload-proof/{shipmentId}")
    public ResponseEntity<?> uploadProof(@PathVariable String shipmentId, @RequestParam("file") MultipartFile file) {
        try {
            // 1. Upload to 5TB Google One Drive
            String fileUrl = googleDriveService.uploadFileToShipmentFolder(shipmentId, file);

            // 2. Link to Shipment Entity (Update details)
            Shipment shipment = shipmentRepository.findById(shipmentId).orElseThrow();
            String currentDetails = shipment.getPackageDetails();
            shipment.setPackageDetails(currentDetails + " | Proof: " + fileUrl);
            shipmentRepository.save(shipment);

            return ResponseEntity.ok(Map.of("message", "Proof uploaded successfully", "url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
