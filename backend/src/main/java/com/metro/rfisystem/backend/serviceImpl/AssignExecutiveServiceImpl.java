package com.metro.rfisystem.backend.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

import com.metro.rfisystem.backend.dto.AssignExecutiveResponse;
import com.metro.rfisystem.backend.model.rfi.AssignExecutiveLog;
import com.metro.rfisystem.backend.repository.rfi.AssignExecutiveLogRepository;
import com.metro.rfisystem.backend.service.AssignExecutiveService;

public class AssignExecutiveServiceImpl implements  AssignExecutiveService {
	
    @Autowired
    private AssignExecutiveLogRepository assignExecutiveRepository;

	@Override
	public boolean saveAssignment(AssignExecutiveLog log) {
        try {
        	assignExecutiveRepository.save(log);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

	@Override
	public List<AssignExecutiveResponse> getAllAssignments() {
	    return assignExecutiveRepository.findAllByOrderByAssignedAtDesc()
	            .stream()
	            .map(log -> new AssignExecutiveResponse(
	                    log.getContract(),
	                    log.getStructureType(),
	                    log.getStructure(),
	                    log.getAssignedPersonClient()))
	            .collect(Collectors.toList());
	}


}
