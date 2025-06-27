package com.metro.rfisystem.backend.serviceImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.RfiLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RfiLogServiceImpl implements RfiLogService {
	
	private final RFIRepository rfiRepository;

	@Override
	public List<RfiLogDTO> listRfiDetailsByFilter(String project, String work, String contract) {
		return rfiRepository.listRfiLogByFilter(project, work, contract);
	}

	@Override
	public List<RfiLogDTO> listAllRfiLog() {
		return rfiRepository.listAllRfiLog();
	}
	

}
