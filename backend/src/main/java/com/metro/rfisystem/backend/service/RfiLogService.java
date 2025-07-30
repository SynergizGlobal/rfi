package com.metro.rfisystem.backend.service;

import java.util.List;

import com.metro.rfisystem.backend.dto.RfiLogDTO;

public interface RfiLogService {
	
	
	public List<RfiLogDTO> listAllRfiLog(String UserRole,String UserName,String UserId, String UserType,String deparmentFK);

}
