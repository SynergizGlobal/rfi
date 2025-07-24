package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AllowedContractDTO  {
	private String contractId;
	private String designation;
	
	
	public AllowedContractDTO(String contractId) {
        this.contractId = contractId;
    }
}
