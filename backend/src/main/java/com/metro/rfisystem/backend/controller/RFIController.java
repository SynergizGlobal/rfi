package com.metro.rfisystem.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.metro.rfisystem.backend.dto.ContractInfoProjection;
import com.metro.rfisystem.backend.dto.ProjectDTO;
import com.metro.rfisystem.backend.dto.RFI_DTO;
import com.metro.rfisystem.backend.dto.WorkDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.service.RFIService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/rfi")
@RequiredArgsConstructor
public class RFIController {

	private final RFIService rfiService;

	@PostMapping("/create")
	public ResponseEntity<String> createRFI(@RequestBody RFI_DTO dto) {
		RFI saved = rfiService.createRFI(dto);
		return ResponseEntity.ok("RFI created successfully with ID: " + saved.getId());
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
			@RequestParam(name = "structureType", required = false) String structureType,
			@RequestParam(name = "structure", required = false) String structure,
			@RequestParam(name = "component", required = false) String component) {
		return rfiService.getElementByStructureStructureTypeComponent(structureType, structure, component);
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
}
