package com.metro.rfisystem.backend.service;




import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;

 public interface RFIInspectionChecklistService{


		public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto, String deptFk) throws Exception;
    
	    public RFIInspectionChecklistDTO getChecklist(Long rfiId, String enclosureName);


}
