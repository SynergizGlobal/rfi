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
	public long longRfiId;
	public long longRfiValidateId;
	

}
