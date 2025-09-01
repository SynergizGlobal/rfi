package com.metro.rfisystem.backend.service;

import java.util.List;

import com.metro.rfisystem.backend.model.rfi.RfiEnclosureMaster;

public interface EncloserMasterService {
	
	List<RfiEnclosureMaster>  getDistinctEncloserNamesByAction(String action);

}
