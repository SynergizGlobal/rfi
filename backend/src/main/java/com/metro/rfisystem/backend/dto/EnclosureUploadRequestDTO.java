package com.metro.rfisystem.backend.dto;


import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class EnclosureUploadRequestDTO {
	
    private String rfiId;
    private MultipartFile file;
}

