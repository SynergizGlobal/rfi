package com.metro.rfisystem.backend.serviceImpl;


import com.metro.rfisystem.backend.dto.CheckListDescriptionDto;
import com.metro.rfisystem.backend.dto.CheckListResponse;
import com.metro.rfisystem.backend.dto.ChecklistDTO;
import com.metro.rfisystem.backend.dto.ChecklistProjection;
import com.metro.rfisystem.backend.model.rfi.ChecklistDescription;
import com.metro.rfisystem.backend.model.rfi.RFIChecklistItem;
import com.metro.rfisystem.backend.model.rfi.RfiEnclosureMaster;
import com.metro.rfisystem.backend.repository.rfi.ChecklistDescriptionRepository;
import com.metro.rfisystem.backend.repository.rfi.EncloserMasterRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIInspectionChecklistRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChecklistDescriptionServiceIMPL {
    private final ChecklistDescriptionRepository descriptionRepository;
    private final EncloserMasterRepository masterRepository;
    private final RFIInspectionChecklistRepository checklistItemRepository;


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

    public List<CheckListResponse>getChecklistDesciptionDetails(String encloserName) {
        List<ChecklistProjection> allWithConditionalChecklistDescription =
                descriptionRepository.findAllChecklistDescriptionByName(encloserName);


        List<Long> listOfCheckListIds = allWithConditionalChecklistDescription.stream().map(ChecklistProjection::getChecklistId).toList();


        List<ChecklistDescription> allById = descriptionRepository.findAllById(listOfCheckListIds);

        List<CheckListResponse> list = allById.stream().map(check -> {
            CheckListResponse response = new CheckListResponse();
            response.setChecklistDescId(check.getId());
            response.setChecklistDescription(check.getChecklistDescription());
            return response;
        }).toList();
        List<Long> checkListDescriptionIds = allById.stream().map(ChecklistDescription::getId).toList();

        List<RFIChecklistItem> byChecklistDescription = checklistItemRepository.findByChecklistDescription(checkListDescriptionIds);

        for (CheckListResponse res : list) {
            RFIChecklistItem matchedItem =
                    byChecklistDescription.stream().filter(item -> item.getChecklistDescription().getId().equals(res.getChecklistDescId()))
                            .findFirst().orElse(null);
            if(matchedItem != null) {
                res.setEngineerStatus(matchedItem.getEngineerStatus());
                res.setContractorStatus(matchedItem.getContractorStatus());
                res.setContractorRemarks(matchedItem.getContractorRemark());
                res.setEngineerRemark(matchedItem.getAeRemark());
            }
        }

        return list;

    }
    
    public List<CheckListResponse>getChecklistDesciptionDetails(String encloserName, Long rfiId) {
        List<ChecklistProjection> allWithConditionalChecklistDescription =
                descriptionRepository.findAllChecklistDescriptionByName(encloserName);


        List<Long> listOfCheckListIds = allWithConditionalChecklistDescription.stream().map(ChecklistProjection::getChecklistId).toList();


        List<ChecklistDescription> allById = descriptionRepository.findAllById(listOfCheckListIds);

        List<CheckListResponse> list = allById.stream().map(check -> {
            CheckListResponse response = new CheckListResponse();
            response.setChecklistDescId(check.getId());
            response.setChecklistDescription(check.getChecklistDescription());
            return response;
        }).toList();
        List<Long> checkListDescriptionIds = allById.stream().map(ChecklistDescription::getId).toList();

        List<RFIChecklistItem> byChecklistDescription = checklistItemRepository.findByChecklistDescriptionAndRfi(checkListDescriptionIds, rfiId);

        for (CheckListResponse res : list) {
            RFIChecklistItem matchedItem =
                    byChecklistDescription.stream().filter(item -> item.getChecklistDescription().getId().equals(res.getChecklistDescId()))
                            .findFirst().orElse(null);
            if(matchedItem != null) {
                res.setEngineerStatus(matchedItem.getEngineerStatus());
                res.setContractorStatus(matchedItem.getContractorStatus());
                res.setContractorRemarks(matchedItem.getContractorRemark());
                res.setEngineerRemark(matchedItem.getAeRemark());
            }
        }

        return list;

    }
}

