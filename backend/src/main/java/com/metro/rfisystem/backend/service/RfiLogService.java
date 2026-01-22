package com.metro.rfisystem.backend.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.List;

import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.dto.RfiLogFetchDTO;
import com.metro.rfisystem.backend.dto.RfiLogFilterDTO;
import com.metro.rfisystem.backend.dto.RfiLogWrappedDTO;

public interface RfiLogService {
	
	
	public List<RfiLogDTO> listAllRfiLog(RfiLogFetchDTO obj);

	public  RfiLogWrappedDTO getRfiDetails(Long rfiId);

	public File getSignedPdfByTxnId(String txnId) throws FileNotFoundException;
	
	public RfiLogFilterDTO listAllFilterRfiLog();
;


}
