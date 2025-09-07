package com.metro.rfisystem.backend.repository.rfi;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiListDTO;
import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.dto.RfiReportDTO;
import com.metro.rfisystem.backend.dto.RfiStatusProjection;
import com.metro.rfisystem.backend.model.pmis.User;
import com.metro.rfisystem.backend.model.rfi.RFI;

import java.util.List;
import java.util.Map;

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
			        DATE_FORMAT(r.date_of_submission, '%d-%m-%y') AS dateOfSubmission,
			        ico.inspection_status AS inspectionStatus,
			        r.status AS status,
			        r.action AS action,
			        rid.measurement_type AS measurementType,   -- ✅ Fetch from inspection_details
			        rid.total_qty AS totalQty,                 -- ✅ Fetch from inspection_details
			        ic.site_image AS imgClient,
			        ico.site_image AS imgContractor
			    FROM rfi_data r
			    LEFT JOIN (
			        SELECT rfi_id_fk, site_image
			        FROM rfi_inspection_details
			        WHERE uploaded_by = 'Engg'
			    ) ic ON r.id = ic.rfi_id_fk
			    LEFT JOIN (
			        SELECT rfi_id_fk, inspection_status, site_image
			        FROM rfi_inspection_details
			        WHERE uploaded_by != 'Engg'
			    ) ico ON r.id = ico.rfi_id_fk
			    LEFT JOIN (
			        SELECT rfi_id_fk, measurement_type, total_qty
			        FROM rfi_inspection_details
			    ) rid ON r.id = rid.rfi_id_fk
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
				        DATE_FORMAT(r.date_of_submission, '%d-%m-%y') AS dateOfSubmission,
				        ico.inspection_status AS inspectionStatus,
			      r.status as status,
			      r.action as action,
			        rid.measurement_type AS measurementType,
			    rid.total_qty AS totalQty,
				        ico.site_image as imgContractor,
				        ic.site_image as imgClient
				    FROM rfi_data r
				    left join (select rfi_id_fk,site_image,inspection_status from rfi_inspection_details
				    where uploaded_by != 'Engg') as ico
				    on r.id=ico.rfi_id_fk
				    left join (select rfi_id_fk,site_image from rfi_inspection_details
				    Where uploaded_by = 'Engg') as ic
				    on r.id=ic.rfi_id_fk
				     LEFT JOIN (
			    SELECT rfi_id_fk, measurement_type, total_qty
			    FROM rfi_inspection_details
			) rid ON r.id = rid.rfi_id_fk
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
			        DATE_FORMAT(r.date_of_submission, '%d-%m-%y') AS dateOfSubmission,
			        ico.inspection_status AS inspectionStatus,
			     r.status as status,
			     r.action as action,
			       rid.measurement_type AS measurementType,
			     rid.total_qty AS totalQty,
			        ico.site_image as imgContractor,
			        ic.site_image as imgClient
			    FROM rfi_data r
			    LEFT JOIN (select rfi_id_fk, site_image, inspection_status from rfi_inspection_details
			    where uploaded_by != 'Engg') ico
			    on r.id = ico.rfi_id_fk
			    LEFT JOIN (select rfi_id_fk, site_image from rfi_inspection_details
			    where uploaded_by = 'Engg') ic
			    on r.id = ic.rfi_id_fk

			       LEFT JOIN (
			     SELECT rfi_id_fk, measurement_type, total_qty
			     FROM rfi_inspection_details
			 ) rid ON r.id = rid.rfi_id_fk
			    WHERE r.created_by = :createdBy
			    ORDER BY r.created_at DESC
			""", nativeQuery = true)
	List<RfiListDTO> getRFIsCreatedBy(String createdBy);

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
			        DATE_FORMAT(r.date_of_submission, '%d-%m-%y') AS dateOfSubmission,
			        ico.inspection_status AS  inspectionstatus,
			        r.status as status,
			        r.action as action,
			          rid.measurement_type AS measurementType,
			     rid.total_qty AS totalQty,
			        ico.site_image as imgContractor,
			        ic.site_image as imgClient
			    FROM rfi_data r
			    LEFT JOIN (select rfi_id_fk, site_image, inspection_status from rfi_inspection_details
			    where uploaded_by != 'Engg') ico
			    on r.id = ico.rfi_id_fk
			    LEFT JOIN (select rfi_id_fk, site_image from rfi_inspection_details
			    where uploaded_by = 'Engg') ic
			    on r.id = ic.rfi_id_fk

			       LEFT JOIN (
			     SELECT rfi_id_fk, measurement_type, total_qty
			     FROM rfi_inspection_details
			 ) rid ON r.id = rid.rfi_id_fk
			    WHERE r.assigned_person_client = :assignedPersonClient
			    ORDER BY r.created_at DESC
			""", nativeQuery = true)
	List<RfiListDTO> findByAssignedPersonClient(@Param("assignedPersonClient") String assignedPersonClient);

	@Query(value = "SELECT COUNT(id) FROM rfi_data", nativeQuery = true)
	int countOfAllRfiCreatedSoFar();

	int countByAssignedPersonClient(String assignedTo);

	int countByCreatedBy(String createdBy);


	@Query(value = "SELECT r.id, r.status , i.test_insite_lab as ApprovalStatus FROM rfi_data r \r\n"
			+ "left join rfi_inspection_details i \r\n"
			+ "on r.id = i.rfi_id_fk and uploaded_by = 'Engg'\r\n"
			+ "WHERE r.id = :id", nativeQuery = true)
	Optional<RfiStatusProjection> findStatusById(@Param("id") Long id);

	@Query(value = "select r.rfi_id , r.id,rv.id, rv.action as status, rv.remarks as remarks from rfi_data as r\r\n"
			+ "right join rfi_validation as rv on r.id = rv.rfi_id_fk\r\n"
			+ "ORDER BY rv.sent_for_validation_at DESC", nativeQuery = true)
	public List<GetRfiDTO> showRfiValidationsItAdmin();

	@Query(value = "select r.rfi_id , r.id,rv.id, rv.action as status, rv.remarks as remarks from rfi_data as r\r\n"
			+ "right join rfi_validation as rv on r.id = rv.rfi_id_fk\r\n" + "where dy_hod_user_id =:userId\r\n"
			+ "ORDER BY rv.sent_for_validation_at DESC", nativeQuery = true)
	public List<GetRfiDTO> showRfiValidationsDyHod(String userId);

	@Query(value = "select r.rfi_id , r.id,rv.id, rv.action as status, rv.remarks as remarks from rfi_data as r\r\n"
			+ "right join rfi_validation as rv on r.id = rv.rfi_id_fk\r\n"
			+ "where assigned_person_client =:userName\r\n"
			+ "ORDER BY rv.sent_for_validation_at DESC", nativeQuery = true)
	public List<GetRfiDTO> showRfiValidationsAssignedBy(String userName);

	@Query(value = "\r\n" + "SELECT\r\n" + "  -- RFI base fields\r\n" + "  r.consultant AS consultant,\r\n"
			+ "  r.contract_short_name AS contract,\r\n" + "  r.created_by AS contractor,\r\n"
			+ "  r.contract_id AS contractId,\r\n" + "  r.rfi_id AS rfiId,\r\n" + "  r.status as rfiStatus, \r\n"
			+ "  DATE_FORMAT(ic.inspection_date, '%Y-%m-%d') AS dateOfInspection,\r\n" + "  r.location AS location,\r\n"
			+ "  TIME_FORMAT(r.time_of_inspection, '%H:%i:%s') AS proposedInspectionTime,\r\n"
			+ "  TIME_FORMAT(ic.time_of_inspection, '%H:%i:%s') AS actualInspectionTime,\r\n" + "\r\n"
			+ "  -- Description\r\n" + "  r.rfi_description AS rfiDescription,\r\n"
			+ "  r.enclosures AS enclosures,\r\n" + "  r.name_of_representative AS contractorRepresentative,\r\n"
			+ "  r.assigned_person_client AS clientRepresentative,\r\n"
			+ "  r.description AS descriptionByContractor,\r\n" + "\r\n" + "  -- Checklist for Level Sheet\r\n"
			+ "  cl.drawing_approved AS drawingStatusLS,\r\n" + "  cl.alignment_ok AS alignmentStatusLS,\r\n"
			+ "  cl.drawing_remark_contractor AS drawingRemarksContracotrLS,\r\n"
			+ "  cl.drawing_remarkae AS drawingRemarksClientLS,\r\n"
			+ "  cl.alignment_remark_contractor AS alignmentoCntractorRemarksLS,\r\n"
			+ "  cl.alignment_remarkae AS alignmentClientRemarksLS,\r\n" + "\r\n" + "  -- Checklist for Pour Card\r\n"
			+ "  cp.drawing_approved AS drawingStatusPC,\r\n" + "  cp.alignment_ok AS alignmentStatusPC,\r\n"
			+ "  cp.drawing_remark_contractor AS drawingRemarksContracotrPC,\r\n"
			+ "  cp.drawing_remarkae AS drawingRemarksClientPC,\r\n"
			+ "  cp.alignment_remark_contractor AS alignmentoCntractorRemarksPC,\r\n"
			+ "  cp.alignment_remarkae AS alignmentClientRemarksPC,\r\n" + "\r\n" + "  -- Validation\r\n"
			+ "  v.action AS validationStatus,\r\n" + "  v.remarks AS remarks,\r\n" + "\r\n"
			+ "  -- Enclosure paths by role\r\n"
			+ "  MAX(CASE WHEN re.enclosure_name = 'Level Sheet' THEN re.enclosure_upload_file  ELSE NULL END) AS levelSheetFilePath,\r\n"
			+ "  MAX(CASE WHEN re.enclosure_name = 'Pour Card' THEN re.enclosure_upload_file ELSE NULL END) AS pourCardFilePath,\r\n"
			+ "\r\n" + "  -- Inspection details by role\r\n" + "  ic.selfie_path AS selfieClient,\r\n"
			+ "  ico.selfie_path AS selfieContractor,\r\n" + "  ic.site_image AS imagesUploadedByClient,\r\n"
			+ "  ico.site_image AS imagesUploadedByContractor,\r\n" + "  ic.test_insite_lab AS testStatus,\r\n"
			+ "  ico.test_site_documents AS testSiteDocumentsContractor\r\n" + "\r\n" + "FROM rfi_data r\r\n" + "\r\n"
			+ "-- Role-based inspection joins\r\n" + "LEFT JOIN rfi_inspection_details ic \r\n"
			+ "  ON r.id = ic.rfi_id_fk AND ic.uploaded_by = 'Engg'\r\n" + "LEFT JOIN rfi_inspection_details ico \r\n"
			+ "  ON r.id = ico.rfi_id_fk AND ico.uploaded_by != 'Engg'\r\n" + "\r\n"
			+ "-- Checklist and validation joins\r\n" + "LEFT JOIN rfi_validation v ON v.rfi_id_fk = r.id\r\n"
			+ "LEFT JOIN rfi_checklist_item cl ON cl.rfi_id_fk = r.id AND cl.enclosure_name = 'Level Sheet'\r\n"
			+ "LEFT JOIN rfi_checklist_item cp ON cp.rfi_id_fk = r.id AND cp.enclosure_name = 'Pour Card'\r\n" + "\r\n"
			+ "-- Enclosures split by uploaded_by\r\n"
			+ "LEFT JOIN  rfi_enclosure re ON re.rfi_id_fk = r.id AND re.enclosure_name IN ('Level Sheet', 'Pour Card')\r\n"
			+ "\r\n" + "\r\n" + "WHERE r.id = :id\r\n" + "\r\n" + "GROUP BY r.id;\r\n" + "\r\n"
			+ "", nativeQuery = true)
	List<RfiReportDTO> getRfiReportDetails(@Param("id") long id);

