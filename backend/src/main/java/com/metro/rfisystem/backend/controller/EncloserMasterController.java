package com.metro.rfisystem.backend.controller;

import java.util.List;

import com.metro.rfisystem.backend.dto.*;
import com.metro.rfisystem.backend.model.rfi.ChecklistDescription;
import com.metro.rfisystem.backend.serviceImpl.ChecklistDescriptionServiceIMPL;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.metro.rfisystem.backend.model.rfi.RfiEnclosureMaster;
import com.metro.rfisystem.backend.repository.rfi.ChecklistDescriptionRepository;
import com.metro.rfisystem.backend.service.EncloserMasterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/enclouser")
public class EncloserMasterController {

    private final EncloserMasterService service;
    private final ChecklistDescriptionServiceIMPL checklistDescriptionService;
    private final ChecklistDescriptionRepository descriptionRepository;

    @GetMapping("/by-action")
    public ResponseEntity<List<RfiEnclosureDTO>> getEnclosuresByAction(
            @RequestParam(defaultValue = "OPEN") String action) {

        List<RfiEnclosureDTO> enclosureList = service.getDistinctEncloserNamesByAction(action);

        return ResponseEntity.ok(enclosureList);
    }

    @PostMapping("/addDesctiption/{id}")
    public ResponseEntity<List<ChecklistDescription>> addCheckListDescription(@PathVariable Long id, @RequestBody CheckListDescriptionDto dto) {


        return ResponseEntity.ok(checklistDescriptionService.save(id, dto));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<List<ChecklistDescription>> updateCheckListDescription(@PathVariable Long id, @RequestBody CheckListDescriptionDto dto) {
        return ResponseEntity.ok(checklistDescriptionService.update(id, dto));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<List<ChecklistDescription>> deleteCheckListDescription(@PathVariable Long id) {
        return ResponseEntity.ok(checklistDescriptionService.deleteById(id));
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<List<ChecklistDescription>> findAllByEncloserMaster(@PathVariable Long id) {
        return ResponseEntity.ok(checklistDescriptionService.findAllByEn(id));
    }

    @GetMapping("/description")
    public List<CheckListResponse> getAllChecklistsDescriptionByEnclosure(@RequestParam String enclosername) {
        return checklistDescriptionService.getChecklistDesciptionDetails(enclosername);
    }

    @GetMapping("/checklist-items")
    public List<CheckListResponse> getAllChecklistsDescriptionByEnclosureAndRfi( @RequestParam("enclosureName") String enclosername,  @RequestParam Long rfiId) {

        return checklistDescriptionService.getChecklistDesciptionDetails(enclosername,rfiId);
    }

    
    @GetMapping("/names")
    public ResponseEntity<List<EnclosureNameDto>> getEnclosureNames(
            @RequestParam(defaultValue = "OPEN") String action) {
        List<EnclosureNameDto> names = service.getEnclosureNamesByAction(action);
        return ResponseEntity.ok(names);
    }

    @PostMapping("/submit")
    public ResponseEntity<RfiEnclosureMaster> addEnclosure(@RequestBody EnclosureNameDto dto) {
        RfiEnclosureMaster entity;

        if (dto.getId() != null) {
            entity = service.findById(dto.getId())
                    .orElseThrow(() -> new EntityNotFoundException("No enclosure found with ID: " + dto.getId()));
            entity.setEncloserName(dto.getEncloserName());
        } else {
            entity = new RfiEnclosureMaster();
            entity.setEncloserName(dto.getEncloserName());
            entity.setAction("OPEN"); // Optional default
        }

        RfiEnclosureMaster saved = service.saveEnclosure(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/updateEnclosureName/{id}")
    public ResponseEntity<RfiEnclosureMaster> updateEnclosure(@PathVariable Long id, @RequestBody EnclosureNameDto dto) {
        RfiEnclosureMaster existing = service.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No enclosure found with ID: " + id));

        existing.setEncloserName(dto.getEncloserName());
        RfiEnclosureMaster updated = service.saveEnclosure(existing);

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/deleteEncloserName/{id}")
    public ResponseEntity<Void> deleteEnclosure(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }


}
