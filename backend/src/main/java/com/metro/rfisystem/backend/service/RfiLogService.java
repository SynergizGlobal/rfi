package com.metro.rfisystem.backend.service;

import java.util.List;

import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.dto.RfiLogWrappedDTO;

public interface RfiLogService {
	
	
	public List<RfiLogDTO> listAllRfiLog(String UserRole,String UserName,String UserId, String UserType,String deparmentFK);

	public  RfiLogWrappedDTO getRfiDetails(Long rfiId);

}
