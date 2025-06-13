package com.metro.rfisystem.backend.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;


import lombok.Data;

@Data
public class Contract {
	private String contract_id,contract_id_fk,Contract_ID,work_id_fk,contract_name,contract_short_name,contract_type_fk,project_name,strip_chart_type_fk,scope_of_contract,contractor_id_fk,department_fk,department_name,contract_id_code,
	hod_user_id_fk,dy_hod_user_id_fk,designation,user_name,tally_head,estimated_cost,awarded_cost,loa_letter_number,loa_date,ca_no,ca_date,date_of_start,doc,completion_certificate_release,
	final_takeover,final_bill_release,defect_liability_period,retention_money_release,pbg_release,contract_closure,contract_status_fk,bg_required,insurance_required,
	actual_completion_date,completed_cost,contract_closure_date,weight,remarks,work_name,contractor_name,insurance_type,project_id_fk,
	bg_type_fk,issuing_bank,bank_address,bg_number,bg_value,bg_valid_upto, insurance_type_fk, issuing_agency, agency_address, insurance_number, insurance_value,insurence_remark,insurence_valid_upto
	,contract_milestones_id,milestone_name, milestone_date, actual_date, revision,mile_remark,milestone_id,status,released_fk,
	contract_revision_id, revision_number, revision_date, revised_amount, revised_doc,revision_remark,work_short_name,bank_status,insurance_status,revision_status
	,code, bg_date, release_date,project_id,work_id,hod_designation,dy_hod_designation,insurance_valid_upto,date,cumulative_expenditure,insurance_valid_till,pbg_valid_till,
	payment_made,actual_physical_progress,actual_financial_progress,hod_user_id,dy_hod_user_id,user_type_fk,user_id,reporting_to_id_srfk,user_role_code,contract_file_type_fk,contract_file_type,contract_file_id,
	responsible_people_id_fk,hod_name,contract_status,dy_hod_name,PhysicalProgress,revision_amounts_status, unit, value,ContractAlertRemarks,revised_amount_units,bg_value_units,completed_cost_units,insurance_value_units,
	awarded_cost_units,estimated_cost_units,hod_department,message_id,update_type,tab_name,is_contract_closure_initiated,contract_details_types,created_by_user_id_fk,milestone_requried,revision_requried,contractors_key_requried,
	actual_date_of_commissioning,existing_contract_closure_date,todate,estimated_cost_unit,awarded_cost_unit,completed_cost_unit,alerts_user_id,planned_date_of_award,modified_by,modified_date,physical_progress,planned_date_of_completion;
	
	private String contract_value_gst,gst_rate,composite_contract,price_variation,base_month,retention_amount,rate_of_deduction_retention,retention_validity,
	mobilisation_advance,rate_of_deduction_advance,applicable_till;
	
	private String contract_ifas_code,doc_letter_status,tender_opening_date,technical_eval_submission,financial_eval_submission,contract_department,insurance_count,letter_status,bg_letter_status,contract_documents_id,name,attachment,contract_key_personnel_id,mobile_no,email_id,id, department_id_fk, executive_user_id_fk,bank_funded,type_of_review,searchStr;

	private String[] bg_type_fks,issuing_banks,revision_amounts_statuss,bank_addresss,bg_numbers,bg_values,bg_valid_uptos,remarkss,bank_revisions,bankStatus,insuranceStatus,codes, bg_dates, release_dates,released_fks,
	 insurance_type_fks, issuing_agencys, agency_addresss, insurance_numbers, insurance_values,insurence_valid_uptos,insurence_remarks,insurance_revisions,revision_statuss,
	 contract_milestones_ids, milestone_names, milestone_dates, actual_dates, revisions,mile_remarks,
	 contract_revision_ids, revision_numbers, revision_dates, revised_amounts,hod_designations, revised_docs,revision_remarks,contract_file_type_fks,contract_file_ids,contract_file_types,
	 approval_by_bank,
	 
	 revisionno,revision_estimated_cost,revision_planned_date_of_award,revision_planned_date_of_completion,notice_inviting_tender,approvalbybankstatus,
	 tender_bid_opening_date,technical_eval_approval,financial_eval_approval,tender_bid_remarks

	 
	 ;
	
	private String contractor_id, contractor_specilization_fk, address,
	primary_contact_name, phone_number, pan_number, gst_number, bank_name, account_number, ifsc_code,target_doc,structure_type_per,total,last_financial_progress,
	original_completion_date,revised_date_of_completion,percent_progress,revised_cost,expenditure,bG_valid_Upto,insurance_valid_Upto,bg_valid_Upto,
	revisionnumber,revisionestimatedcost,revisionplanneddateofaward,revisionplanneddateofcompletion,noticeinvitingtender,approvalbybank,contract_notice_inviting_tender,
	
	bg_insurance,bg_insurance_type,bg_insurance_number,amount_inr,raised_date,expiry_date,tenderbidopeningdate,technicalevalapproval,financialevalapproval,tenderbidremarks;
	
	private MultipartFile contractFile;
	
	private String[] contractDocumentNames,contractDocumentFileNames,milestone_ids,contractKeyPersonnelNames,contractKeyPersonnelMobileNos,contractKeyPersonnelEmailIds,contractKeyPersonnelDesignations
	,ids, contract_id_fks, department_id_fks, executive_user_id_fks,department_fks,responsible_people_id_fks,revised_amount_unitss,bg_value_unitss,insurance_value_unitss,approvalByBankDocumentFileNames;
	private int[] filecounts;
	private MultipartFile[] contractDocumentFiles,approvalByBankDocumentFiles;
	
	private List<Contract> bankGauranree;
	private List<Contract> insurence;
	private List<Contract> milestones;
	private List<Contract> contract_revisions;
	private List<Contract> contract_revision;
	private List<Contract> contractDocuments;
	private List<Contract> contractKeyPersonnels;
	private List<Contract> responsiblePeopleList;
	private List<Contract> departmentList;
	private List<Contract> executivesList;
	private List<Contract> responsiblePersonsList;
	private List<Contract> report1List;
	
	private List<Contract> contractGstDetails;
	
	
	
	private List<Contract> worksList;
}
