package com.metro.rfisystem.backend.controller;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.UserDTO;
import com.metro.rfisystem.backend.dto.UserProfileDTO;
import com.metro.rfisystem.backend.dto.UserUpdateDTO;
import com.metro.rfisystem.backend.repository.pmis.ContractRepository;
import com.metro.rfisystem.backend.repository.pmis.P6ActivityRepository;
import com.metro.rfisystem.backend.repository.pmis.UserRepository;
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
	
	private final UserRepository userRepository;
	
	@Value("${rfi.dsc.storage-path}")
	private String dscStoragePath;
	
	@GetMapping("/users")
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(user -> new UserDTO(user.getUserId(), user.getUserName()))
            .collect(Collectors.toList());
    }
	
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
	@GetMapping("/checkUserDSC") 
	public ResponseEntity<Map<String, Object>> checkUserDSC(@RequestParam String userId) {
	    try {
	        boolean exists = userService.checkUserDSC(userId);

	        Map<String, Object> response = new HashMap<>();
	        response.put("userId", userId);
	        response.put("exists", exists);

	        return ResponseEntity.ok(response);
	    } catch (Exception e) {
	        e.printStackTrace();
	        Map<String, Object> errorResponse = new HashMap<>();
	        errorResponse.put("error", e.getMessage());
	        return ResponseEntity.status(500).body(errorResponse);
	    }
	}
	
	@GetMapping("/checkUserSignature")
	public ResponseEntity<Map<String, Object>> checkUserSignature(@RequestParam String userId) {
	    boolean exists = checkUserSign(userId);

	    Map<String, Object> response = new HashMap<>();
	    response.put("exists", exists);

	    return ResponseEntity.ok(response);
	}
//    private static final String DSC_BASE_PATH = "C:/projects/rfi/dsc/"; 

    public boolean checkUserSign(String userId) {
        if (userId == null || userId.isEmpty()) {
            System.out.println("Invalid userId");
            return false;
        }

        // User folder path
        File userFolder = new File(dscStoragePath, userId);
        System.out.println("User folder path: " + userFolder.getAbsolutePath());
        System.out.println("Folder exists: " + userFolder.exists());
        System.out.println("Is directory: " + userFolder.isDirectory());

        // Check signed.xml
        File signedXmlFile = new File(userFolder, "signed.xml");
        System.out.println("Signed XML path: " + signedXmlFile.getAbsolutePath());
        System.out.println("Signed XML exists: " + signedXmlFile.exists());

        return signedXmlFile.exists();
    }

    @PostMapping("/saveUserDSC")
    public ResponseEntity<?> saveUserDSC(
            @RequestParam String userId,
            @RequestParam String signerName,
            @RequestParam String eSignResponse) {

        boolean status = userService.saveUserSignature(userId, eSignResponse, signerName);

        if (status) {
            return ResponseEntity.ok("DSC Saved Successfully");
        } else {
            return ResponseEntity.status(500).body("Failed to save DSC");
        }
    }



    // Serve DSC image (for printing PDF)
    @GetMapping("/getUserDSCImage/{userId}")
    public ResponseEntity<byte[]> getUserDSCImage(@PathVariable String userId) {
        try {
            byte[] imageBytes = userService.getUserDSCImage(userId);
            if (imageBytes == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok().header("Content-Type", "image/png").body(imageBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

}
