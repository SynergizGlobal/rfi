package com.metro.rfisystem.backend.serviceImpl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.metro.rfisystem.backend.dto.EnclosureNameDto;
import com.metro.rfisystem.backend.dto.RfiEnclosureDTO;
import com.metro.rfisystem.backend.model.rfi.RfiEnclosureMaster;
import com.metro.rfisystem.backend.repository.rfi.EncloserMasterRepository;
import com.metro.rfisystem.backend.service.EncloserMasterService;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class EncloserMasterServiceImpl implements EncloserMasterService {

	 private final EncloserMasterRepository repository;
	 
	 @Override
	    public List<RfiEnclosureDTO> getDistinctEncloserNamesByAction(String action) {
	        return repository.findAllEncloserNameByAction(action);
	    }

	    @Override
	    public List<EnclosureNameDto> getEnclosureNamesByAction(String action) {
	        return repository.findEnclosureNamesByAction(action);
	    }
	    
	    @Override
	    public Optional<RfiEnclosureMaster> findById(Long id) {
	        return repository.findById(id);
	    }
	    
	    @Override
	    public RfiEnclosureMaster saveEnclosure(RfiEnclosureMaster enclosure) {
	        return repository.save(enclosure);
	    }
	    
	    @Override
	    public void deleteById(Long id) {
	        repository.deleteById(id);
	    }

}
