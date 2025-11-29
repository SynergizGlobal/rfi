package com.metro.rfisystem.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminRfiResponse {
	   private List<RfiListDTO> allRFIs;
	    private List<String> representatives;

}
