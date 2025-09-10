package com.metro.rfisystem.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.metro.rfisystem.backend.dto.UserProfileDTO;
import com.metro.rfisystem.backend.dto.UserUpdateDTO;
import com.metro.rfisystem.backend.repository.pmis.ContractRepository;
import com.metro.rfisystem.backend.repository.pmis.P6ActivityRepository;
import com.metro.rfisystem.backend.repository.rfi.RFIRepository;
import com.metro.rfisystem.backend.service.RFIService;
import com.metro.rfisystem.backend.service.UserService;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {
	@GetMapping("/hello")
    public String hello() {
        return "Hello from backend";
    }
	
	@Autowired
	private final UserService userService;
	
	@GetMapping("/profile/{userId}")
	public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
	    UserProfileDTO dto = userService.getUserProfile(userId);

	    if (dto == null) {
	        return ResponseEntity.notFound().build();
	    }

	    return ResponseEntity.ok(dto);
	}
	
	@PutMapping("/profile/{userId}/contact")
	public ResponseEntity<?> updateContactDetails(
	        @PathVariable String userId,
	        @RequestBody UserUpdateDTO dto) {

	    boolean updated = userService.updateContactDetails(userId, dto);

	    if (!updated) {
	        return ResponseEntity.notFound().build();
	    }

	    return ResponseEntity.ok("Contact details updated successfully.");
	}

	
	@PostMapping("/profile/contact")
	public ResponseEntity<?> createUserContact(@RequestBody UserUpdateDTO dto) {
	    return ResponseEntity.ok("Received contact info");
	}

}