// IT-Admin RFI log query
	@Query(value = "SELECT\r\n" + "    r.id AS id,\r\n" + "    r.rfi_id AS rfiId,\r\n"
			+ "    DATE_FORMAT(r.date_of_submission, '%Y-%m-%d') AS dateOfSubmission,\r\n"
			+ "    r.description AS rfiDescription,\r\n" + "    r.created_by AS rfiRequestedBy,\r\n"
			+ "    r.client_department AS department,\r\n" + "    r.assigned_person_client AS person,\r\n"
			+ "    DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d') AS dateRaised,\r\n"
			+ "    DATE_FORMAT(i.inspection_date, '%Y-%m-%d') AS dateResponded,\r\n" + "    r.status AS status,\r\n"
			+ "    rv.remarks AS notes,\r\n" + "    r.project_name AS project,\r\n"
			+ "    r.work_short_name AS work,\r\n" + "    r.contract_short_name AS contract\r\n" + "FROM \r\n"
			+ "    rfi_data AS r\r\n" + "LEFT JOIN \r\n" + "    rfi_inspection_details AS i ON r.id = i.rfi_id_fk\r\n"
			+ "LEFT JOIN \r\n" + "    rfi_validation AS rv ON rv.rfi_id_fk = r.id\r\n" + "    group by r.id\r\n"
			+ "ORDER BY \r\n" + "    r.created_at DESC;", nativeQuery = true)
	List<RfiLogDTO> listAllRfiLogItAdmin();

