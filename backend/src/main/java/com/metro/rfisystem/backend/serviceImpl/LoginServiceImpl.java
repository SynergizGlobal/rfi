package com.metro.rfisystem.backend.serviceImpl;

import com.metro.rfisystem.backend.config.EncryptDecrypt;
import com.metro.rfisystem.backend.exception.AuthenticationException;
import com.metro.rfisystem.backend.model.pmis.User;
import com.metro.rfisystem.backend.repository.pmis.ContractExecutiveRepository;
import com.metro.rfisystem.backend.repository.pmis.ContractRepository;
import com.metro.rfisystem.backend.repository.pmis.LoginRepository;
import com.metro.rfisystem.backend.service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LoginServiceImpl implements LoginService {
	

	@Autowired
	private LoginRepository loginRepo;
	
	@Autowired
	private ContractRepository contractRepo;
	
	@Autowired
	private ContractExecutiveRepository contractExecutiveRepo;

	@Override
	public User authenticate(String userName, String password) throws AuthenticationException {
		List<User> userList = loginRepo.findByUserName(userName);

		if (userList.isEmpty()) {
			throw new AuthenticationException("Invalid username or password");
		}

		User matchedUser = null;

		for (User user : userList) {
			boolean isEncrypted = "true".equalsIgnoreCase(user.getIsPasswordEncrypted());
			try {
				if (isEncrypted) {
					String encryptedInputPassword = EncryptDecrypt.encrypt(password);
					if (user.getPassword().equals(encryptedInputPassword)) {
						matchedUser = user;
						break;
					}
				} else {
					if (user.getPassword().equals(password)) {
						matchedUser = user;
						break;
					}
				}
			} catch (Exception e) {
				throw new AuthenticationException("Encryption error");
			}
		}

		if (matchedUser == null) {
			throw new AuthenticationException("Invalid username or password");
		}

		return matchedUser;
	}
	
	
	public List<String> getAllowedContractIds(User user) {
	    String userId = user.getUserId();
	    String role = user.getUserRoleNameFk();
	    String type = user.getUserTypeFk();

	    
	    if ("IT Admin".equalsIgnoreCase(role)) {
	        // Fetch all contracts
	        return contractRepo.findAllContractIds();
	    }
	    else if ("Contractor".equalsIgnoreCase(role)) {
	        return contractRepo.findContractIdsByContractorId(userId);
	    } else if ("DyHOD".equalsIgnoreCase(type)) {
	        return contractRepo.findContractIdsByDyHodUserId(userId);
	    } else if ("Regular User".equalsIgnoreCase(role)) {
	        return contractExecutiveRepo.findContractIdsByExecutiveUserId(userId);
	    } else {
	        return Collections.emptyList();
	    }
	}

	

	@Override
	public void updateSessionId(String userId, String sessionId) {
		Optional<User> optionalUser = loginRepo.findById(userId);
		if (optionalUser.isPresent()) {
			User user = optionalUser.get();
			user.setSingleLoginSessionId(sessionId);
			loginRepo.save(user);
		}
	}

	@Override
	public boolean isValidUser(String userId) {
		return loginRepo.existsById(userId);
	}

	@Override
	public List<Map<String, String>> getUserNamesOfRegularUsers() {
		 List<Object[]> results = loginRepo.findUserNamesAndDepartmentsByRegularUserRole();
		  System.out.println("Fetched from DB: " + results.size());
		    return results.stream().map(row -> {
		        Map<String, String> userMap = new HashMap<>();
		        userMap.put("username", (String) row[0]);
		        userMap.put("department", (String) row[1]);
		        return userMap;
		    }).collect(Collectors.toList());
		}
 
}
