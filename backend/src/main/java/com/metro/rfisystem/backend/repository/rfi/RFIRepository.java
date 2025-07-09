package com.metro.rfisystem.backend.repository.rfi;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiListDTO;
import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.dto.RfiReportDTO;
import com.metro.rfisystem.backend.dto.RfiStatusProjection;
import com.metro.rfisystem.backend.model.rfi.RFI;
import java.util.List;




@Repository
public interface RFIRepository extends JpaRepository<RFI, Long> {	

	@Query(value = """
		    SELECT
		        r.id AS id,
		        r.rfi_id AS rfi_Id,
		        r.project_name AS project,
		        r.structure AS structure,
		        r.element AS element,
		        r.activity AS activity,
		        r.created_by AS createdBy,
		        r.assigned_person_client AS assignedPersonClient,
		        DATE_FORMAT(r.date_of_submission, '%Y-%m-%d') AS dateOfSubmission,
		        i.inspection_status AS inspectionStatus
		    FROM rfi_data r
            left join rfi_inspection_details as i
            on r.id=i.rfi_id_fk
		    ORDER BY r.created_at DESC
		""", nativeQuery = true)
		List<RfiListDTO> findAllRfiList();
 
 
	@Query(value = "SELECT * FROM rfi_data WHERE id = :id", nativeQuery = true)
	 Optional<RFI> findById(Long id);
	
    @Query("SELECT r FROM RFI r WHERE r.rfi_Id = :rfiId")
    Optional<RFI> findByRfiId(@Param("rfiId") String rfiId);
    
    @Query(value = """
    	    SELECT
    	        r.rfi_id AS rfiId,
    	        r.project_name AS project,
    	        r.structure AS structure,
    	        r.element AS element,
    	        r.activity AS activity,
    	        r.assigned_person_client AS assignedPersonClient,
    	        DATE_FORMAT(r.date_of_submission, '%Y-%m-%d') AS submissionDate,
    	        i.status AS status
    	    FROM rfi_data r
    	    left join rfi_inspection_details as i
    	    on r.id=i.rfi_id_fk
    	    WHERE r.created_by = :createdBy
    	    ORDER BY r.created_at DESC
    	""", nativeQuery = true)
    	List<RfiListDTO> findByCreatedBy(@Param("createdBy") String createdBy);
 
    @Query(value = """
    	    SELECT
    		    r.id as id,
    	        r.rfi_id AS rfi_Id,
    	        r.project_name AS project,
    	        r.structure AS structure,
    	        r.element AS element,
    	        r.activity AS activity,
    	        r.created_by as createdBy,
    	        r.assigned_person_client AS assignedPersonClient,
    	        DATE_FORMAT(r.date_of_submission, '%Y-%m-%d') AS submissionDate,
    	        i.inspection_status AS inspectionStatus
    	    FROM rfi_data r
    	    LEFT JOIN rfi_inspection_details as i
    	    on r.id=i.rfi_id_fk
    	    WHERE r.assigned_person_client = :assignedPersonClient
    	    ORDER BY r.created_at DESC
    	""", nativeQuery = true)
    	List<RfiListDTO> findByAssignedPersonClient(@Param("assignedPersonClient") String assignedPersonClient);
	 
	int countByAssignedPersonClient(String assignedTo) ;
	
	@Query(value = "SELECT id, status FROM rfi_data WHERE id = :id", nativeQuery = true)
	Optional<RfiStatusProjection> findStatusById(@Param("id") Long id);

