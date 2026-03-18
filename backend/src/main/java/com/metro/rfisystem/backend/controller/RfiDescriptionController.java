package com.metro.rfisystem.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metro.rfisystem.backend.model.rfi.RfiDescription;
import com.metro.rfisystem.backend.repository.pmis.P6ActivityRepository;
import com.metro.rfisystem.backend.repository.rfi.RfiDescriptionRepository;

@RestController
@RequestMapping("/rfi")
@CrossOrigin(origins = "https://localhost:3000") 
public class RfiDescriptionController {

    @Autowired
    private RfiDescriptionRepository repository;
    
    @Autowired P6ActivityRepository repo;

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
            rfi.setPmisCalc(rfiDetails.getPmisCalc());
            return repository.save(rfi);
        }).orElseThrow(() -> new RuntimeException("RFI not found with id " + id));
    }
    
    @GetMapping("get-activitey-names")
    public Map<String,Object> getActivityNamesReferenceForm(){
    	Map<String,Object> res = new HashMap<>();
    	List<String> list = repo.p6ActivityNamesReferenceForm();
    	if(!list.isEmpty() && list != null) {
        	res.put("ActivityList", list);
    	}
    	else
    	{
    		res.put("No-Result", list);
    	}
    	return res;
    }

}

