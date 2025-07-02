package com.metro.rfisystem.backend.controller;
 
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
 
import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.service.RfiLogService;
 
import lombok.RequiredArgsConstructor;
 
@RestController
@RequiredArgsConstructor
public class RfiLogController {
	
	private final RfiLogService logService;
	
	@GetMapping("/getRfiLogDetailsFilter")
	public ResponseEntity<List<RfiLogDTO>> showRfiDetailsByFilter(@RequestParam(name = "project", required = false) String project,
			@RequestParam(name = "work", required = false) String wrok,
			@RequestParam(name = "contract", required = false) String contract)
	{
		List<RfiLogDTO> list = logService.listRfiDetailsByFilter(project, wrok, contract);
		if(list.isEmpty())
		{
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(list);
	}
	
	@GetMapping("/getAllRfiLogDetails")
	public ResponseEntity<List<RfiLogDTO>> getAllRfiLogDetails()
	{
		List<RfiLogDTO> list = logService.listAllRfiLog();
		
		if(list.isEmpty())
		{
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(list);
	}
 
}
 