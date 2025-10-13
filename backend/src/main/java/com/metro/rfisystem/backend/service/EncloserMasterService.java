package com.metro.rfisystem.backend.service;

import java.util.List;
import java.util.Optional;

import com.metro.rfisystem.backend.dto.EnclosureNameDto;
import com.metro.rfisystem.backend.dto.RfiEnclosureDTO;
import com.metro.rfisystem.backend.model.rfi.RfiEnclosureMaster;

public interface EncloserMasterService {
	
	List<RfiEnclosureDTO>  getDistinctEncloserNamesByAction(String action);

	    List<EnclosureNameDto> getEnclosureNamesByAction(String action);
	    
	    Optional<RfiEnclosureMaster> findById(Long id);
	    
	    RfiEnclosureMaster saveEnclosure(RfiEnclosureMaster enclosure);

	  //  Enclosure updateEnclosure(Long id, Enclosure updatedData);

	    void deleteById(Long id);

		List<RfiEnclosureMaster> getAllEnclosures();

}
