package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String userId;
    private String userName;
    private String role;
    private String message;
    
    public LoginResponse(String userId, String username, String role) {
        this.userId = userId;
        this.userName = username;
        this.role = role;
        this.message = "Login successful";
    }
}