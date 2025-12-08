package com.metro.rfisystem.backend.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.metro.rfisystem.backend.dto.AssignExecutiveRequest;
import com.metro.rfisystem.backend.dto.AssignExecutiveResponse;
import com.metro.rfisystem.backend.dto.ExecutiveDTO;
import com.metro.rfisystem.backend.model.rfi.AssignExecutiveLog;
import com.metro.rfisystem.backend.repository.pmis.P6ActivityRepository;
import com.metro.rfisystem.backend.service.AssignExecutiveService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/rfi")
@RequiredArgsConstructor
public class AssignExecutiveController {
	
	private final AssignExecutiveService assignExecutiveService;
	private final P6ActivityRepository activityRepository;
	
    @GetMapping("/getAssinedExecutiveLogs")
    public ResponseEntity<List<AssignExecutiveResponse>> getAssignments() {
        List<AssignExecutiveResponse> list = assignExecutiveService.getAllAssignments();
        return ResponseEntity.ok(list);
    }
    
	@GetMapping("/getExecutivesList")
	public ResponseEntity<List<ExecutiveDTO>> getExcecutives(
			@RequestParam(name = "contractId", required = true) String contractId) {

		List<ExecutiveDTO> list = activityRepository.getExcecutives(contractId);
		if (list.isEmpty()) {
			return ResponseEntity.ok(Collections.emptyList());
		}

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
            log.setAssignedPersonUserId(request.getUserId());

            List<Long> list = assignExecutiveService.getFilteredOpenedRfiIds(
                request.getStructureType(), request.getStructure(), request.getContractId()
            );
            

            if (!list.isEmpty()) {
                assignExecutiveService.assignExecutives(list, request);
            }

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
    
    @PostMapping("/assignExecutive/delete/{id}")
    public ResponseEntity<String> deleteAssignedExecutive(@PathVariable("id") String id) {

		String par = id;
		boolean res = false;

		if (!par.isEmpty()) {
			res = assignExecutiveService.deleteAssignExecutiveLog(par);
		}
		if (res) {
			return ResponseEntity.ok("Executives assigned deleted successfully!");

		} else {
			return ResponseEntity.status(400).body("Failed to assign executive");
		}
	}

}