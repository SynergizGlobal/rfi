package com.metro.rfisystem.backend.dto;

import java.util.List;

import lombok.Data;

@Data
public class ContractDesignationEngineersDTO {
	
	  private String designation;
	    private String contractId;
	    private List<String> engineerUsernames;
	    
	    public ContractDesignationEngineersDTO(String designation, String contractId, List<String> engineerUsernames) {
	        this.designation = designation;
	        this.contractId = contractId;
	        this.engineerUsernames = engineerUsernames;
	    }

}
