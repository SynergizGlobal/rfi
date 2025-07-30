package com.metro.rfisystem.backend.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.service.RfiLogService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class RfiLogController {

	private final RfiLogService logService;


	@GetMapping("/getAllRfiLogDetails")
	public ResponseEntity<List<RfiLogDTO>> getAllRfiLogDetails(HttpSession session) {

		String UserName = (String) session.getAttribute("userName");
		String UserRole = (String) session.getAttribute("userRoleNameFk");
		String UserId = (String) session.getAttribute("userId");
		String UserType = (String) session.getAttribute("userTypeFk");
		String departmentFK = (String) session.getAttribute("departmentFk");


		List<RfiLogDTO> list = logService.listAllRfiLog(UserRole, UserName, UserId,UserType,departmentFK);

		if (list.isEmpty()) {
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(list);
	}

}
