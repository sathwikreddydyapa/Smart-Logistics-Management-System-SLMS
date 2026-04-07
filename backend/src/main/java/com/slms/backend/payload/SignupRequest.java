package com.slms.backend.payload;

import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String role; // "customer", "admin", "driver"
}
