package com.metro.rfisystem.backend.controller;

import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.dto.RfiLogWrappedDTO;
import com.metro.rfisystem.backend.service.RfiLogService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rfiLog/")
public class RfiLogController {

	private final RfiLogService logService;
	

	@GetMapping("/getAllRfiLogDetails")
	public ResponseEntity<List<RfiLogDTO>> getAllRfiLogDetails(HttpSession session) {

		String UserName = (String) session.getAttribute("userName");
		String UserRole = (String) session.getAttribute("userRoleNameFk");
		String UserId = (String) session.getAttribute("userId");
		String UserType = (String) session.getAttribute("userTypeFk");
		String departmentFK = (String) session.getAttribute("departmentFk");


		List<RfiLogDTO> list = logService.listAllRfiLog(UserRole, UserName, UserId,UserType,departmentFK);

		if (list.isEmpty()) {
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(list);
	}
	

	@GetMapping("/getRfiReportDetails/{rfiId}")
	public ResponseEntity<RfiLogWrappedDTO> getRfiDetails(@PathVariable Long rfiId) {
		RfiLogWrappedDTO dto = logService.getRfiDetails(rfiId);
	    if (dto.getReportDetails() == null) {
	        return ResponseEntity.noContent().build();
	    }
	    return ResponseEntity.ok(dto);
	}
	
	@GetMapping("/previewFiles")
	public ResponseEntity<Resource> serveFile(@RequestParam String filepath) throws IOException {
	    String decodedPath = URLDecoder.decode(filepath, StandardCharsets.UTF_8);
	    Path file = Paths.get(decodedPath.replace("\\", File.separator).replace("/", File.separator));
 
	    if (!Files.exists(file) || !Files.isReadable(file)) {
	        return ResponseEntity.notFound().build();
	    }
 
	    Resource resource = new UrlResource(file.toUri());
	    String contentType = Files.probeContentType(file);
	    if (contentType == null) {
	        contentType = "application/octet-stream";
	    }
 
	    return ResponseEntity.ok()
	        .contentType(MediaType.parseMediaType(contentType))
	        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFileName().toString() + "\"")
	        .body(resource);
	}
	
	@GetMapping("/pdf/download/{rfiId}/{txnId}")
	public ResponseEntity<byte[]> downloadPdf(@PathVariable String txnId, @PathVariable String rfiId) {
	    try {
	        String downloadedFileName = rfiId + ".pdf"; 
	        File pdfFile = logService.getSignedPdfByTxnId(txnId);
	        byte[] pdfBytes = Files.readAllBytes(pdfFile.toPath());
	        return ResponseEntity.ok()
	                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadedFileName + "\"")
	                .contentType(MediaType.APPLICATION_PDF)
	                .body(pdfBytes);
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(("PDF not found for txnId: " + txnId).getBytes());
	    }
	}


}
