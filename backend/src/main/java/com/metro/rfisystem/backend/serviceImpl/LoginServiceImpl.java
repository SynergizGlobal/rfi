package com.metro.rfisystem.backend.serviceImpl;

import com.metro.rfisystem.backend.config.EncryptDecrypt;
import com.metro.rfisystem.backend.dto.AllowedContractDTO;
import com.metro.rfisystem.backend.dto.ContractDesignationEngineersDTO;
import com.metro.rfisystem.backend.dto.ContractDropdownDTO;
import com.metro.rfisystem.backend.exception.AuthenticationException;
import com.metro.rfisystem.backend.model.pmis.User;
import com.metro.rfisystem.backend.repository.pmis.ContractExecutiveRepository;
import com.metro.rfisystem.backend.repository.pmis.ContractRepository;
import com.metro.rfisystem.backend.repository.pmis.ContractorRepository;
import com.metro.rfisystem.backend.repository.pmis.LoginRepository;
import com.metro.rfisystem.backend.service.LoginService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LoginServiceImpl implements LoginService {
	
	private static final Logger logger = LoggerFactory.getLogger(LoginServiceImpl.class);


	@Autowired
	private LoginRepository loginRepo;

	@Autowired
	private ContractRepository contractRepo;

	@Autowired
	private ContractExecutiveRepository contractExecutiveRepo;

	@Autowired
	private ContractorRepository contractorRepo;

	@Override
	public User authenticate(String userId, String password) throws AuthenticationException {
	    List<User> userList = loginRepo.findByUserId(userId);

	    if (userList.isEmpty()) {
	        throw new AuthenticationException("Invalid userId or password");
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
	        throw new AuthenticationException("Invalid userId or password");
	    }

	    return matchedUser;
	}


	
	@Override
	public String resolveLoginDepartment(User user) {
	    String userDepartment = user.getDepartmentFk();
	    String userRole = user.getUserRoleNameFk();
	    
	    
	    logger.info("Resolving loginDepartment for user: {}, Role: {}, Dept: {}",
                user.getUserName(), userRole, userDepartment);

	    if ("IT Admin".equalsIgnoreCase(userRole)) {
	        return "IT Admin";
	    } else if ("Engg".equalsIgnoreCase(userDepartment)) {
	        return "Engg";
	    }
	    else {
	        return userRole;
	    }
	}

	
@Override
	public List<AllowedContractDTO> getAllowedContractsWithDesignation(User user) {
		String userId = user.getUserId();
		String role = user.getUserRoleNameFk();
		String type = user.getUserTypeFk();
	    String userDesignation = user.getDesignation();
	    

		
	    List<AllowedContractDTO> result = new ArrayList<>();


		if ("IT Admin".equalsIgnoreCase(role)) {
			// Fetch all contracts
			return contractRepo.findAllContractIds();
	    } else if ("Contractor".equalsIgnoreCase(role)) {
	        String contractorId = contractorRepo.findContractorIdByContractorName(user.getUserName());
	        List<Map<String, Object>> rows = contractRepo.findContractsAndDyhodDesignationsByContractor(contractorId);

	        for (Map<String, Object> row : rows) {
	            String contractId = (String) row.get("contractId");
	            String designation = (String) row.get("designation");
	            result.add(new AllowedContractDTO(contractId, designation));
	        }

		} else if ("DyHOD".equalsIgnoreCase(type)) {
	        // Fetch contracts where this designation is assigned
	        List<Map<String, Object>> contracts = contractRepo.findContractsByDyhodDesignation(userDesignation);
	        for (Map<String, Object> row : contracts) {
	            String contractId = (String) row.get("contractId");
	          result.add(new AllowedContractDTO(contractId, userDesignation));
	        }

	        } else if ("Regular User".equalsIgnoreCase(role)) {
	            List<String> contractIds = contractExecutiveRepo.findContractIdsByExecutiveUserId(userId);
	            for (String contractId : contractIds) {
	                result.add(new AllowedContractDTO(contractId, null));
	            } 
	        }else {
			return Collections.emptyList();
		}
		return result;
	}
	



@Override
public List<ContractDesignationEngineersDTO> getDesignationWithEngineers(User user) {
    List<AllowedContractDTO> allowedContracts = getAllowedContractsWithDesignation(user);
    List<ContractDesignationEngineersDTO> responseList = new ArrayList<>();

    for (AllowedContractDTO contract : allowedContracts) {
        String designation = contract.getDesignation();
        String contractId = contract.getContractId();

        if (designation != null && contractId != null) {
            List<String> engineers = contractExecutiveRepo.findEngineeringUsernamesByContractId(contractId);
            responseList.add(new ContractDesignationEngineersDTO(designation, contractId, engineers));
        }
    }
    return responseList;
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
