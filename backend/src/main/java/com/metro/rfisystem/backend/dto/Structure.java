package com.metro.rfisystem.backend.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class Structure {
	private String structure_id,work_id_fk,work_id,contract_id_fk,department_fk,structure_type_fk,structure,structure_count,
		work_name,work_short_name,user_type_fk,user_id,user_role_code,contract_name,contract_short_name,department_name,project_id_fk,project_name,structure_type,
		id, uploaded_file, status, remarks, uploaded_by_user_id_fk, uploaded_on,contract_id,responsible_people_id_fk,user_name,designation,work_status_fk, unit, value,structure_file_type
		,structure_id_fk, structure_detail,name,attachment,structure_file_type_fk,created_date,structure_value,target_date,estimated_cost,estimated_cost_units,construction_start_date
		,revised_completion,structure_name,structure_details_type,fob_details_type,fob_details_location,valueDate,structure_details_location,latitude,longitude,commissioning_date,actual_completion_date,completion_cost,completion_cost_units,structure_file_id,created_by_user_id_fk;
	private int [] subRowsLengths;
	  
	private MultipartFile structureFile;
	private MultipartFile[] structureFiles;
	
	private String [] structure_type_fks,structure_ids,structures,responsible_people_id_fks,contracts_id_fk,ids,structure_values,structure_file_type_fks,names,structureFiless
		,structure_details,work_status_fks,target_dates,estimated_costs,estimated_cost_unitss,construction_start_dates,revised_completions,remarkss,contracts
		,structure_file_types,structureDocumentNames,structureFileNames,structure_file_ids,structure_detailss,structure_names,latitudes,longitudes;
	
	private List<Structure> structureList;
	private List<Structure> structureListInactive;
	private List<Structure> structureSubList;
	private List<Structure> structureSubListInactive;
	private List<Structure> structureSubList2;
	private List<Structure> executivesList;
	private List<Structure> documentsList;
	private List<Structure> structureDetailsList;
	private List<Structure> structureDetailsList1;
	private List<Structure> contractsLists;
	private List<Structure> responsiblePeopleLists; }