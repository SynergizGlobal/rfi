package com.metro.rfisystem.backend.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

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
import com.metro.rfisystem.backend.dto.RfiDescriptionDTO;
import com.metro.rfisystem.backend.dto.RfiListDTO;
import com.metro.rfisystem.backend.dto.WorkDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.repository.pmis.ContractorRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.RFIService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "https://localhost:3000")
@RestController
@RequestMapping("/rfi")
@RequiredArgsConstructor
public class RFIController {

	private final RFIService rfiService;

	private final RFIRepository rfiRepository;

	@Autowired
	private ContractorRepository contractorRepo;

	private static final Logger logger = LoggerFactory.getLogger(RFIController.class);

	@PostMapping("/create")
	public ResponseEntity<String> createRFI(@RequestBody RFI_DTO dto, HttpSession session) {
		String userName = (String) session.getAttribute("userName");
		String emailId = (String) session.getAttribute("emailId");

		if (userName == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired. Please log in again.");
		}

		RFI saved = rfiService.createRFI(dto, userName, emailId);
		return ResponseEntity.ok("RFI " + saved.getRfi_Id() + " created successfully!");
	}

	@GetMapping("/allowedContracts")
	public ResponseEntity<List<ContractDropdownDTO>> getAllowedContracts(
			@SessionAttribute(name = "userId", required = false) String userId, HttpSession session) {

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
		return rfiService.getElementByStructureStructureTypeComponent(contractId, structureType, structure, component);
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

	@GetMapping("/rfi-descriptions")
	public ResponseEntity<List<RfiDescriptionDTO>> getRfiDescriptions(@RequestParam String activity) {
		List<RfiDescriptionDTO> descriptions = rfiService.getRfiDescriptionsByActivity(activity);
		return ResponseEntity.ok(descriptions);
	}

	@GetMapping("/representatives")
	public ResponseEntity<List<String>> getContractorUserNamesWithReportingId(HttpSession session) {
		String loggedInUserName = (String) session.getAttribute("userName");

		if (loggedInUserName == null) {
			return ResponseEntity.status(401).build();
		}

		List<String> usernames = rfiService.getContractorUserNamesWithReportingId(loggedInUserName);
		return ResponseEntity.ok(usernames);
	}

	@GetMapping("/regularUsers")
	public ResponseEntity<?> getRegularUsers(HttpSession session) {
		String userId = (String) session.getAttribute("userId");
		String userRole = (String) session.getAttribute("userRoleNameFk");

		if (userId == null || userId.isEmpty()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Session expired. Please log in again.");
		}

		List<Map<String, Object>> representatives;

		if (userRole != null && userRole.trim().equalsIgnoreCase("IT Admin")) {
			representatives = rfiService.getAllRepresentativesReportingToContractor();
		} else {
			representatives = rfiService.getRegularUsers(userId);
		}

		if (representatives.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No representatives found.");
		}
		List<String> representativeNames = representatives.stream().map(u -> (String) u.get("user_name")).toList();

		return ResponseEntity.ok(representativeNames);
	}

//	 @GetMapping("/contractors")
//	 public ResponseEntity<List<UserDTO>> getContractors() {
//	     List<UserDTO> contractors = rfiService.getContractorsList();
//	     return ResponseEntity.ok(contractors);
//	 }

	@GetMapping("/rfi-details")
	public ResponseEntity<List<RfiListDTO>> getRfisBasedOnRole(HttpSession session) {
		String userName = (String) session.getAttribute("userName");
		String userRole = (String) session.getAttribute("userRoleNameFk");
		String userType = (String) session.getAttribute("userTypeFk");
		String userDepartment = (String) session.getAttribute("departmentFk");
		String userId = (String) session.getAttribute("userId");

		System.out.println("Session userName: " + userName);
		System.out.println("Session userRoleNameFk: " + userRole);
		System.out.println("Session userTypeFk: " + userType);
		System.out.println("Session userDepartment : " + userDepartment);

		if (userName == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		boolean isAdmin = userRole != null && userRole.equalsIgnoreCase("IT Admin");
		boolean isDyHOD = userType != null && userType.equalsIgnoreCase("DyHOD");
		boolean isDataAdmin = userRole != null && userRole.equalsIgnoreCase("Data Admin"); // ✅ add this

		if (isAdmin || isDyHOD || isDataAdmin) {
			return ResponseEntity.ok(rfiService.getAllRFIs());
		}
//		 if (userRole.equalsIgnoreCase("Contractor")) {
//		        List<RfiListDTO> created = rfiService.getRFIsCreatedBy(userName);
////		        List<RfiListDTO> representative = rfiService.getRFIsByRepresentative(userName);
//
//		        Set<RfiListDTO> merged = new LinkedHashSet<>(created);
////		        merged.addAll(representative);
//
//		        return ResponseEntity.ok(new ArrayList<>(merged));
//		    }

		if ("Contractor".equalsIgnoreCase(userRole)) {
			return ResponseEntity.ok(rfiService.getAllRFIs());
		}

		if ("Engg".equalsIgnoreCase(userDepartment)) {
			List<RfiListDTO> assigned = rfiService.getRFIsAssignedTo(userName);
			return ResponseEntity.ok(assigned);
		}

		if (userRole.equalsIgnoreCase("Regular User")) {
			List<RfiListDTO> representative = rfiService.getRFIsByRepresentative(userName);
			return ResponseEntity.ok(representative);
		}

		return ResponseEntity.ok(rfiService.getRFIsByCreatedBy(userName));
	}

	@GetMapping("/rfi-count")
	public ResponseEntity<Integer> getRfiCount(HttpSession session) {
		String userName = (String) session.getAttribute("userName");
		String userRole = (String) session.getAttribute("userRoleNameFk");
		String userType = (String) session.getAttribute("userTypeFk");
		String userDepartment = (String) session.getAttribute("departmentFk");

		if (userName == null || (userRole == null && userType == null)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		boolean isAdmin = userRole != null && userRole.equalsIgnoreCase("IT Admin");
		boolean isDyHOD = userType != null && userType.equalsIgnoreCase("DyHOD");
		boolean isDataAdmin = userRole != null && userRole.equalsIgnoreCase("Data Admin");

		if (isAdmin || isDyHOD || isDataAdmin) {
			return ResponseEntity.ok(rfiService.countByTotalRfiCreated());
		}
//		if (userRole.equalsIgnoreCase("Contractor")) {
//			return ResponseEntity.ok(rfiService.countByCreatedBy(userName));
//		}

		if ("Contractor".equalsIgnoreCase(userRole)) {
			return ResponseEntity.ok(rfiService.countByTotalRfiCreated());
		}

		if (userRole.equalsIgnoreCase("Regular User")) {
			// Count RFIs where user is creator, assigned person, or representative
			return ResponseEntity.ok(rfiService.countByRegularUser(userName));
		}
		if (userDepartment.equalsIgnoreCase("Engg")) {
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
	public ResponseEntity<String> deleteRFI(@PathVariable Long id, HttpSession session) {

	    String userName = (String) session.getAttribute("userName");

	    Optional<RFI> rfiOpt = rfiRepository.findById(id);

	    if (!rfiOpt.isPresent()) {
	        return ResponseEntity.notFound().build();
	    }

	    RFI rfi = rfiOpt.get();

	    // ✅ soft delete
	    rfi.setIsDeleted(true);
	    rfi.setStatus(EnumRfiStatus.DELETED);
	    rfi.setAction("Deleted");
	    rfi.setUpdatedAt(new Date());

	    rfiRepository.save(rfi);

	    return ResponseEntity.ok("RFI marked as deleted successfully!");
	}


	@PutMapping("/update/{id}")
	public ResponseEntity<String> updateRfi(@PathVariable Long id, @RequestBody RFI_DTO rfiDto) {
		String result = rfiService.updateRfi(id, rfiDto);
		return ResponseEntity.ok(result);
	}

	@PostMapping("/assign-client-person")
	public ResponseEntity<String> assignPersonToClient(@RequestBody AssignPersonDTO assignDTO) {
		System.out.println("📌 Incoming Data → RFI: " + assignDTO.getRfi_Id() + " | Client: "
				+ assignDTO.getAssignedPersonClient() + " | Department: " + assignDTO.getClientDepartment());

		boolean success = rfiService.assignPersonToClient(assignDTO.getRfi_Id(), assignDTO.getAssignedPersonClient(),
				assignDTO.getClientDepartment());

		if (success) {
			return ResponseEntity.ok("Assigned successfully");
		} else {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("RFI not found");
		}
	}

	@GetMapping("/status-counts")
	public ResponseEntity<Map<String, Long>> getRfiStatusCounts(HttpSession session) {
		String userName = (String) session.getAttribute("userName");
		String userRole = (String) session.getAttribute("userRoleNameFk");
		String userType = (String) session.getAttribute("userTypeFk");
		String userDepartment = (String) session.getAttribute("departmentFk");

		if (userName == null || (userRole == null && userType == null)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		boolean isAdmin = "IT Admin".equalsIgnoreCase(userRole);
		boolean isDyHOD = "DyHOD".equalsIgnoreCase(userType);
		boolean isContractor = "Contractor".equalsIgnoreCase(userRole);
		boolean isRegular = "Regular User".equalsIgnoreCase(userRole);
		boolean isEngineer = "Engg".equalsIgnoreCase(userDepartment);
		boolean isDataAdmin = "Data Admin".equalsIgnoreCase(userRole);

		Map<String, Long> counts = new HashMap<>();

		if (isAdmin || isDyHOD || isContractor || isDataAdmin) {

		    // ✅ Admin, DyHOD, Contractor → ALL RFIs
		    counts.put("INSPECTED_BY_CON", rfiRepository.countByStatus(EnumRfiStatus.INSPECTED_BY_CON));
		    counts.put("RESCHEDULED", rfiRepository.countByStatus(EnumRfiStatus.RESCHEDULED));
		    counts.put("ACCEPTED", rfiRepository.countByStatus(EnumRfiStatus.INSPECTED_BY_AE));
		    counts.put("REJECTED", rfiRepository.countRejectedInspections());

		    List<EnumRfiStatus> pendingStatuses = Arrays.asList(
		            EnumRfiStatus.CREATED,
		            EnumRfiStatus.UPDATED,
		            EnumRfiStatus.REASSIGNED,
		            EnumRfiStatus.CON_INSP_ONGOING
		    );
		    counts.put("PENDING", rfiRepository.countByStatuses(pendingStatuses));

		} else if (isRegular) {

		    counts.put("INSPECTED_BY_CON", rfiRepository.countByStatusByRegularUser(EnumRfiStatus.INSPECTED_BY_CON, userName));
		    counts.put("RESCHEDULED", rfiRepository.countByStatusByRegularUser(EnumRfiStatus.RESCHEDULED, userName));
		    counts.put("ACCEPTED", rfiRepository.countByStatusByRegularUser(EnumRfiStatus.INSPECTED_BY_AE, userName));
		    counts.put("REJECTED", rfiRepository.countRejectedInspectionsByRegularUser(userName));

		    List<EnumRfiStatus> pendingStatuses = Arrays.asList(
		            EnumRfiStatus.CREATED,
		            EnumRfiStatus.UPDATED,
		            EnumRfiStatus.REASSIGNED,
		            EnumRfiStatus.CON_INSP_ONGOING
		    );
		    counts.put("PENDING", rfiRepository.countByStatusesByRegularUser(pendingStatuses, userName));

		} else if (isEngineer) {

		    counts.put("INSPECTED_BY_CON", rfiRepository.countByStatusAndAssignedPersonClient(EnumRfiStatus.INSPECTED_BY_CON, userName));
		    counts.put("RESCHEDULED", rfiRepository.countByStatusAndAssignedPersonClient(EnumRfiStatus.RESCHEDULED, userName));
		    counts.put("ACCEPTED", rfiRepository.countByStatusAndAssignedPersonClient(EnumRfiStatus.INSPECTED_BY_AE, userName));
		    counts.put("REJECTED", rfiRepository.countRejectedInspectionsByAssignedTo(userName));

		    List<EnumRfiStatus> pendingStatuses = Arrays.asList(
		            EnumRfiStatus.CREATED,
		            EnumRfiStatus.UPDATED,
		            EnumRfiStatus.REASSIGNED
		    );
		    counts.put("PENDING", rfiRepository.countByStatusesAndAssignedPersonClient(pendingStatuses, userName));
		

		}

		System.out.println("RFI status counts for user '" + userName + "': " + counts);

		return ResponseEntity.ok(counts);
	}

	@PostMapping("/close/rfi/{rfiId}")
	public ResponseEntity<String> closeRfi(@PathVariable Long rfiId) {
		try {
			String result = rfiService.closeRfi(rfiId);

			if ("RFI closed successfully".equals(result)) {
				return ResponseEntity.ok(result);
			} else {
				return ResponseEntity.badRequest().body(result);
			}
		} catch (Exception ex) {
			return ResponseEntity.badRequest().body("Failed to close RFI. Please try again.");
		}
	}

	@GetMapping("/auto-cancel")
	public ResponseEntity<String> autoCancelExpiredRfis() {
		rfiService.autoCancelRFIs();
		return ResponseEntity.ok("Auto-cancellation completed successfully");
	}

}
