package com.metro.rfisystem.backend.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String userId;
    private String userName;
    private String emailId;
    private String role;
    private String userRoleNameFk;
    private String userTypeFk;
    private String message;
    private String departmentFk;
    private String loginDepartment;
    private String designation;
    private List<AllowedContractDTO > allowedContracts;
    private List<ContractDesignationEngineersDTO> designationWithEngineers;


    
    public LoginResponse(String userId, String username,String emailId, String userRoleNameFk, String userTypeFk, String departmentFk, String loginDepartment,
    	List<AllowedContractDTO > allowedContracts,	List<ContractDesignationEngineersDTO> designationWithEngineers, String designation) {
        this.userId = userId;
        this.userName = username;
        this.emailId= emailId;
        this.userRoleNameFk = userRoleNameFk;
        this.userTypeFk= userTypeFk;
        this.message = "Login successful";
        this.departmentFk= departmentFk;
        this.loginDepartment = loginDepartment;
        this.allowedContracts = allowedContracts;
        this.designationWithEngineers= designationWithEngineers;
        this.designation = designation;

    }
}