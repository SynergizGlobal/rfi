package com.metro.rfisystem.backend.service;

import java.io.OutputStream;
import java.util.List;


import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiReportDTO;
import com.metro.rfisystem.backend.dto.RfiValidateDTO;

public interface RfiValidationService {

	boolean sendRfiForValidation(Long id);

	List<GetRfiDTO> showValidations(String UserRole,String UserType, String UserId,String Department,String UserName);

	void validateRfiWithFile(RfiValidateDTO dto);
	
	void generateRfiPdf(long id, OutputStream out) throws Exception;

	public List<RfiReportDTO> getRfiReportDetails(long id);
}
