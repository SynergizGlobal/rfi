package com.metro.rfisystem.backend.serviceImpl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.metro.rfisystem.backend.dto.UserProfileDTO;
import com.metro.rfisystem.backend.dto.UserUpdateDTO;
import com.metro.rfisystem.backend.model.pmis.User;
import com.metro.rfisystem.backend.repository.pmis.UserRepository;
import com.metro.rfisystem.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

	@Autowired
	 private final UserRepository userRepository;
	    
	    @Override
	    public UserProfileDTO getUserProfile(String userId) {
	        Optional<User> userOpt = userRepository.findByUserIdIgnoreCase(userId);

	        if (!userOpt.isPresent()) {
	            return null; // or throw custom exception
	        }

	        User user = userOpt.get();
	        return mapToDTO(user);
	    }

	    private UserProfileDTO mapToDTO(User user) {
	        UserProfileDTO dto = new UserProfileDTO();
	        dto.setName(user.getUserName());
	        dto.setRole(user.getUserRoleNameFk());
	        dto.setEmail(user.getEmailId());
	        dto.setPhone(user.getMobileNumber() != null ? user.getMobileNumber().toString() : null);
	        dto.setPersonalNumber(user.getPersonalContactNumber() != null ? String.valueOf(user.getPersonalContactNumber().longValue()) : null);
	        dto.setUserRole(user.getUserRoleNameFk());
	        dto.setUserType(user.getUserTypeFk());
	        dto.setDepartment(user.getDepartmentFk());
	        dto.setReportingTo(user.getReportingToIdSrfk());
	        dto.setLandLine(user.getLandline() != null ? user.getLandline().toString() : null);
	        dto.setExtension(user.getExtension() != null ? user.getExtension().toString() : null);
	        dto.setPmisKey(user.getPmisKeyFk());
	        return dto;
	    }
	    
	    @Override
	    public boolean updateContactDetails(String userId, UserUpdateDTO dto) {
	        Optional<User> userOpt = userRepository.findByUserIdIgnoreCase(userId);
	        if (!userOpt.isPresent()) return false;

	        User user = userOpt.get();

	        if (dto.getEmail() != null) {
	            user.setEmailId(dto.getEmail());
	        }

	        if (dto.getPhone() != null && !dto.getPhone().isEmpty()) {
	            user.setMobileNumber(Long.parseLong(dto.getPhone()));
	        }

	        if (dto.getPersonalNumber() != null && !dto.getPersonalNumber().isEmpty()) {
	            user.setPersonalContactNumber(Double.parseDouble(dto.getPersonalNumber()));
	        }

	        userRepository.save(user);
	        return true;
	    }
}
