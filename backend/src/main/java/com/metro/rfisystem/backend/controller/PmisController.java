package com.metro.rfisystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metro.rfisystem.backend.dto.RfiActivityProgressDTO;
import com.metro.rfisystem.backend.repository.pmis.P6ActivityRepository;

@RestController
@RequestMapping("/pmis")
public class PmisController {

	@Autowired
	P6ActivityRepository repo;
  
	
	@PostMapping("/saveRfiActivityProgress")
	public ResponseEntity<String> saveRfiActivityProgress(@RequestBody RfiActivityProgressDTO payload) {

	    try {
	        repo.insertRfiProgress(
	            payload.getRfiInspectionDate(),
	            payload.getP6ActivityIdFk(),
	            payload.getCompletedScope()
	        );

	        return ResponseEntity.ok("Saved successfully");

	    } catch (Exception e) {
	        return ResponseEntity.status(500).body("Error saving data");
	    }
	}
      
}