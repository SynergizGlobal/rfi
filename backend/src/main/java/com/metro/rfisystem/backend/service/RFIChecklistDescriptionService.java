package com.metro.rfisystem.backend.service;

import java.util.List;

import com.metro.rfisystem.backend.dto.ChecklistDTO;

public interface RFIChecklistDescriptionService{
	
	public List<String> getUniqueOpenEnclosers();

	public List<String> getChecklistDescription(String enclosureName);
	 public List<ChecklistDTO> getChecklists(String enclosername);
}
