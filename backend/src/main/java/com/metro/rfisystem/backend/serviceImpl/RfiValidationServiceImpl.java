package com.metro.rfisystem.backend.serviceImpl;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.dto.ChecklistItemDTO;
import com.metro.rfisystem.backend.dto.EnclosureDTO;
import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.MeasurementDTO;
import com.metro.rfisystem.backend.dto.RfiDetailsDTO;
import com.metro.rfisystem.backend.dto.RfiReportDTO;
import com.metro.rfisystem.backend.dto.RfiStatusProjection;
import com.metro.rfisystem.backend.dto.RfiValidateDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RfiValidation;
import com.metro.rfisystem.backend.repository.rfi.ChecklistDescriptionRepository;
import com.metro.rfisystem.backend.repository.rfi.MeasurementsRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIEnclosureRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.repository.rfi.RfiValidationRepository;
import com.metro.rfisystem.backend.service.RfiValidationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RfiValidationServiceImpl implements RfiValidationService {


	private final RFIRepository rfiRepository;
	private final RfiValidationRepository rfiValidationRepository;
	private final ChecklistDescriptionRepository checklistDescriptionRepository;
	private final RFIEnclosureRepository enclosureRepository;
	private final MeasurementsRepository measurementsRepository;

	@Autowired
	private EmailService emailService;

	@Override
	public List<GetRfiDTO> showValidations(String UserRole, String UserType, String UserId, String Department,
			String UserName) {

		boolean isAdmin = UserRole != null && ("IT Admin".equalsIgnoreCase(UserRole)
				|| ("Data Admin").equalsIgnoreCase(UserRole));

		boolean isDyHod = UserType != null && "DyHOD".equalsIgnoreCase(UserType);
		
		boolean isEngineer = !StringUtils.isEmpty(UserName) && ("Engg").equalsIgnoreCase(Department);
		if (isAdmin || isDyHod) {
			return rfiRepository.showRfiValidationsItAdmin();
		}
//		else if (isDyHod) {
//			return rfiRepository.showRfiValidationsDyHod(UserId);
//		}
			else if (isEngineer)
		{
			return rfiRepository.showRfiValidationsAssignedBy(UserName);
		}
		else return null;
	}

	@Override
	@Transactional
	public boolean validateRfi(RfiValidateDTO dto) {
		
		boolean success = false;
		Optional<RFI> rfiOpt = rfiRepository.findById(dto.getLong_rfi_id());
		Optional<RfiValidation> valOpt = rfiValidationRepository.findById(dto.getLong_rfi_validate_id());
		if (rfiOpt.isEmpty() || valOpt.isEmpty()) {
			throw new RuntimeException("Invalid RFI or Validation ID.");
		}
		RFI rfi = rfiOpt.get();
		RfiValidation validation = valOpt.get();
		rfi.setStatus(EnumRfiStatus.INSPECTION_DONE);
		rfiRepository.save(rfi);
		validation.setRemarks(dto.getRemarks());
		validation.setEnumValidation(dto.getAction());
        validation.setComment(dto.getComment());
		rfiValidationRepository.save(validation);
		emailService.sendValidationMail(rfi, validation);
		success = true;
		return success;

	}

	
	@Override
	public RfiDetailsDTO getRfiPreview(Long rfiId) {
		List<RfiReportDTO> reportList = rfiRepository.getRfiReportDetails(rfiId);
		RfiReportDTO report = reportList.isEmpty() ? null : reportList.get(0);
		Optional<MeasurementDTO> measurementDetails = measurementsRepository.findMeasurementByRfiId(rfiId);

		List<ChecklistItemDTO> checklist = checklistDescriptionRepository.findChecklistItemsByRfiId(rfiId);
		List<EnclosureDTO> enclosures = enclosureRepository.findEnclosuresByRfiId(rfiId);

		return new RfiDetailsDTO(report, checklist, enclosures,measurementDetails);
	}

	@Override
	@Transactional
	public String sendRfiForValidation(Long rfiId) {
		Optional<RfiStatusProjection> rfiProjOpt = rfiRepository.findStatusById(rfiId);

		if (rfiProjOpt.isEmpty()) {
			return "RFI not found.";
		}
		RfiStatusProjection rfi = rfiProjOpt.get();
		System.out.println("RFI ID: " + rfi.getId() + ", Status: " + rfi.getStatus() + ", Approval Status: "
				+ rfi.getApprovalStatus());

		if (EnumRfiStatus.VALIDATION_PENDING.name().equalsIgnoreCase(rfi.getStatus())) {
			return "RFI has already been sent for validation.";
		}

		if (EnumRfiStatus.INSPECTION_DONE.name().equalsIgnoreCase(rfi.getStatus())) {
			return "RFI has already been Closed.";
		}

		if (!EnumRfiStatus.INSPECTED_BY_AE.name().equalsIgnoreCase(rfi.getStatus())) {
			return "RFI has not been inspected yet by the engineer.";
		}

		if (rfi.getApprovalStatus() == null) {
			return "Inspection Approval Status By Engineer is Pending...";
		}

		if (!"Accepted".equalsIgnoreCase(rfi.getApprovalStatus())) {
			return "Inspection was rejected  by the engineer.";
		}

		RFI fullRfi = rfiRepository.findById(rfi.getId()).orElseThrow(() -> new RuntimeException("RFI not found"));

		fullRfi.setStatus(EnumRfiStatus.VALIDATION_PENDING);

		RfiValidation validation = new RfiValidation();
		validation.setRfi(fullRfi);
		validation.setSentForValidationAt(LocalDateTime.now());

		fullRfi.setRfiValidation(validation);
		rfiRepository.save(fullRfi);

		return "RFI sent for validation successfully.";
	}

}