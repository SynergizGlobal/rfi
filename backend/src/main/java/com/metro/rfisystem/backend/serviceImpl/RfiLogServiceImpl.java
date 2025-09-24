package com.metro.rfisystem.backend.serviceImpl;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.metro.rfisystem.backend.dto.ChecklistItemDTO;
import com.metro.rfisystem.backend.dto.EnclosureDTO;
import com.metro.rfisystem.backend.dto.MeasurementDTO;
import com.metro.rfisystem.backend.dto.RfiDetailsLogDTO;
import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.dto.RfiLogWrappedDTO;
import com.metro.rfisystem.backend.repository.pmis.UserRepository;
import com.metro.rfisystem.backend.repository.rfi.ChecklistDescriptionRepository;
import com.metro.rfisystem.backend.repository.rfi.MeasurementsRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIEnclosureRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.RfiLogService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RfiLogServiceImpl implements RfiLogService {

	private final RFIRepository rfiRepository;
	private final ChecklistDescriptionRepository checklistDescriptionRepository;
	private final RFIEnclosureRepository enclosureRepository;
	private final MeasurementsRepository measurementsRepository;
	private final UserRepository userRepository;


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
		} else if ("Regular User".equalsIgnoreCase(userRole)) { 
	        System.out.println("Representative / Regular User......");
	        return rfiRepository.listAllRfiLogByRepresentative(userName);

	    } 
		else
			System.out.println("Contrator...... :");
		return rfiRepository.listAllRfiLogByCreatedBy(userName);
	}
	


	@Override
	public RfiLogWrappedDTO getRfiDetails(Long rfiId) {
		List<RfiDetailsLogDTO> reportList = rfiRepository.getRfiReportDetailsRfiLog(rfiId);
		RfiDetailsLogDTO report = reportList.isEmpty() ? null : reportList.get(0);
		Optional<MeasurementDTO> measurementDetails = measurementsRepository.findMeasurementByRfiId(rfiId);
		if(report.getDyHodUserId() != null) {
		String DyHodUserName = userRepository.findUserNameByUserId(report.getDyHodUserId());
		report.setDyHodUserName(DyHodUserName);
		}
		List<ChecklistItemDTO> checklist = checklistDescriptionRepository.findChecklistItemsByRfiId(rfiId);
		List<EnclosureDTO> enclosures = enclosureRepository.findEnclosuresByRfiId(rfiId);

		return new RfiLogWrappedDTO(report, checklist, enclosures,measurementDetails);
	}

}
