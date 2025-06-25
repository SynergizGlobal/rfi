package com.metro.rfisystem.backend.dto;

import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.constants.EnumValidation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RfiValidateDTO {
    private Long long_rfi_id;
    private Long long_rfi_validate_id;
    private String remarks;
    private EnumValidation action;
    private MultipartFile file; 
}