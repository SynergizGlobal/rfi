package com.metro.rfisystem.backend.dto;

import org.springframework.web.multipart.MultipartFile;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttachmentDTO {

    private Long rfiId;
    private String description;
    private MultipartFile file;
}
