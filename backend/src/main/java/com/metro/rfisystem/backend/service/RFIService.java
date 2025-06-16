package com.metro.rfisystem.backend.service;

import java.util.List;


import com.metro.rfisystem.backend.dto.RFI_DTO;
import com.metro.rfisystem.backend.model.rfi.RFI;



public interface RFIService {
    RFI createRFI(RFI_DTO dto);
    
    public List<String> getDistinctProjectNames();
}