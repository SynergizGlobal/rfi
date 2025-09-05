package com.metro.rfisystem.backend.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.metro.rfisystem.backend.dto.AssignExecutiveRequest;
import com.metro.rfisystem.backend.dto.AssignExecutiveResponse;
import com.metro.rfisystem.backend.model.rfi.AssignExecutiveLog;
import com.metro.rfisystem.backend.service.AssignExecutiveService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/rfi")
@RequiredArgsConstructor
public class AssignExecutiveController {
	
	private final AssignExecutiveService assignExecutiveService;
	
	
	
    @GetMapping("/getAssinedExecutiveLogs")
    public ResponseEntity<List<AssignExecutiveResponse>> getAssignments() {
        List<AssignExecutiveResponse> list = assignExecutiveService.getAllAssignments();
        return ResponseEntity.ok(list);
    }

	
	
	@PostMapping("/assign-executive")
	public ResponseEntity<String> assignExecutive(@RequestBody AssignExecutiveRequest request) {
	    try {
	        AssignExecutiveLog log = new AssignExecutiveLog();
	        log.setContract(request.getContract());
	        log.setContractId(request.getContractId());
	        log.setStructureType(request.getStructureType());
	        log.setStructure(request.getStructure());
	        log.setAssignedPersonClient(request.getAssignedPersonClient());
	        log.setAssignedPersonDepartment(request.getDepartment());

	        boolean isSubmitted = assignExecutiveService.saveAssignment(log);

	        if (isSubmitted) {
	            return ResponseEntity.ok("Executive assigned successfully!");
	        } else {
	            return ResponseEntity.status(400).body("Failed to assign executive");
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("Error while assigning executive: " + e.getMessage());
	    }
	}
	

}
