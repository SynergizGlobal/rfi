package com.metro.rfisystem.backend.serviceImpl;

import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.RFIInspectionRequestDTO;
import com.metro.rfisystem.backend.dto.RfiInspectionDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionDetailsRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.InspectionService;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class InspectionServiceImpl implements InspectionService{
	


	private final RFIRepository rfiRepository;
	private final RFIInspectionDetailsRepository inspectionRepository;
	

	    @Value("${rfi.inspection.images.upload-dir}")
	    private String uploadDir;
	
	@Override
	public RfiInspectionDTO getById(Long id) {
		  RFI rfi = rfiRepository.findById(id)
		            .orElseThrow(() -> new RuntimeException("RFI not found with ID: " + id));
		  
		  RfiInspectionDTO dto = new RfiInspectionDTO();
	        dto.setId(rfi.getId());
	        dto.setRfiId(rfi.getRfi_Id());
	        dto.setWork(rfi.getWork());
	        dto.setContract(rfi.getContract());
	        dto.setContractor(rfi.getAssignedPersonContractor());
	        dto.setActivity(rfi.getActivity());
	        dto.setDescription(rfi.getDescription());
	        dto.setLocation(rfi.getLocation());
	        dto.setDataOfInspection(rfi.getDateOfInspection());
	        dto.setTimeOfInspection(rfi.getTimeOfInspection());
	        dto.setNameOfContractorReprsentative(rfi.getNameOfRepresentative());
	           

	        return dto;

	}

	 @Override
	    public void startInspection(RFIInspectionRequestDTO dto, MultipartFile selfie, MultipartFile[] siteImages) {
	        RFI rfi = rfiRepository.findById(dto.getRfiId())
	                .orElseThrow(() -> new RuntimeException("RFI not found with ID: " + dto.getRfiId()));

	        String selfiePath = saveFile(selfie);
	        String siteImagePaths = Arrays.stream(siteImages)
	                .map(this::saveFile)
	                .collect(Collectors.joining(","));

	        RFIInspectionDetails inspection = new RFIInspectionDetails();
	        inspection.setRfi(rfi);
	        inspection.setLocation(dto.getLocation());
	        inspection.setChainage(dto.getChainage());
	        inspection.setSelfiePath(selfiePath);
	        inspection.setSiteImage(siteImagePaths);
	        inspection.setDateOfInspection(LocalDate.now());
	        inspection.setTimeOfInspection(LocalTime.now());

	        inspectionRepository.save(inspection);
	    }

	    private String saveFile(MultipartFile file) {
	        if (file.isEmpty()) {
	            throw new IllegalArgumentException("Cannot save empty file");
	        }
	        try {
	            Path dirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
	            Files.createDirectories(dirPath);

	            String originalFilename = Path.of(file.getOriginalFilename()).getFileName().toString();
	            String newFileName = UUID.randomUUID() + "_" + originalFilename;
	            Path targetPath = dirPath.resolve(newFileName);

	            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

	            return uploadDir + "/" + newFileName;
	        } catch (IOException ex) {
	            throw new RuntimeException("Failed to store file: " + ex.getMessage(), ex);
	        }
	    }
}
