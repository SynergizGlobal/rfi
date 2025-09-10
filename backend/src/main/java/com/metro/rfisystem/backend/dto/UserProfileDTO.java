package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDTO {
    private String name;        
    private String role;          
    private String email;         
    private String phone;         
    private String personalNumber;
    private String userRole;      
    private String userType;      
    private String department;   
    private String reportingTo;   
    private String landLine;      
    private String extension;     
    private String pmisKey;       
}