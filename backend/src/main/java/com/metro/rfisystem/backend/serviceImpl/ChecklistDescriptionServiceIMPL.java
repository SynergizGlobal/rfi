package com.metro.rfisystem.backend.serviceImpl;


import com.metro.rfisystem.backend.dto.CheckListDescriptionDto;
import com.metro.rfisystem.backend.dto.ChecklistDTO;
import com.metro.rfisystem.backend.dto.ChecklistProjection;
import com.metro.rfisystem.backend.model.rfi.ChecklistDescription;
import com.metro.rfisystem.backend.model.rfi.RfiEnclosureMaster;
import com.metro.rfisystem.backend.repository.rfi.ChecklistDescriptionRepository;
import com.metro.rfisystem.backend.repository.rfi.EncloserMasterRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChecklistDescriptionServiceIMPL {
    private final ChecklistDescriptionRepository descriptionRepository;
    private final EncloserMasterRepository masterRepository;

    @Transactional
    public List<ChecklistDescription> save(Long id, CheckListDescriptionDto dto) {
        RfiEnclosureMaster enclosureMaster = masterRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Checklist id not found"));

        ChecklistDescription description = new ChecklistDescription();
        description.setChecklistDescription(dto.checkListDescription());
        description.setEnclosureMasters(enclosureMaster);
        descriptionRepository.save(description);

        return descriptionRepository.findAllChecklistDescriptionByEnclosureMastersId(id);
    }

    @Transactional
    public List<ChecklistDescription> update(Long id, CheckListDescriptionDto dto) {
        ChecklistDescription description = descriptionRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Checklist id not found"));
        description.setChecklistDescription(dto.checkListDescription());
        ChecklistDescription saved = descriptionRepository.save(description);
        Long masterId = saved.getEnclosureMasters().getId();
        return descriptionRepository.findAllChecklistDescriptionByEnclosureMastersId(masterId);
    }

    @Transactional
    public List<ChecklistDescription> deleteById(Long id) {
        ChecklistDescription description = descriptionRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Checklist id not found"));
        Long masterId = description.getEnclosureMasters().getId();
        descriptionRepository.delete(description);
        return descriptionRepository.findAllChecklistDescriptionByEnclosureMastersId(masterId);
    }

    @Transactional(readOnly = true)
    public List<ChecklistDescription> findAllByEn(Long id) {
        return descriptionRepository.findAllChecklistDescriptionByEnclosureMastersId(id);
    }
    
   
    public List<ChecklistDTO> getChecklists(String enclosername) {
        List<ChecklistProjection> projections = descriptionRepository
            .findAllWithConditionalChecklistDescription(enclosername);
        
        return projections.stream()
            .map(proj -> new ChecklistDTO(
                proj.getId(),
                proj.getEnclosername(),
                proj.getAction(),
                proj.getChecklisttitle(),
                proj.getChecklistDescription()
            ))
            .collect(Collectors.toList());
    }
	}

