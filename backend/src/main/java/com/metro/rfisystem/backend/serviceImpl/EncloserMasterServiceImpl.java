package com.metro.rfisystem.backend.serviceImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.metro.rfisystem.backend.dto.EnclosureNameDto;
import com.metro.rfisystem.backend.model.rfi.RfiEnclosureMaster;
import com.metro.rfisystem.backend.repository.rfi.EncloserMasterRepository;
import com.metro.rfisystem.backend.service.EncloserMasterService;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class EncloserMasterServiceImpl implements EncloserMasterService {

	 private final EncloserMasterRepository repository;
	 
	@Override
	public List<RfiEnclosureMaster> getDistinctEncloserNamesByAction(String action) {
		
		return repository.findAllEncloserNameByAction(action);
	}


	    @Override
	    public List<EnclosureNameDto> getEnclosureNamesByAction(String action) {
	        return repository.findEnclosureNamesByAction(action);
	    }
}