	@Query(value = "select r.rfi_id , r.id,rv.id, rv.action as status, rv.remarks as remarks from rfi_data as r\r\n"
			+ "right join rfi_validation as rv on r.id = rv.rfi_id_fk\r\n"
			+ "ORDER BY rv.sent_for_validation_at DESC", nativeQuery = true)
	public List<GetRfiDTO> showRfiValidations();

	
	
	
	@Query(value = "SELECT\r\n"
			+ "  -- RFI base fields\r\n"
			+ "  r.consultant AS consultant,\r\n"
			+ "  r.contract_short_name AS contract,\r\n"
			+ "  r.created_by AS contractor,\r\n"
			+ "  r.contract_id AS contractId,\r\n"
			+ "  r.rfi_id AS rfiId,\r\n"
			+ "  DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d') AS dateOfInspection,\r\n"
			+ "  r.location AS location,\r\n"
			+ "  TIME_FORMAT(r.time_of_inspection, '%H:%i:%s') AS proposedInspectionTime,\r\n"
			+ "  TIME_FORMAT(ic.time_of_inspection, '%H:%i:%s') AS actualInspectionTime,\r\n"
			+ "\r\n"
			+ "  -- Description\r\n"
			+ "  r.rfi_description AS rfiDescription,\r\n"
			+ "  r.enclosures AS enclosures,\r\n"
			+ "  r.name_of_representative AS contractorRepresentative,\r\n"
			+ "  r.assigned_person_client AS clientRepresentative,\r\n"
			+ "  r.description AS descriptionByContractor,\r\n"
			+ "\r\n"
			+ "  -- Checklist\r\n"
			+ "  c.drawing_approved AS drawingStatus,\r\n"
			+ "  c.alignment_ok AS alignmentStatus,\r\n"
			+ "  c.drawing_remark_contractor AS drawingRemarksContracotr,\r\n"
			+ "  c.drawing_remarkae AS drawingRemarksClient,\r\n"
			+ "  c.alignment_remark_contractor AS alignmentoCntractorRemarks,\r\n"
			+ "  c.alignment_remarkae AS alignmentClientRemarks,\r\n"
			+ "\r\n"
			+ "  -- Validation\r\n"
			+ "  v.action AS status,\r\n"
			+ "  v.remarks AS remarks,\r\n"
			+ "\r\n"
			+ "  -- Enclosure paths by role\r\n"
			+ "  enc_contractor.enclosureFilePaths AS contractorEnclosureFilePaths,\r\n"
			+ "  enc_client.enclosureFilePaths AS clientEnclosureFilePaths,\r\n"
			+ "\r\n"
			+ "  -- Inspection details by role\r\n"
			+ "  ic.selfie_path AS selfieClient,\r\n"
			+ "  ico.selfie_path AS selfieContractor,\r\n"
			+ "\r\n"
			+ "  ic.site_image AS imagesUploadedByClient,\r\n"
			+ "  ico.site_image AS imagesUploadedByContractor,\r\n"
			+ "\r\n"
			+ "  ico.test_insite_lab AS testInsiteLabContractor,\r\n"
			+ "\r\n"
			+ "  ico.test_site_documents AS testSiteDocumentsContractor,\r\n"
			+ "\r\n"
			+ "  -- Signatures\r\n"
			+ "  c.contractor_signature AS contractorSignature,\r\n"
			+ "  c.gc_mrvc_representative_signature AS gcMrvcSignature\r\n"
			+ "\r\n"
			+ "FROM rfi_data r\r\n"
			+ "\r\n"
			+ "-- Role-based inspection joins\r\n"
			+ "LEFT JOIN rfi_inspection_details ic \r\n"
			+ "  ON r.id = ic.rfi_id_fk AND ic.uploaded_by = 'Regular User'\r\n"
			+ "LEFT JOIN rfi_inspection_details ico \r\n"
			+ "  ON r.id = ico.rfi_id_fk AND ico.uploaded_by = 'Contractor'\r\n"
			+ "\r\n"
			+ "-- Checklist and validation joins\r\n"
			+ "JOIN rfi_validation v ON v.rfi_id_fk = r.id\r\n"
			+ "JOIN rfi_checklist_item c ON c.rfi_id_fk = r.id\r\n"
			+ "\r\n"
			+ "-- Enclosures split by uploaded_by\r\n"
			+ "LEFT JOIN (\r\n"
			+ "    SELECT \r\n"
			+ "      rfi_id_fk,\r\n"
			+ "      GROUP_CONCAT(enclosure_upload_file SEPARATOR ', ') AS enclosureFilePaths\r\n"
			+ "    FROM rfi_enclosure\r\n"
			+ "    WHERE uploaded_by = 'Contractor'\r\n"
			+ "    GROUP BY rfi_id_fk\r\n"
			+ ") enc_contractor ON enc_contractor.rfi_id_fk = r.id\r\n"
			+ "\r\n"
			+ "LEFT JOIN (\r\n"
			+ "    SELECT \r\n"
			+ "      rfi_id_fk,\r\n"
			+ "      GROUP_CONCAT(enclosure_upload_file SEPARATOR ', ') AS enclosureFilePaths\r\n"
			+ "    FROM rfi_enclosure\r\n"
			+ "    WHERE uploaded_by = 'Regular User'\r\n"
			+ "    GROUP BY rfi_id_fk\r\n"
			+ ") enc_client ON enc_client.rfi_id_fk = r.id\r\n"
			+ "\r\n"
			+ "WHERE r.id =:id\r\n"
			+ "\r\n"
			+ "GROUP BY r.id;\r\n"
			+ "", nativeQuery = true)
	List<RfiReportDTO> getRfiReportDetails(@Param("id") long id);
	
