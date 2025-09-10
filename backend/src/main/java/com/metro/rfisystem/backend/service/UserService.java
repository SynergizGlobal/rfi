package com.metro.rfisystem.backend.service;

import com.metro.rfisystem.backend.dto.UserProfileDTO;
import com.metro.rfisystem.backend.dto.UserUpdateDTO;

public interface UserService {
	 
	 UserProfileDTO getUserProfile(String userId);
	 
     boolean updateContactDetails(String userId, UserUpdateDTO dto);



}
