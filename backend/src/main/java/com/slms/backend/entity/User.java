package com.slms.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // "admin", "driver", "customer"
    
    private String phoneNumber;
    private String address;
    private String bio;
    private Double earnings = 0.0;
    private String profilePic;
}
