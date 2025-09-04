package com.metro.rfisystem.backend.service;




import com.metro.rfisystem.backend.dto.RFIInspectionChecklistDTO;


public interface RFIInspectionChecklistService{


	//	public void saveChecklistWithFiles(InspectionRequest requests, String deptFk) throws Exception;
    
	    public RFIInspectionChecklistDTO getChecklist(Long rfiId, String enclosureName);
	    
	  //  public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto,String deptFk) ;

		public void saveChecklistWithFiles(RFIInspectionChecklistDTO dto,String deptFk);
}
