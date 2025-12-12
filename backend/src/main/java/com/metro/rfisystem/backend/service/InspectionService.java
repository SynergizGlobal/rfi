package com.metro.rfisystem.backend.service;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import com.itextpdf.text.DocumentException;
import com.metro.rfisystem.backend.constants.InspectionSubmitResult;
import com.metro.rfisystem.backend.constants.ESignStatus;
import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;
import com.metro.rfisystem.backend.dto.SupportingDocDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;

public interface InspectionService {
//	public RFIInspectionDetails getRFIIdTxnId(String espTxnID);

		
	public boolean SaveTxnIdSetEStatusCon(String txnId, Long rfiId,ESignStatus status);
		
	public void saveESignStatusCon(ESignStatus status, String txnID);
	
	public void saveESignStatusEngg(ESignStatus status, String txnID) ;

	public ESignStatus getEsignStatusEngg(Long rfiId);

	public String getLastTxnIdForRfi(Long rfiId);

	public RfiInspectionDTO getById(Long id);

	public Long startInspection(RFIInspectionRequestDTO dto, MultipartFile selfie,  MultipartFile testDocument,
			List<MultipartFile> supportingFiles, String deptFk) throws Exception;

	ResponseEntity<byte[]> generateSiteImagesPdf(Long id, String uploadedBy) throws IOException, DocumentException;

	public InspectionSubmitResult finalizeInspection(RFIInspectionRequestDTO dto, MultipartFile selfie,
														MultipartFile testDocument, List<MultipartFile> supportingFiles, String deptFk) throws Exception;
	
	public String UploadSiteImage(MultipartFile siteImage, Long rfiId, String deptFk);

	public List<RFIInspectionRequestDTO> getInspectionsByRfiId(Long rfiId, String deptFk);


	public RFI getRFIIdTxnId(String espTxnID, String user);

	public RFIInspectionDetails getLatestInspectionByRfiId(Long id);
	
	public String getTxnId(Long id);
	
	public boolean SaveEngStatus(Long rfiId,ESignStatus status);


	public boolean removeSupportingFileByRfiId(Long rfiId, String fileName) throws IOException;

	public List<SupportingDocDTO> getSupportingFilesByRfiId(Long rfiId) throws Exception;


}
