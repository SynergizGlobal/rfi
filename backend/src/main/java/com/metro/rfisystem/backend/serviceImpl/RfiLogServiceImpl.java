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

//User Role based RfiLog data rendering..

	@Override
	public List<RfiLogDTO> listAllRfiLog(String userRole, String userName, String userId, String userType,
			String deparmentFK) {

		if ("IT Admin".equalsIgnoreCase(userRole)) {
			System.out.println("IT Admin.......");
			return rfiRepository.listAllRfiLogItAdmin();
		} else if ("DyHOD".equalsIgnoreCase(userType)) {
			System.out.println("IDyHOD......");

			return rfiRepository.listAllRfiLogByDyHod(userId);
		} else if ("Engg".equalsIgnoreCase(deparmentFK)) {
			System.out.println("Engineer......");
			return rfiRepository.listAllRfiLogByAssignedBy(userName);
		} else
			System.out.println("Contrator...... :");
		// Query for the Contractor if the above roles are !matched..
		return rfiRepository.listAllRfiLogByCreatedBy(userName);
	}

}
