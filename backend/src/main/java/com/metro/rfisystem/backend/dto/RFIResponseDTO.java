package com.metro.rfisystem.backend.dto;

import lombok.Data;

@Data
public class RFIResponseDTO {

	 private Long id;
	    private String rfi_Id;
	    
	    public RFIResponseDTO(Long id, String rfi_Id) {
	        this.id = id;
	        this.rfi_Id = rfi_Id;
	    }

}
