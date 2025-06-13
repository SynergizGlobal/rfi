package com.metro.rfisystem.backend.controller;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metro.rfisystem.backend.dto.RFI_DTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.service.RFIService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/rfi")
@RequiredArgsConstructor
public class RFIController {

    
    private final RFIService rfiService;

    @PostMapping("/create")
    public ResponseEntity<String> createRFI(@RequestBody RFI_DTO dto) {
        RFI saved = rfiService.createRFI(dto);
        return ResponseEntity.ok("RFI created successfully with ID: " + saved.getId());
    }
}

