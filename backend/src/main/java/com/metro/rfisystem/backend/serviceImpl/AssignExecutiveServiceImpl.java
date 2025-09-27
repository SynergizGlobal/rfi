package com.metro.rfisystem.backend.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.metro.rfisystem.backend.dto.AssignExecutiveRequest;
import com.metro.rfisystem.backend.dto.AssignExecutiveResponse;
import com.metro.rfisystem.backend.model.rfi.AssignExecutiveLog;
import com.metro.rfisystem.backend.repository.rfi.AssignExecutiveLogRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.AssignExecutiveService;

import jakarta.transaction.Transactional;

@Service
public class AssignExecutiveServiceImpl implements  AssignExecutiveService {
	
    @Autowired
    private AssignExecutiveLogRepository assignExecutiveRepository;
    
    @Autowired
    private RFIRepository rfiRepository;
   
    @Override
    public List<Long> getFilteredOpenedRfiIds(String structureType, String structure,String ContractId) {
        return assignExecutiveRepository.getRfiIdsByStructureTypeAndStructure(structureType, structure,ContractId);
    }

    @Override
    @Transactional
    public void assignExecutives(List<Long> ids, AssignExecutiveRequest request) {
        if (!ids.isEmpty()) {
            rfiRepository.bulkUpdateAssignedExecutive(
                request.getUserId(),
                request.getDepartment(),
                request.getAssignedPersonClient(),
                ids
            );
        }
    }

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
	    return assignExecutiveRepository.findLatestAssignments()
	            .stream()
	            .map(log -> new AssignExecutiveResponse(
	                    log.getContract(),
	                    log.getStructureType(),
	                    log.getStructure(),
	                    log.getAssignedPersonClient()))
	            .collect(Collectors.toList());
	}


}
