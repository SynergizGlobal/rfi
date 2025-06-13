package com.metro.rfisystem.backend.dto;

import java.util.List;

import org.hibernate.boot.registry.classloading.spi.ClassLoaderService.Work;
import org.springframework.web.multipart.MultipartFile;


import lombok.Data;


@Data
public class Project {
	private String project_id,project_name,plan_head_number,pink_book_item_number,remarks,project_description,project_status,attachment
	,sanctioned_estimated_cost,sanctioned_year_fk,sanctioned_completion_cost,year_of_completion,projected_completion_year,latest_revised_cost,
	completion_cost,work_short_name,benefits,galleryFileNames,financial_year_fk,pb_item_no,project_pinkbook_id,user_id,created_by_user_id_fk,designation,user_name;
	
	private String id,file_name,project_id_fk,created_date,created_by,railway,project_file_type_fk,project_file_type,project_file_id,financial_progress,physical_progress;
	
	
	private MultipartFile[] projectGalleryFiles,projectFiles;
	private List<Project> projectFilesList,projectGalleryFilesList,projectPinkBooks,projectGallery,projectDocs;
	private String[] projectFileNames,attachemnts,project_file_types,project_file_ids,projectGalleryFileNames,created_dates;
	private String[] financial_years,pink_book_item_numbers,railways;
	
	private List<Work> worksInfo,workDocs;

}