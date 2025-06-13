package com.metro.rfisystem.backend.serviceImpl;

import java.time.LocalDate;


import org.springframework.stereotype.Service;

import com.metro.rfisystem.backend.dto.RFI_DTO;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.RFIService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RFIServiceImpl implements RFIService {

   
    private final RFIRepository rfiRepository;

    @Override
    public RFI createRFI(RFI_DTO dto) {
        RFI rfi = new RFI();

       // rfi.setProject(dto.getProject());
       // rfi.setWork(dto.getWork());
      //  rfi.setContract(dto.getContact());
        rfi.setStructureType(dto.getStructureType());
      //  rfi.setStructure(dto.getStructure());
       //.setComponent(dto.getComponent());
      //  rfi.setElement(dto.getElement());
       // rfi.setActivity(dto.getActivity());
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

	
}
