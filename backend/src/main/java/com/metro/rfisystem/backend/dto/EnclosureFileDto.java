package com.metro.rfisystem.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnclosureFileDto {
    private String enclosureName;
    private List<String> files;
}
