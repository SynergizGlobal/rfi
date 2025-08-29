package com.metro.rfisystem.backend.serviceImpl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.dto.ContractDropdownDTO;
import com.metro.rfisystem.backend.dto.ContractInfoProjection;
import com.metro.rfisystem.backend.dto.ProjectDTO;
import com.metro.rfisystem.backend.dto.RFI_DTO;
import com.metro.rfisystem.backend.dto.RfiDescriptionDTO;
import com.metro.rfisystem.backend.dto.RfiListDTO;
import com.metro.rfisystem.backend.dto.UserDTO;
import com.metro.rfisystem.backend.dto.WorkDTO;
import com.metro.rfisystem.backend.model.pmis.User;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RfiDescription;
import com.metro.rfisystem.backend.repository.pmis.ContractRepository;
import com.metro.rfisystem.backend.repository.pmis.LoginRepository;
import com.metro.rfisystem.backend.repository.pmis.P6ActivityRepository;
import com.metro.rfisystem.backend.repository.pmis.ProjectRepository;
import com.metro.rfisystem.backend.repository.pmis.StructureRepository;
import com.metro.rfisystem.backend.repository.pmis.WorkRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.repository.rfi.RfiDescriptionRepository;
import com.metro.rfisystem.backend.service.RFIService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RFIServiceImpl implements RFIService {

	private final RFIRepository rfiRepository;

	private final ProjectRepository projectRepository;

	private final WorkRepository workRepository;

	private final ContractRepository contractRepository;

	private final StructureRepository structureRepository;

	private final P6ActivityRepository p6ActivityRepository;

	private final LoginRepository loginRepo;

	private final RfiDescriptionRepository rfiDescriptionRepository;

	@Override
	@Transactional
	public RFI createRFI(RFI_DTO dto, String userName) {

		String contractShortName = dto.getContract();

		String contractId = dto.getContractId();

		if (contractId == null) {
			throw new RuntimeException("No contract ID found for short name: " + contractShortName);
		}

		long totalCount = rfiRepository.count() + 1;
		String rfiNumber = String.format("RFI%04d", totalCount);
		String date = LocalDate.now().format(DateTimeFormatter.ofPattern("MMddyy"));
		String revision = "R0";

		String rfiId = String.format("%s/%s/%s/%s/%s/%s", contractId, userName, date, dto.getActivity(), rfiNumber,
				revision);

		RFI rfi = new RFI();
		rfi.setRfi_Id(rfiId);
		rfi.setContract(dto.getContract());
		rfi.setContractId(dto.getContractId());
		rfi.setProject(dto.getProject());
		rfi.setWork(dto.getWork());
		rfi.setStructureType(dto.getStructureType());
		rfi.setStructure(dto.getStructure());
		rfi.setComponent(dto.getComponent());
		rfi.setElement(dto.getElement());
		rfi.setActivity(dto.getActivity());
		rfi.setRfiDescription(dto.getRfiDescription());
		rfi.setAction(dto.getAction());
		rfi.setTypeOfRFI(dto.getTypeOfRFI());
		rfi.setNameOfRepresentative(dto.getNameOfRepresentative());
		if (dto.getEnclosures() != null && !dto.getEnclosures().isEmpty()) {
			rfi.setEnclosures(String.join(",", dto.getEnclosures()));
		} else {
			rfi.setEnclosures("");
		}
		rfi.setLocation(dto.getLocation());

		rfi.setDescription(dto.getDescription());
		rfi.setTimeOfInspection(dto.getTimeOfInspection());
		rfi.setDateOfSubmission(dto.getDateOfSubmission() != null ? dto.getDateOfSubmission() : LocalDate.now());
		rfi.setDateOfInspection(dto.getDateOfInspection());
		rfi.setCreatedBy(userName);
		rfi.setDyHodUserId(dto.getDyHodUserId());
		rfi.setStatus(EnumRfiStatus.CREATED);

		return rfiRepository.save(rfi);
	}

	@Override
	public List<ContractDropdownDTO> getAllowedContractsForUser(String userId, String ContractorId) {
		User user = loginRepo.findById(userId).orElse(null);

		if (user == null)
			return Collections.emptyList();

		if ("IT Admin".equalsIgnoreCase(user.getUserRoleNameFk())) {
			return contractRepository.findAllContractShortNames();
		}

		return contractRepository.findAllowedContractShortNames(userId, ContractorId);
	}

	@Override
	public List<ProjectDTO> getAllProjectNames() {
		return projectRepository.findDistinctProjectNames();
	}

	@Override
	public List<WorkDTO> getWorkShortNamesByProjectId(String projectId) {
		return workRepository.findDistinctWorkShortNamesByProjectId(projectId);
	}

	@Override
	public List<ContractInfoProjection> getContractShortNamesByWorkId(String workId) {
		return contractRepository.findContractInfoByWorkId(workId);
	}

	@Override
	public List<String> getStructureTypeByContractId(String contractId) {

		return structureRepository.findStructureTypeByContractId(contractId);
	}

	@Override
	public List<String> getStructureByStructureTypeContractId(String structureType, String cpntractId) {
		return structureRepository.findStructureByStructureTypeAndContractId(structureType, cpntractId);
	}

	@Override
	public List<String> getComponentByStructureStructureTypeContractId(String structureType, String cpntractId,
			String structure) {
		return p6ActivityRepository.findComponentByStructureTypeAndContractIdAndStructure(structureType, cpntractId,
				structure);
	}

	@Override
	public List<String> getElementByStructureStructureTypeComponent(String contractId, String structureType,
			String structure, String component) {
		return p6ActivityRepository.findElementByStructureTypeAndStructureAndComponent(contractId, structureType,
				structure, component);
	}

	@Override
	public List<String> getActivityNamesByStructureStructureTypeComponentComponentId(String structureType,
			String structure, String component, String component_id) {
		return p6ActivityRepository.findActivityNamesByStructureTypeAndStructureAndComponentAndCompId(structureType,
				structure, component, component_id);
	}

	public List<RfiDescriptionDTO> getRfiDescriptionsByActivity(String activity) {
		List<RfiDescription> descriptions = rfiDescriptionRepository.findByActivity(activity);

		return descriptions.stream()
				.map(desc -> new RfiDescriptionDTO(desc.getRfiDescription(),
						Arrays.stream(desc.getEnclosures().split(",")).map(String::trim).collect(Collectors.toList())))
				.collect(Collectors.toList());
	}

	@Override
	public List<Map<String, Object>> getContractors(String userId) {
		System.out.println("Fetching contractors for manager userId: " + userId);
		List<Map<String, Object>> result = loginRepo.findContractorsByReporting(userId);
		System.out.println("Result size: " + result.size());
		return result;
	}

	@Override
	public List<String> getContractorUserNamesWithReportingId(String loggedInUserName) {

		// Fetch logged-in user details (list of usernames)
		List<String> loggedInUsers = loginRepo.findUserNamesByUserName(loggedInUserName);

		// If user not found
		if (loggedInUsers == null || loggedInUsers.isEmpty()) {
			return Collections.emptyList();
		}

		// Check if logged-in user is contractor
		boolean isContractor = loginRepo.findByUserName(loggedInUserName).stream()
				.anyMatch(u -> "Contractor".equalsIgnoreCase(u.getUserRoleNameFk()));

		if (!isContractor) {
			return Collections.emptyList();
		}

		// Fetch only contractor usernames with reporting IDs
		return loginRepo.findAllContractorUserNamesWithReportingId();
	}
	
	
	
	

	@Override
	public List<RfiListDTO> getAllRFIs() {
		return rfiRepository.findAllRfiList();
	}

	@Override
	public String updateRfi(Long id, RFI_DTO rfiDto) {
		Optional<RFI> optionalRfi = rfiRepository.findById(id);

		if (optionalRfi.isPresent()) {
			RFI existingRfi = optionalRfi.get();

			existingRfi.setProject(rfiDto.getProject());
			existingRfi.setWork(rfiDto.getWork());
			existingRfi.setContract(rfiDto.getContract());
			existingRfi.setStructureType(rfiDto.getStructureType());
			existingRfi.setStructure(rfiDto.getStructure());
			existingRfi.setComponent(rfiDto.getComponent());
			existingRfi.setElement(rfiDto.getElement());
			existingRfi.setActivity(rfiDto.getActivity());
			existingRfi.setRfiDescription(rfiDto.getRfiDescription());
			existingRfi.setAction(rfiDto.getAction());
			existingRfi.setTypeOfRFI(rfiDto.getTypeOfRFI());
			existingRfi.setNameOfRepresentative(rfiDto.getNameOfRepresentative());
			existingRfi.setTimeOfInspection(rfiDto.getTimeOfInspection());
			existingRfi.setDateOfSubmission(rfiDto.getDateOfSubmission());
			existingRfi.setDateOfInspection(rfiDto.getDateOfInspection());
			existingRfi.setEnclosuresList(rfiDto.getEnclosures());
			existingRfi.setLocation(rfiDto.getLocation());
			existingRfi.setDescription(rfiDto.getDescription());

			// ✅ Set status based on action
			String action = rfiDto.getAction();
			if ("Reschedule".equalsIgnoreCase(action)) {
				existingRfi.setStatus(EnumRfiStatus.RESCHEDULED);
			} else if ("Reassign".equalsIgnoreCase(action)) {
				existingRfi.setStatus(EnumRfiStatus.REASSIGNED);
			} else {
				existingRfi.setStatus(EnumRfiStatus.UPDATED);
			}

			String updatedRfiId = incrementRevision(existingRfi.getRfi_Id());
			existingRfi.setRfi_Id(updatedRfiId);

			rfiRepository.save(existingRfi);

			return "✅ RFI updated successfully.";
		} else {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "❌ RFI not found with ID: " + id);
		}
	}

	private String incrementRevision(String rfiId) {
		if (rfiId == null || !rfiId.contains("/R")) {
			return rfiId;
		}

		String[] parts = rfiId.split("/");
		String lastPart = parts[parts.length - 1];

		if (lastPart.startsWith("R")) {
			try {
				int revision = Integer.parseInt(lastPart.substring(1));
				parts[parts.length - 1] = "R" + (revision + 1);
			} catch (NumberFormatException e) {
				parts[parts.length - 1] = "R1";
			}
		} else {
			parts[parts.length - 1] = "R1";
		}

		return String.join("/", parts);
	}

	@Override
	public boolean assignPersonToClient(String rfi_Id, String assignedPersonClient, String clientDepartment) {
		Optional<RFI> optional = rfiRepository.findByRfiId(rfi_Id);
		if (optional.isPresent()) {
			RFI rfi = optional.get();
			System.out.println("Assigned: " + assignedPersonClient + ", Dept: " + clientDepartment);
			rfi.setAssignedPersonClient(assignedPersonClient);
			rfi.setClientDepartment(clientDepartment);
			rfiRepository.save(rfi);
			return true;
		}
		return false;
	}

	@Override
	public List<RfiListDTO> getRFIsByCreatedBy(String createdBy) {
		return rfiRepository.findByCreatedBy(createdBy);
	}

	@Override
	public List<RfiListDTO> getRFIsCreatedBy(String createdBy) {
		return rfiRepository.getRFIsCreatedBy(createdBy);
	}
	
	@Override
	 public List<RfiListDTO> getRFIsByRepresentative(String representative) {
       return rfiRepository.findByRepresentative(representative);
   }


	@Override
	public List<RfiListDTO> getRFIsAssignedTo(String assignedPersonClient) {
		return rfiRepository.findByAssignedPersonClient(assignedPersonClient);
	}

	@Override
	public int countByTotalRfiCreated() {
		return rfiRepository.countOfAllRfiCreatedSoFar();
	}

	@Override
	public int countByAssignedTo(String assignedTo) {
		return rfiRepository.countByAssignedPersonClient(assignedTo);

	}

	@Override
	public int countByCreatedBy(String createdBy) {
		return rfiRepository.countByCreatedBy(createdBy);
	}
	
	
	@Override
	@Transactional
	public void assignExecutiveToRfis(List<Integer> rfiIds, String executive, String department) {
	    int updatedCount = rfiRepository.updateExecutivesForRfis(rfiIds, executive, department);

	    if (updatedCount == 0) {
	        throw new RuntimeException("No RFIs were updated. Check if RFI IDs exist: " + rfiIds);
	    }
	}



}
