package com.metro.rfisystem.backend.controller;

import java.util.List;

import com.metro.rfisystem.backend.dto.CheckListDescriptionDto;
import com.metro.rfisystem.backend.dto.ChecklistProjection;
import com.metro.rfisystem.backend.dto.EnclosureNameDto;
import com.metro.rfisystem.backend.model.rfi.ChecklistDescription;
import com.metro.rfisystem.backend.serviceImpl.ChecklistDescriptionServiceIMPL;
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
    public ResponseEntity<List<RfiEnclosureMaster>> getEnclosuresByAction(
            @RequestParam(defaultValue = "OPEN") String action) {

        List<RfiEnclosureMaster> distinctEncloserNamesByAction = service.getDistinctEncloserNamesByAction(action);
        return ResponseEntity.ok(distinctEncloserNamesByAction);
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
    public List<ChecklistProjection> getAllChecklistsDescriptionByEnclosure(@RequestParam String enclosername) {
        return descriptionRepository.findAllWithConditionalChecklistDescription(enclosername);
    }
    
    @GetMapping("/names")
    public ResponseEntity<List<EnclosureNameDto>> getEnclosureNames(
            @RequestParam(defaultValue = "OPEN") String action) {
        List<EnclosureNameDto> names = service.getEnclosureNamesByAction(action);
        return ResponseEntity.ok(names);
    }

}
