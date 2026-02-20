package com.metro.rfisystem.backend.serviceImpl;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.metro.rfisystem.backend.dto.AttachmentFileDTO;
import com.metro.rfisystem.backend.dto.ChecklistItemDTO;
import com.metro.rfisystem.backend.dto.EnclosureDTO;
import com.metro.rfisystem.backend.dto.MeasurementDTO;
import com.metro.rfisystem.backend.dto.RfiDetailsLogDTO;
import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.dto.RfiLogFetchDTO;
import com.metro.rfisystem.backend.dto.RfiLogFilterDTO;
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
	
	   @Value("${rfi.pdf.storage-path}")
	    private String pdfStoragePath;


	@Override
	public List<RfiLogDTO> listAllRfiLog(RfiLogFetchDTO obj) {

		if ("IT Admin".equalsIgnoreCase(obj.getUserRole()) ||
				"Super User".equalsIgnoreCase(obj.getUserRole())) {
//			System.out.println("<> IT Admin...> Super User....<>");
			return rfiRepository.listAllRfiLogItAdmin(obj);              
		} else if ("DyHOD".equalsIgnoreCase(obj.getUserType())) {
//			System.out.println("IDyHOD......");

			return rfiRepository.listAllRfiLogByDyHod(obj);
		}
	    else if ("Data Admin".equalsIgnoreCase(obj.getUserRole())) {
//	        System.out.println("Data Admin (all RFI log list)......");
	        return rfiRepository.listAllRfiLogByDataAdmin(obj);
	    }
	    else if ("Contractor".equalsIgnoreCase(obj.getUserRole())) {
//	        System.out.println("Contractor (all RFI log list)......");
	        return rfiRepository.listAllRfiLogItAdmin(obj); 
	    }
		else if ("Engg".equalsIgnoreCase(obj.getDeparmentFK())) {
//			System.out.println("Engineer......");
			return rfiRepository.listAllRfiLogByAssignedBy(obj);
		} else if ("Regular User".equalsIgnoreCase(obj.getUserRole())) { 
//	        System.out.println("Representative / Regular User......");
	        return rfiRepository.listAllRfiLogByRepresentative(obj);

	    } 
		else
			System.out.println("Contrator...... :");
		return rfiRepository.listAllRfiLogByCreatedBy(obj);
	}
	
	private List<AttachmentFileDTO> parseAttachmentData(String attachmentData) {
	    if (attachmentData == null || attachmentData.trim().isEmpty()) {
	        return new ArrayList<>();
	    }

	    List<AttachmentFileDTO> list = new ArrayList<>();

	    String[] items = attachmentData.split("\\|\\|"); // split ||

	    for (String item : items) {
	        if (item == null || item.trim().isEmpty()) continue;

	        item = item.replace("##", "");

	        String[] parts = item.split("::", 2);
	        String fileName = parts.length > 0 ? parts[0].trim() : "";
	        String desc = parts.length > 1 ? parts[1].trim() : "";

	        list.add(new AttachmentFileDTO(fileName, desc));
	    }

	    return list;
	}


	@Override
	public RfiLogWrappedDTO getRfiDetails(Long rfiId) {

	    List<RfiDetailsLogDTO> reportList = rfiRepository.getRfiReportDetailsRfiLog(rfiId);
	    RfiDetailsLogDTO report = reportList.isEmpty() ? null : reportList.get(0);

	    if (report != null) {
	        String data = report.getAttachmentData(); 
	        report.setAttachments(parseAttachmentData(data));
	        report.setAttachmentData(""); 
	    }

	    Optional<MeasurementDTO> measurementDetails =
	            measurementsRepository.findMeasurementByRfiId(rfiId);

	    if (report != null && report.getDyHodUserId() != null) {
	        String DyHodUserName = userRepository.findUserNameByUserId(report.getDyHodUserId());
	        report.setDyHodUserName(DyHodUserName);
	    }

	    List<ChecklistItemDTO> checklist =
	            checklistDescriptionRepository.findChecklistItemsByRfiId(rfiId);

	    List<EnclosureDTO> enclosures =
	            enclosureRepository.findEnclosuresByRfiId(rfiId);

	    return new RfiLogWrappedDTO(report, checklist, enclosures, measurementDetails);
	}

	
	@Override
	public File getSignedPdfByTxnId(String txnId) throws FileNotFoundException {
	    File pdfDir = new File(pdfStoragePath);

	    File contractorPdf = new File(pdfDir, "signed_" + txnId + ".pdf");
	    File engineerPdf = new File(pdfDir, "signed_engineer_" + txnId + "_final.pdf");

	    if (engineerPdf.exists()) {
	        return engineerPdf;
	    } else if (contractorPdf.exists()) {
	        return contractorPdf;
	    } else {
	        throw new FileNotFoundException(
	            "No PDF found for txnId: " + txnId + " in " + pdfStoragePath);
	    }
	}

	@Override
	public RfiLogFilterDTO listAllFilterRfiLog() {

	    List<String> projects = rfiRepository.listAllProjectFilterRfiLog();
	    List<String> works = rfiRepository.listAllWorkFilterRfiLog();
	    List<String> contracts = rfiRepository.listAllContractFilterRfiLog();

	    return new RfiLogFilterDTO(projects, works, contracts);
	}


	
	



}
