package com.metro.rfisystem.backend.service;

import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

import com.metro.rfisystem.backend.dto.UserProfileDTO;
import com.metro.rfisystem.backend.dto.UserUpdateDTO;
import com.metro.rfisystem.backend.model.pmis.User;

public interface UserService {
	 
	 UserProfileDTO getUserProfile(String userId);
	 
     boolean updateContactDetails(String userId, UserUpdateDTO dto);

     boolean checkUserDSC(String userId);

	 byte[] getUserDSCImage(String userId);

	 boolean saveUserSignature(String userId, String eSignResponse, String signerName);
	 
	 public Optional<User> findById(String userId);

}