//For Contractor query using the field "created_by" in the rfi_table.
	@Query(value = "SELECT\r\n" + "    r.id AS id,\r\n" + "    r.rfi_id AS rfiId,\r\n"
			+ "    DATE_FORMAT(r.date_of_submission, '%Y-%m-%d') AS dateOfSubmission,\r\n"
			+ "    r.description AS rfiDescription,\r\n" + "    r.created_by AS rfiRequestedBy,\r\n"
			+ "    r.client_department AS department,\r\n" + "    r.assigned_person_client AS person,\r\n"
			+ "    DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d') AS dateRaised,\r\n"
			+ "    DATE_FORMAT(i.inspection_date, '%Y-%m-%d') AS dateResponded,\r\n" + "    r.status AS status,\r\n"
			+ "    rv.remarks AS notes,\r\n" + "    r.project_name AS project,\r\n"
			+ "    r.work_short_name AS work,\r\n" + "    r.contract_short_name AS contract\r\n" + "FROM \r\n"
			+ "    rfi_data AS r\r\n" + "LEFT JOIN \r\n" + "    rfi_inspection_details AS i ON r.id = i.rfi_id_fk\r\n"
			+ "LEFT JOIN \r\n" + "    rfi_validation AS rv ON rv.rfi_id_fk = r.id\r\n"
			+ "    where r.created_by = :userName\r\n" + "GROUP BY \r\n" + "    r.id\r\n" + "ORDER BY \r\n"
			+ "    r.created_at DESC;\r\n" + "", nativeQuery = true)
	List<RfiLogDTO> listAllRfiLogByCreatedBy(String userName);

