package com.metro.rfisystem.backend.service;

import java.util.List;

import com.metro.rfisystem.backend.dto.ContractDropdownDTO;
import com.metro.rfisystem.backend.dto.ContractInfoProjection;
import com.metro.rfisystem.backend.dto.ProjectDTO;
import com.metro.rfisystem.backend.dto.RFI_DTO;
import com.metro.rfisystem.backend.dto.RfiListDTO;
import com.metro.rfisystem.backend.dto.WorkDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;

public interface RFIService {
	RFI createRFI(RFI_DTO dto, String userName);

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

	List<RfiListDTO> getRFIsCreatedBy(String createdBy);

	List<ContractDropdownDTO> getAllowedContractsForUser(String userId);

}