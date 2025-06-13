package com.metro.rfisystem.backend.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;


import lombok.Data;

@Data
public class Work {
	private String work_id,work_name,work_short_name,project_id_fk,sanctioned_year,sanctioned_year_fk,sanctioned_estimated_cost,completeion_period_months,
	sanctioned_completion_cost,anticipated_cost,year_of_completion,completion_cost,remarks,project_name,railway_name,work_code,
	railway_id_fk,executed_by_id_fk,financial_year_id,financial_year,financial_year_fk,latest_revised_cost,
	year_of_revision,revision_number,wys_renarks,attachment,work_attachment,railway,executed_by,projected_completion,created_date,
	projected_completion_year,railwayAgency,executedBy,work_id_fk,dashboard_name,parent_dashboard_id_sr_fk,dashboard_id,subLink,id,
	work_yearly_sanction_id,  pink_book_item_number,projected_completion_date,work_file_id,work_file_type,work_file_type_fk,work_status_fk,existing_work_status_fk,
	sanctioned_estimated_cost_unit,sanctioned_completion_cost_unit,anticipated_cost_unit,completion_cost_unit,latest_revised_cost_unit,unit,value,
	estimated_cost_unit,sanctioned_cost_unit,anticipated_unit,completion_unti,revision_unit,user_name,designation,user_id,work_type_fk,
	budget_grant_current_fy,expenditure_end_of_fy,expenditure_current_fy,cumulative_total_expenditure,financial_progress,physical_progress,
	target_completion_date,uploaded_by_user_id_fk,chainages,latitude,longitude,Created_by_user_id_fk,Uploaded_file,Work_data_id,uploaded_on,srno;


	private MultipartFile WorkChainagesFile;
	
	private String[] financial_years,latest_revised_costs,latest_revised_costs_units,
	year_of_revisions,revision_numbers,remarkss,workFileNames,work_file_ids,work_file_types,latest_revised_cost_units;

	private List<Work> workRevisions;
	//private MultipartFile workFile;

	private List<Work> railwayAgencyList;
	private List<Work> executedByList,workDocs;

	private List<MultipartFile> workFile;
	
	private List<Work> workFilesList;
	private List<Work> workChainageFilesList;
	
	private MultipartFile[] workFiles;
	
	//private List<WorkFeatures> workDetails;
	//private List<WorkFeatures> workSalientFeatures;
	
	private List<Work> workDetailsList;
	private List<Work> workSalientFeaturesList;
	
	private String category_fk,description,soft_delete_status_fk,category,title_fk,dashboard_url,title,status;
	
	private String[] title_fks,dashboard_urls,statuses,category_fks,descriptions,salient_features_statuses;
	
}