package com.metro.rfisystem.backend.service;

import java.util.List;

import com.metro.rfisystem.backend.dto.AssignExecutiveResponse;
import com.metro.rfisystem.backend.model.rfi.AssignExecutiveLog;

public interface AssignExecutiveService {
	
	boolean saveAssignment(AssignExecutiveLog log);

	List<AssignExecutiveResponse> getAllAssignments();
	
}