// Query for the Engineer filtering by using the "assigned_person_client" field in the rfi_table...
	@Query(value = "SELECT\r\n" + "    r.id AS id,\r\n" + "    r.rfi_id AS rfiId,\r\n"
			+ "    DATE_FORMAT(r.date_of_submission, '%Y-%m-%d') AS dateOfSubmission,\r\n"
			+ "    r.description AS rfiDescription,\r\n" + "    r.created_by AS rfiRequestedBy,\r\n"
			+ "    r.client_department AS department,\r\n" + "    r.assigned_person_client AS person,\r\n"
			+ "    DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d') AS dateRaised,\r\n"
			+ "    DATE_FORMAT(i.inspection_date, '%Y-%m-%d') AS dateResponded,\r\n" + "    r.status AS status,\r\n"
			+ "    rv.remarks AS notes,\r\n" + "    r.project_name AS project,\r\n"
			+ "    r.work_short_name AS work,\r\n" + "    r.contract_short_name AS contract\r\n" + "FROM \r\n"
			+ "    rfi_data AS r\r\n" + "LEFT JOIN \r\n" + "    rfi_inspection_details AS i ON r.id = i.rfi_id_fk\r\n"
			+ "LEFT JOIN \r\n" + "    rfi_validation AS rv ON rv.rfi_id_fk = r.id\r\n"
			+ "    where r.assigned_person_client = :userName\r\n" + "GROUP BY \r\n" + "    r.id\r\n" + "ORDER BY \r\n"
			+ "    r.created_at DESC;\r\n" + "", nativeQuery = true)
	List<RfiLogDTO> listAllRfiLogByAssignedBy(String userName);

