package com.metro.rfisystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.metro.rfisystem.backend.model.rfi.RfiDescription;
import com.metro.rfisystem.backend.repository.rfi.RfiDescriptionRepository;

import java.util.List;

@RestController
@RequestMapping("/rfi")
@CrossOrigin(origins = "http://localhost:3000") 
public class RfiDescriptionController {

    @Autowired
    private RfiDescriptionRepository repository;

    @GetMapping("Referenece-Form")
    public List<RfiDescription> getAll() {
        return repository.findAll();
    }

    @PostMapping("send-data")
    public RfiDescription create(@RequestBody RfiDescription rfi) {
        return repository.save(rfi);
    }

    @PutMapping("Update/{id}")
    public RfiDescription update(@PathVariable int id, @RequestBody RfiDescription rfiDetails) {
        return repository.findById(id).map(rfi -> {
            rfi.setActivity(rfiDetails.getActivity());
            rfi.setRfiDescription(rfiDetails.getRfiDescription());
            rfi.setEnclosures(rfiDetails.getEnclosures());
            return repository.save(rfi);
        }).orElseThrow(() -> new RuntimeException("RFI not found with id " + id));
    }

}