	@Query(value="select r.id as id, r.rfi_id as rfiId, DATE_FORMAT(r.date_of_submission, '%Y-%m-%d') as dateOfSubmission,r.description as rfiDescription,\r\n"
			+ "r.created_by as rfiRequestedBy,r.client_department as department,r.assigned_person_client as person,DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d') as dateRaised,\r\n"
			+ "DATE_FORMAT(i.inspection_date, '%Y-%m-%d') as dateResponded,r.status as status,rv.remarks as notes\r\n"
			+ "from rfi_data as r\r\n"
			+ "left join rfi_inspection_details as i \r\n"
			+ "on r.id = i.rfi_id_fk\r\n"
			+ "left join rfi_validation as rv\r\n"
			+ "on rv.rfi_id_fk = r.id\r\n"
			+ "where r.project_name=:project\r\n"
			+ "and r.work_short_name =:work\r\n"
			+ "and r.contract_short_name=:contract\r\n"
			+ "order by created_at desc\r\n"
			+ "",nativeQuery=true)
	List<RfiLogDTO> listRfiLogByFilter(String project,String work,String contract);
	
	@Query(value="SELECT \r\n"
			+ "    r.id AS id,\r\n"
			+ "    r.rfi_id AS rfiId,\r\n"
			+ "    DATE_FORMAT(r.date_of_submission, '%Y-%m-%d') AS dateOfSubmission,\r\n"
			+ "    r.description AS rfiDescription,\r\n"
			+ "    r.created_by AS rfiRequestedBy,\r\n"
			+ "    r.client_department AS department,\r\n"
			+ "    r.assigned_person_client AS person,\r\n"
			+ "    DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d') AS dateRaised,\r\n"
			+ "    DATE_FORMAT(i.inspection_date, '%Y-%m-%d') AS dateResponded,\r\n"
			+ "    r.status AS status,\r\n"
			+ "    rv.remarks AS notes\r\n"
			+ "FROM \r\n"
			+ "    rfi_data AS r\r\n"
			+ "LEFT JOIN \r\n"
			+ "    rfi_inspection_details AS i \r\n"
			+ "    ON r.id = i.rfi_id_fk\r\n"
			+ "LEFT JOIN \r\n"
			+ "    rfi_validation AS rv \r\n"
			+ "    ON rv.rfi_id_fk = r.id\r\n"
			+ "ORDER BY \r\n"
			+ "    r.created_at DESC;\r\n"
			+ "",nativeQuery=true)
	List<RfiLogDTO> listAllRfiLog();


	long countByStatus(EnumRfiStatus status);



}
 