package com.metro.rfisystem.backend.serviceImpl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.metro.rfisystem.backend.dto.ContractInfoProjection;
import com.metro.rfisystem.backend.dto.ProjectDTO;
import com.metro.rfisystem.backend.dto.RFI_DTO;
import com.metro.rfisystem.backend.dto.WorkDTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.repository.pmis.ContractRepository;
import com.metro.rfisystem.backend.repository.pmis.P6ActivityRepository;
import com.metro.rfisystem.backend.repository.pmis.ProjectRepository;
import com.metro.rfisystem.backend.repository.pmis.StructureRepository;
import com.metro.rfisystem.backend.repository.pmis.WorkRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
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

	@Override
	@Transactional
	public RFI createRFI(RFI_DTO dto) {
		
		
		RFI rfi = new RFI();
		
	

		rfi.setProject(dto.getProject());
		rfi.setWork(dto.getWork());
		rfi.setContract(dto.getContract());
		rfi.setStructureType(dto.getStructureType());
		rfi.setStructure(dto.getStructure());
		rfi.setComponent(dto.getComponent());
		rfi.setElement(dto.getElement());
		rfi.setActivity(dto.getActivity());
		rfi.setRfiDescription(dto.getRfiDescription());
		rfi.setAction(dto.getAction());
		rfi.setTypeOfRFI(dto.getTypeOfRFI());
		rfi.setNameOfRepresentative(dto.getNameOfRepresentative());
		rfi.setEnclosures(dto.getEnclosures());
		rfi.setLocation(dto.getLocation());
		rfi.setDescription(dto.getDescription());

		// Automatically set submission date if not passed
		rfi.setDateOfSubmission(dto.getDateOfSubmission() != null ? dto.getDateOfSubmission() : LocalDate.now());
		rfi.setDateOfInspection(dto.getDateOfInspection());

		return rfiRepository.save(rfi);
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
	public List<String> getElementByStructureStructureTypeComponent(String structureType, String structure,
			String component) {
		return p6ActivityRepository.findElementByStructureTypeAndStructureAndComponent(structureType, structure,
				component);
	}

	@Override
	public List<String> getActivityNamesByStructureStructureTypeComponentComponentId(String structureType,
			String structure, String component, String component_id) {
		return p6ActivityRepository.findActivityNamesByStructureTypeAndStructureAndComponentAndCompId(structureType,
				structure, component, component_id);
	}

}
