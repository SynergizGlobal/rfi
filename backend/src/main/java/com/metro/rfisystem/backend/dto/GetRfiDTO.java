package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class GetRfiDTO {
	
	public String stringRfiId;
	public Long longRfiId;
	public Long longRfiValidateId;
	private String status;
	private String remarks;
	

}
