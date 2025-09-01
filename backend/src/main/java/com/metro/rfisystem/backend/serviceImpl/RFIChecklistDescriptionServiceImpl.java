package com.metro.rfisystem.backend.serviceImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.metro.rfisystem.backend.dto.ChecklistDTO;
import com.metro.rfisystem.backend.repository.rfi.RFIChecklistDescriptionRepository;
import com.metro.rfisystem.backend.service.RFIChecklistDescriptionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RFIChecklistDescriptionServiceImpl implements RFIChecklistDescriptionService {

	
	    private final RFIChecklistDescriptionRepository repository;
	
	
	@Override
	public List<ChecklistDTO> getChecklists(String enclosername) {
		
		// return repository.findAllWithConditionalChecklistDescription(enclosername);
		return null;
	}

	@Override
	public List<String> getUniqueOpenEnclosers() {
		
		return repository.findUniqueOpenEncloserNames();
	}

	@Override
	public List<String> getChecklistDescription(String enclosureName) {
		return repository.getChecklistDescription(enclosureName);
	}

}
