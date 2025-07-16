package com.metro.rfisystem.backend.service;

import java.util.List;
import java.util.Map;

import com.metro.rfisystem.backend.model.pmis.User;

public interface LoginService {

	User authenticate(String username, String password) throws Exception;

	void updateSessionId(String userId, String sessionId);

	boolean isValidUser(String userName);
	
	List<Map<String, String>> getUserNamesOfRegularUsers();

	List<String> getAllowedContractIds(User user);
}
