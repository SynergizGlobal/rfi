package com.metro.rfisystem.backend.service;

import java.util.List;
import java.util.Map;

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

import jakarta.servlet.http.HttpSession;

public interface RFIService {
	RFI createRFI(RFI_DTO dto, String userName, String emailId);

	List<ProjectDTO> getAllProjectNames();

	List<WorkDTO> getWorkShortNamesByProjectId(String projectId);

	List<ContractInfoProjection> getContractShortNamesByWorkId(String workId);

	List<String> getStructureTypeByContractId(String contractId);

	List<String> getStructureByStructureTypeContractId(String structureType, String cpntractId);

	List<String> getComponentByStructureStructureTypeContractId(String structureType, String contractId,
			String structure);

	List<String> getElementByStructureStructureTypeComponent(String contractId, String structureType, String structure,
			String component);

	List<String> getActivityNamesByStructureStructureTypeComponentComponentId(String structureType, String structure,
			String component, String component_id);

	List<RfiListDTO> getAllRFIs();

	String updateRfi(Long id, RFI_DTO rfiDto);

	boolean assignPersonToClient(String rfi_Id, String assignedPersonClient, String clientDepartment);

	List<RfiListDTO> getRFIsByCreatedBy(String userName);

	List<RfiListDTO> getRFIsAssignedTo(String userName);

	int countByTotalRfiCreated();

	int countByAssignedTo(String userName);

	int countByCreatedBy(String createdBy);
	
	int countByRegularUser(String regularUser);

	List<RfiListDTO> getRFIsCreatedBy(String createdBy);

//	List<ContractDropdownDTO> getAllowedContractsForUser(String userId);

	List<ContractDropdownDTO> getAllowedContractsForUser(String userId, String ContractorId);

	List<RfiDescriptionDTO> getRfiDescriptionsByActivity(String activity);


	List<Map<String, Object>> getContractors(String userId);


	List<String> getContractorUserNamesWithReportingId(String loggedInUserName);


	List<RfiListDTO> getRFIsByRepresentative(String userName);

	List<Map<String, Object>> getRegularUsers(String userId);

	List<Map<String, Object>> getAllRepresentativesReportingToContractor();
	
	String closeRfi(long rfiId);


	
}