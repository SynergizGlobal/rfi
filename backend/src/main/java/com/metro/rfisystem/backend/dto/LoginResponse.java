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
    private String userRoleNameFk;
    private String userTypeFk;
    private String message;
    
    public LoginResponse(String userId, String username, String userRoleNameFk, String userTypeFk) {
        this.userId = userId;
        this.userName = username;
        this.userRoleNameFk = userRoleNameFk;
        this.userTypeFk= userTypeFk;
        this.message = "Login successful";
    }
}