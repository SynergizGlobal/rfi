package com.metro.rfisystem.backend.service;

import java.util.List;

public interface RFIChecklistDescriptionService{
	
	public List<String> getUniqueOpenEnclosers();

	public List<String> getChecklistDescription(String enclosureName);
}
