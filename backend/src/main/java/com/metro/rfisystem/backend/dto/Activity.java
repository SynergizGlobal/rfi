package com.metro.rfisystem.backend.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class Activity {
	private String activity_id,contract_id_fk,structure_type_fk,section,line,structure,component,component_id,order,activity_name,planned_start,
	planned_finish,actual_start,actual_finish,unit,scope,completed,weightage,component_details,remarks,
	contract_id,contract_name,contract_short_name,struture_type,work_id,work_name,work_short_name,structure_type,
	created_date,created_by_user_id_fk,modified_date,modified_by_user_id_fk,activity_id_fk,
	progress_id,progress_date,completed_scope,attachment_url,work_id_fk,fob_id,user_id,user_name,dyhod_user_id_fk,department_fk,updated_by_user_id_fk,
	approved_on,rejected_on,approval_status_fk,department_name,user_role_code,updated_on,updated_by,cumulative_completed,actual_for_the_day,
	total_scope,remaining_scope,approved_or_rejected_by,message_id,updated_scope,designation,from_structure_id,to_structure_id,order_x,order_y;
	
	private String activities_data_id,uploaded_file,status,uploaded_by_user_id_fk,uploaded_on,p6_task_code,project_id_fk,user_type_fk,component_per_prior,structure_per_prior,
	component_per_post,structure_per_post;
	
	
	private boolean message_flag;
	private String message;
	
	private MultipartFile uploadFile;
}
