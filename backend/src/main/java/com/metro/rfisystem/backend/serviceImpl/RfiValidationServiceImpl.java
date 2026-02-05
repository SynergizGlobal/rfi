package com.metro.rfisystem.backend.serviceImpl;

import java.awt.Color;
import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.commons.lang3.StringUtils;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.constants.EnumValidation;
import com.metro.rfisystem.backend.dto.AttachmentFileDTO;
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
	
    @Value("${rfi.pdf.storage-path}")
    private String pdfStoragePath;


	@Autowired
	private EmailService emailService;

	@Override
	public List<GetRfiDTO> showValidations(String UserRole, String UserType, String UserId, String Department,
			String UserName, String designation) {
		boolean isEnggAuthority = UserRole != null
				&& ("Engg".equalsIgnoreCase(Department) && ("Data Admin").equalsIgnoreCase(UserRole))
				&& (!designation.equalsIgnoreCase("Project Engineer")
						&& (!("Regular User").equalsIgnoreCase(UserRole)));

		boolean isAdmin = UserRole != null && ("IT Admin".equalsIgnoreCase(UserRole)
				|| ("Data Admin").equalsIgnoreCase(UserRole) && !"Engg".equalsIgnoreCase(Department));

		boolean isDyHod = UserType != null && "DyHOD".equalsIgnoreCase(UserType);

		boolean isProjEngg = !StringUtils.isEmpty(UserName) && ("Engg").equalsIgnoreCase(Department);

		if (isAdmin) {
			return rfiRepository.showRfiValidationsItAdmin();
		} else if (isDyHod) {
			return rfiRepository.showRfiValidationsDyHod(UserId);
		} else if (isEnggAuthority) {
			return rfiRepository.showRfiValidationsEnggAuth(UserName);
		} else if (isProjEngg) {
			return rfiRepository.showRfiValidationsAssignedBy(UserName);
		} else
			return null;
	}
	

	private List<AttachmentFileDTO> parseAttachmentData(String attachmentData) {
		if (attachmentData == null || attachmentData.trim().isEmpty()) {
			return new ArrayList<>();
		}

		List<AttachmentFileDTO> list = new ArrayList<>();

		String[] items = attachmentData.split("\\|\\|"); // split ||

		for (String item : items) {
			if (item == null || item.trim().isEmpty())
				continue;

			item = item.replace("##", "");

			String[] parts = item.split("::", 2);
			String fileName = parts.length > 0 ? parts[0].trim() : "";
			String desc = parts.length > 1 ? parts[1].trim() : "";

			list.add(new AttachmentFileDTO(fileName, desc));
		}

		return list;
	}

	@Override
	public RfiDetailsDTO getRfiPreview(Long rfiId) {
		List<RfiReportDTO> reportList = rfiRepository.getRfiReportDetails(rfiId);
		RfiReportDTO report = reportList.isEmpty() ? null : reportList.get(0);
		String data = report.getAttachmentData();
		report.setAttachments(parseAttachmentData(data));
		Optional<MeasurementDTO> measurementDetails = measurementsRepository.findMeasurementByRfiId(rfiId);

		List<ChecklistItemDTO> checklist = checklistDescriptionRepository.findChecklistItemsByRfiId(rfiId);
		List<EnclosureDTO> enclosures = enclosureRepository.findEnclosuresByRfiId(rfiId);

		return new RfiDetailsDTO(report, checklist, enclosures, measurementDetails);
	}

	@Override
	@Transactional
	public String sendRfiForValidation(Long rfiId, EnumValidation validationAuth) {
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
		validation.setValidationAuthority(validationAuth);
		validation.setSentForValidationAt(LocalDateTime.now());

		fullRfi.setRfiValidation(validation);
		rfiRepository.save(fullRfi);

		return "RFI sent for validation successfully.";
	}
	
	
	private List<String> wrapText(String text, float maxWidth, PDFont font, float fontSize) throws IOException {
	    List<String> lines = new ArrayList<>();
	    StringBuilder line = new StringBuilder();

	    for (String word : text.split(" ")) {
	        String testLine = line + (line.length() == 0 ? "" : " ") + word;
	        float size = font.getStringWidth(testLine) / 1000 * fontSize;

	        if (size > maxWidth) {
	            lines.add(line.toString());
	            line = new StringBuilder(word);
	        } else {
	            if (line.length() > 0) line.append(" ");
	            line.append(word);
	        }
	    }
	    if (!line.isEmpty()) lines.add(line.toString());
	    return lines;
	}


    private void drawTickMark(PDPageContentStream content, float x, float y) throws IOException {
        content.setStrokingColor(Color.BLACK);
        content.setLineWidth(1.5f);
        content.moveTo(x - 2, y + 5);
        content.lineTo(x + 3, y - 1);
        content.lineTo(x + 10, y + 10);
        content.stroke();
    }



	
	@Override
	public boolean validateRfi(RfiValidateDTO dto) {

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
		validation.setValidatedByUserId(dto.getValidatedByUserId());
		validation.setValidatedByUserName(dto.getValidatedByUserName());
		validation.setValidatedOn(LocalDateTime.now());

		rfiValidationRepository.save(validation);


		try {
			String txnId = rfi.getTxn_id();
			File pdfFile = new File(pdfStoragePath, "signed_engineer_" + txnId + "_final.pdf");

			if (!pdfFile.exists()) {
				throw new RuntimeException("Final PDF not found for stamping.");
			}

			try (PDDocument document = PDDocument.load(pdfFile)) {

				PDPage page = document.getPage(1);

				Map<String, float[]> coords = new HashMap<>();

				coords.put("Approved", new float[] { 53, 758 });
				coords.put("Rejected", new float[] { 403, 758 });
				coords.put("Remarks", new float[] { 100, 736 });
				coords.put("Comment", new float[] { 55, 690 });
				coords.put("ValidatedBy", new float[] { 115, 587 });
				coords.put("ValidatedOn", new float[] { 470, 587 });

				try (PDPageContentStream content = new PDPageContentStream(document, page,
						PDPageContentStream.AppendMode.APPEND, true)) {

					PDFont normalFont = PDType1Font.HELVETICA;
					PDFont boldFont = PDType1Font.HELVETICA_BOLD;

					if (dto.getAction() == EnumValidation.APPROVED) {
						float[] pos = coords.get("Approved");
						drawTickMark(content, pos[0], pos[1]);
					} else if (dto.getAction() == EnumValidation.REJECTED) {
						float[] pos = coords.get("Rejected");
						drawTickMark(content, pos[0], pos[1]);
					}

					if (dto.getRemarks() != null && !dto.getRemarks().isBlank()) {
						float[] pos = coords.get("Remarks");
						content.beginText();
						content.setFont(boldFont, 10);
						content.newLineAtOffset(pos[0], pos[1]);
						content.showText(dto.getRemarks());
						content.endText();
					}

					if (dto.getComment() != null && !dto.getComment().isBlank()) {
						float[] pos = coords.get("Comment");
						float startX = pos[0];
						float startY = pos[1];
						float lineHeight = 12;
						float maxWidth = 460;

						List<String> lines = wrapText(dto.getComment(), maxWidth, normalFont, 10);

						content.setFont(normalFont, 10);
						for (String line : lines) {
							content.beginText();
							content.newLineAtOffset(startX, startY);
							content.showText(line);
							content.endText();
							startY -= lineHeight;
						}
					}

					float[] vb = coords.get("ValidatedBy");
					content.beginText();
					content.setFont(normalFont, 10);
					content.newLineAtOffset(vb[0], vb[1]);
					content.showText(dto.getValidatedByUserName());
					content.endText();

					float[] vo = coords.get("ValidatedOn");
					content.beginText();
					content.newLineAtOffset(vo[0], vo[1]);
					content.showText(LocalDate.now().toString());
					content.endText();
				}

				document.save(pdfFile);
			}

		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}

        emailService.sendValidationMail(rfi, validation);

		return true;
	}




}