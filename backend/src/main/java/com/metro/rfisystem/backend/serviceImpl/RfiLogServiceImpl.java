package com.metro.rfisystem.backend.serviceImpl;

import java.util.List;

import org.springframework.stereotype.Service;
import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.RfiLogService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RfiLogServiceImpl implements RfiLogService {

	private final RFIRepository rfiRepository;
	
	
// RFI Log Filter.
	@Override
	public List<RfiLogDTO> listRfiDetailsByFilter(String project, String work, String contract) {
		return rfiRepository.listRfiLogByFilter(project, work, contract);
	}
	
//User Role based RfiLog data rendering..

	@Override
	public List<RfiLogDTO> listAllRfiLog(String userRole, String userName, String userId, String userType) {

		if ("IT Admin".equalsIgnoreCase(userRole)) {
			return rfiRepository.listAllRfiLogItAdmin();
		} else if ("DyHOD".equalsIgnoreCase(userType)) {

			return rfiRepository.listAllRfiLogByDyHod(userId);
		} else if ("Regular User".equalsIgnoreCase(userRole)) {

			return rfiRepository.listAllRfiLogByAssignedBy(userName);
		} else
			// Query for the Contractor if the above roles are !matched..
			return rfiRepository.listAllRfiLogByCreatedBy(userName);
	}

}
