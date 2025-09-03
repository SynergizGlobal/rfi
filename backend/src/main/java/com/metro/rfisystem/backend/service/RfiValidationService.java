package com.metro.rfisystem.backend.service;

import java.util.List;
import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiReportDTO;
import com.metro.rfisystem.backend.dto.RfiValidateDTO;

public interface RfiValidationService {


	List<GetRfiDTO> showValidations(String UserRole, String UserType, String UserId,String Department,String UserName);

	void validateRfiWithFile(RfiValidateDTO dto);
	
	public List<RfiReportDTO> getRfiReportDetails(long id);

	String sendRfiForValidation(Long rfiId);
}
