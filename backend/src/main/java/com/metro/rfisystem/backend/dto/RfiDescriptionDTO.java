package com.metro.rfisystem.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RfiDescriptionDTO {

	private String rfiDescription;
    private List<String> enclosures;
	
	

}
