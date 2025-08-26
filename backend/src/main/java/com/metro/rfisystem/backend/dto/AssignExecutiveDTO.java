package com.metro.rfisystem.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignExecutiveDTO {
	
    private List<Integer> rfiIds;   
    private String executive;
    private String department;

}
