package com.metro.rfisystem.backend.service;

import java.util.List;
import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiDetailsDTO;
import com.metro.rfisystem.backend.dto.RfiValidateDTO;

public interface RfiValidationService {

	List<GetRfiDTO> showValidations(String UserRole, String UserType, String UserId, String Department,
			String UserName);

	void validateRfi(RfiValidateDTO dto);

	String sendRfiForValidation(Long rfiId);

	RfiDetailsDTO getRfiPreview(Long rfiId);
}
