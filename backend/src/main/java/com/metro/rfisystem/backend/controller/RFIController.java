package com.metro.rfisystem.backend.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.dto.AssignPersonDTO;
import com.metro.rfisystem.backend.dto.ContractDropdownDTO;
import com.metro.rfisystem.backend.dto.ContractInfoProjection;
import com.metro.rfisystem.backend.dto.ProjectDTO;
import com.metro.rfisystem.backend.dto.RFI_DTO;
import com.metro.rfisystem.backend.dto.RfiListDTO;
import com.metro.rfisystem.backend.dto.WorkDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.repository.pmis.ContractRepository;
import com.metro.rfisystem.backend.repository.pmis.ContractorRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.RFIService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/rfi")
@RequiredArgsConstructor
public class RFIController {

	private final RFIService rfiService;

	private final RFIRepository rfiRepository;
	
	private final ContractRepository contractRepository;
	
	@Autowired
	private ContractorRepository contractorRepo;
	
	private static final Logger logger = LoggerFactory.getLogger(RFIController.class);



	@PostMapping("/create")
	public ResponseEntity<String> createRFI(@RequestBody RFI_DTO dto, HttpSession session) {
	    String userName = (String) session.getAttribute("userName");
	    @SuppressWarnings("unchecked")
	    List<String> allowedContracts = (List<String>) session.getAttribute("allowedContracts");

	    if (userName == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired. Please log in again.");
	    }

	    String contractShortName = dto.getContract();
	    String contractId = Optional.ofNullable(contractRepository.findContractIdByShortName(contractShortName))
	                                .map(String::trim)
	                                .orElse(null);

	    System.out.println("Session user: " + userName);
	    System.out.println("Allowed contracts: " + allowedContracts);
	    System.out.println("Selected contract short name: " + contractShortName);
	    System.out.println("Resolved contractId: '" + contractId + "'");

//	    if (contractId == null || allowedContracts == null || 
//	        allowedContracts.stream().noneMatch(id -> id != null && id.trim().equalsIgnoreCase(contractId))) {
//	        return ResponseEntity.status(HttpStatus.FORBIDDEN)
//	            .body("❌ You are not authorized to create RFI for this contract.");
//	    }

	    RFI saved = rfiService.createRFI(dto, userName);
	    return ResponseEntity.ok("RFI " + saved.getRfi_Id() + " created successfully!");
	}
	

	@GetMapping("/allowedContracts")
	public ResponseEntity<List<ContractDropdownDTO>> getAllowedContracts(
	    @SessionAttribute(name = "userId", required = false) String userId,
	    HttpSession session) {

	    System.out.println("Session ID: " + session.getId());
	    System.out.println("User ID from session: " + userId);
	    if (userId == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
	    }

	    String contractorId = contractorRepo.findContractorIdByUserId(userId);
	    System.out.println("Resolved contractorId for user " + userId + ": " + contractorId);

	    List<ContractDropdownDTO> allowedContracts = rfiService.getAllowedContractsForUser(userId, contractorId);
	    return ResponseEntity.ok(allowedContracts);
	}





	@GetMapping("/projectNames")
	public List<ProjectDTO> getAllProjectNames() {
		return rfiService.getAllProjectNames();
	}

	@GetMapping("/workNames")
	public List<WorkDTO> getWorkNamesByProjectId(@RequestParam(name = "projectId", required = false) String projectId) {
		return rfiService.getWorkShortNamesByProjectId(projectId);
	}

	@GetMapping("/contractNames")
	public List<ContractInfoProjection> getContractNamesByWorkId(
			@RequestParam(name = "workId", required = false) String wrokId) {
		return rfiService.getContractShortNamesByWorkId(wrokId);
	}

	@GetMapping("/structureType")
	public List<String> getStructureTypeByContractId(
			@RequestParam(name = "contractId", required = false) String contractId) {
		return rfiService.getStructureTypeByContractId(contractId);
	}

	@GetMapping("/structure")
	public List<String> getStructureByStructureContractId(
			@RequestParam(name = "structureType", required = false) String structureType,
			@RequestParam(name = "contractId", required = false) String contractId) {
		return rfiService.getStructureByStructureTypeContractId(structureType, contractId);
	}

	@GetMapping("/component")
	public List<String> getComponentByStructureTypeStructureContractId(
			@RequestParam(name = "structureType", required = false) String structureType,
			@RequestParam(name = "contractId", required = false) String contractId,
			@RequestParam(name = "structure", required = false) String structure) {
		return rfiService.getComponentByStructureStructureTypeContractId(structureType, contractId, structure);
	}

	@GetMapping("/element")
	public List<String> getElementByStructureTypeStructureComponent(
			@RequestParam(name = "contractId", required = false) String contractId,
			@RequestParam(name = "structureType", required = false) String structureType,
			@RequestParam(name = "structure", required = false) String structure,
			@RequestParam(name = "component", required = false) String component) {
		return rfiService.getElementByStructureStructureTypeComponent(contractId,structureType, structure, component);
	}