// Query for the DyHod user filtering by using the field "dy_hod_user_id_fk" in the rfi_table..
	@Query(value = "SELECT\r\n" + "    r.id AS id,\r\n" + "    r.rfi_id AS rfiId,\r\n"
			+ "    DATE_FORMAT(r.date_of_submission, '%Y-%m-%d') AS dateOfSubmission,\r\n"
			+ "    r.description AS rfiDescription,\r\n" + "    r.created_by AS rfiRequestedBy,\r\n"
			+ "    r.client_department AS department,\r\n" + "    r.assigned_person_client AS person,\r\n"
			+ "    DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d') AS dateRaised,\r\n"
			+ "    DATE_FORMAT(i.inspection_date, '%Y-%m-%d') AS dateResponded,\r\n" + "    r.status AS status,\r\n"
			+ "    rv.remarks AS notes,\r\n" + "    r.project_name AS project,\r\n"
			+ "    r.work_short_name AS work,\r\n" + "    r.contract_short_name AS contract\r\n" + "FROM \r\n"
			+ "    rfi_data AS r\r\n" + "LEFT JOIN \r\n" + "    rfi_inspection_details AS i ON r.id = i.rfi_id_fk\r\n"
			+ "LEFT JOIN \r\n" + "    rfi_validation AS rv ON rv.rfi_id_fk = r.id\r\n"
			+ "    where r.dy_hod_user_id = :userId\r\n" + "GROUP BY \r\n" + "    r.id\r\n" + "ORDER BY \r\n"
			+ "    r.created_at DESC;\r\n" + "", nativeQuery = true)
	List<RfiLogDTO> listAllRfiLogByDyHod(String userId);

	long countByStatus(EnumRfiStatus status);

	@Query("SELECT COUNT(r) FROM RFI r WHERE r.status IN :statuses")
	long countByStatuses(@Param("statuses") List<EnumRfiStatus> statuses);

	// For Contractor
	long countByStatusAndCreatedBy(EnumRfiStatus status, String createdBy);

	@Query("SELECT COUNT(r) FROM RFI r WHERE r.status IN :statuses AND r.createdBy = :createdBy")
	long countByStatusesAndCreatedBy(@Param("statuses") List<EnumRfiStatus> statuses,
			@Param("createdBy") String createdBy);

	// For Engineer
	long countByStatusAndAssignedPersonClient(EnumRfiStatus status, String assignedTo);

	@Query("SELECT COUNT(r) FROM RFI r WHERE r.status IN :statuses AND r.assignedPersonClient = :assignedTo")
	long countByStatusesAndAssignedPersonClient(@Param("statuses") List<EnumRfiStatus> statuses,
			@Param("assignedTo") String assignedTo);

	@Query(value = "select id from rfi_data " + "where contract_id = :contract "
			+ "and structure_type = :structureType " + "and structure = :structure", nativeQuery = true)
	List<Integer> getRfiIdsByFilter(String contract, String structureType, String structure);

	@Query(value = "SELECT * FROM rfi_data WHERE id IN (:ids)", nativeQuery = true)
	List<RFI> findByIds(@Param("ids") List<Integer> ids);

	@Modifying
	@Query("UPDATE RFI r " + "SET r.assignedPersonClient = :executive, " + "    r.clientDepartment = :department "
			+ "WHERE r.id IN :ids")
	int updateExecutivesForRfis(@Param("ids") List<Integer> ids, @Param("executive") String executive,
			@Param("department") String department);

	@Query(value = """
			SELECT
			    r.id AS id,
			    r.rfi_id AS rfi_Id,
			    r.project_name AS project,
			    r.structure AS structure,
			    r.element AS element,
			    r.activity AS activity,
			    r.created_by as createdBy,
			    r.assigned_person_client AS assignedPersonClient,
			    r.name_of_representative AS nameOfRepresentative,
			    DATE_FORMAT(r.date_of_submission, '%d-%m-%y') AS dateOfSubmission,
			    ico.inspection_status AS inspectionStatus,
			    r.status AS status,
			    r.action AS action,
			      rid.measurement_type AS measurementType,
			     rid.total_qty AS totalQty,
			    ico.site_image AS imgContractor,
			    ic.site_image AS imgClient
			FROM rfi_data r
			LEFT JOIN (
			    SELECT r1.rfi_id_fk, r1.site_image, r1.inspection_status
			    FROM rfi_inspection_details r1
			    WHERE r1.uploaded_by != 'Engg'
			    AND r1.id = (
			        SELECT MAX(r2.id)
			        FROM rfi_inspection_details r2
			        WHERE r2.rfi_id_fk = r1.rfi_id_fk AND r2.uploaded_by != 'Engg'
			    )
			) AS ico ON r.id = ico.rfi_id_fk
			LEFT JOIN (
			    SELECT r3.rfi_id_fk, r3.site_image
			    FROM rfi_inspection_details r3
			    WHERE r3.uploaded_by = 'Engg'
			    AND r3.id = (
			        SELECT MAX(r4.id)
			        FROM rfi_inspection_details r4
			        WHERE r4.rfi_id_fk = r3.rfi_id_fk AND r4.uploaded_by = 'Engg'
			    )
			) AS ic ON r.id = ic.rfi_id_fk
			  LEFT JOIN (
			     SELECT rfi_id_fk, measurement_type, total_qty
			     FROM rfi_inspection_details
			 ) rid ON r.id = rid.rfi_id_fk

			WHERE r.name_of_representative = :representative
			ORDER BY r.created_at DESC
			""", nativeQuery = true)
	List<RfiListDTO> findByRepresentative(@Param("representative") String representative);
	
	@Query(value = """
		    SELECT DISTINCT u.user_name
		    FROM [user] u
		    INNER JOIN [user] mgr ON u.reporting_to_id_srfk = mgr.user_id
		    WHERE mgr.user_role_name_fk = 'Contractor'
		""", nativeQuery = true)
		List<String> findRepresentativesReportingToContractor();

	Optional<RFI> findFirstByContractIdAndStructureAndStructureType(String contractId, String structure,
			String structureType);



}