	@GetMapping("/activityNames")
	public List<String> getActivityNamesByStructureTypeStructureComponentComponentId(
			@RequestParam(name = "structureType", required = false) String structureType,
			@RequestParam(name = "structure", required = false) String structure,
			@RequestParam(name = "component", required = false) String component,
			@RequestParam(name = "component_id", required = false) String component_id) {
		return rfiService.getActivityNamesByStructureStructureTypeComponentComponentId(structureType, structure,
				component, component_id);
	}

	@GetMapping("/rfi-details")
	public ResponseEntity<List<RfiListDTO>> getRfisBasedOnRole(HttpSession session) {
		String userName = (String) session.getAttribute("userName");
		String userRole = (String) session.getAttribute("userRoleNameFk");
		String userType = (String) session.getAttribute("userTypeFk");
		String userDepartment =(String) session.getAttribute("departmentFk");
 
		System.out.println("Session userName: " + userName);
		System.out.println("Session userRoleNameFk: " + userRole);
		System.out.println("Session userTypeFk: " + userType);
 
		if (userName == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		boolean isAdmin = userRole != null && userRole.equalsIgnoreCase("IT Admin");
		boolean isDyHOD = userType != null && userType.equalsIgnoreCase("DyHOD");
 
		if (isAdmin || isDyHOD ) {
			return ResponseEntity.ok(rfiService.getAllRFIs());
		}
		if(userRole.equalsIgnoreCase("Contractor"))
		{
			return ResponseEntity.ok(rfiService.getRFIsCreatedBy(userName));
		}
		if (userDepartment.equalsIgnoreCase("Engg")) {
			return ResponseEntity.ok(rfiService.getRFIsAssignedTo(userName));
		}
		return ResponseEntity.ok(rfiService.getRFIsByCreatedBy(userName));
	}
	
	@GetMapping("/rfi-count")
	public ResponseEntity<Integer> getRfiCount(HttpSession session) {
		String userName = (String) session.getAttribute("userName");
		String userRole = (String) session.getAttribute("userRoleNameFk");
		String userType = (String) session.getAttribute("userTypeFk");

		if (userName == null || (userRole == null && userType == null)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		boolean isAdmin = userRole != null && userRole.equalsIgnoreCase("IT Admin");
		boolean isDyHOD = userType != null && userType.equalsIgnoreCase("DyHOD");

		if (isAdmin || isDyHOD) {
			return ResponseEntity.ok(rfiService.countByTotalRfiCreated());
		}
		if(userRole.equalsIgnoreCase("Contractor"))
		{
			return ResponseEntity.ok(rfiService.countByCreatedBy(userName));
		}
		if (userRole.equalsIgnoreCase("Regular User")) {
			return ResponseEntity.ok(rfiService.countByAssignedTo(userName));
		}

		int userRfiCount = rfiService.getRFIsByCreatedBy(userName).size();
		return ResponseEntity.ok(userRfiCount);
	}

	@GetMapping("/rfi-details/{id}")
	public ResponseEntity<RFI> getRFIById(@PathVariable Long id) {
		Optional<RFI> rfi = rfiRepository.findById(id);
		return rfi.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@DeleteMapping("/delete/{id}")
	public ResponseEntity<Void> deleteRFI(@PathVariable Long id) {
		Optional<RFI> rfi = rfiRepository.findById(id);
		if (rfi.isPresent()) {
			rfiRepository.delete(rfi.get());
			return ResponseEntity.noContent().build();
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	@PutMapping("/update/{id}")
	public ResponseEntity<String> updateRfi(@PathVariable Long id, @RequestBody RFI_DTO rfiDto) {
		String result = rfiService.updateRfi(id, rfiDto);
		return ResponseEntity.ok(result);
	}

	@PostMapping("/assign-client-person")
	public ResponseEntity<String> assignPersonToClient(@RequestBody AssignPersonDTO assignDTO) {
		boolean success = rfiService.assignPersonToClient(assignDTO.getRfi_Id(), assignDTO.getAssignedPersonClient(),  assignDTO.getClientDepartment());
		if (success) {
			return ResponseEntity.ok("Assigned successfully");
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("RFI not found");
		}
	}
	
	
	@GetMapping("/status-counts")
	public ResponseEntity<Map<String, Long>> getRfiStatusCounts() {
	    Map<String, Long> counts = new HashMap<>();
	    counts.put("INSPECTION_DONE", rfiRepository.countByStatus(EnumRfiStatus.INSPECTION_DONE));
	    List<EnumRfiStatus> pendingStatuses = Arrays.asList(
	            EnumRfiStatus.CREATED,
	            EnumRfiStatus.UPDATED,
	            EnumRfiStatus.REASSIGNED,
	            EnumRfiStatus.INSPECTED_BY_AE,
	            EnumRfiStatus.VALIDATION_PENDING
	        );
	        counts.put("PENDING", rfiRepository.countByStatuses(pendingStatuses));
 
	    counts.put("RESCHEDULED", rfiRepository.countByStatus(EnumRfiStatus.RESCHEDULED));
	    return ResponseEntity.ok(counts);
	}


}
