package com.metro.rfisystem.backend.repository.rfi;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.metro.rfisystem.backend.constants.EnumRfiStatus;
import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiDetailsLogDTO;
import com.metro.rfisystem.backend.dto.RfiListDTO;
import com.metro.rfisystem.backend.dto.RfiLogDTO;
import com.metro.rfisystem.backend.dto.RfiReportDTO;
import com.metro.rfisystem.backend.dto.RfiStatusProjection;
import com.metro.rfisystem.backend.model.rfi.RFI;
import jakarta.transaction.Transactional;

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
                r.description AS rfiDescription,
			    r.name_of_representative AS nameOfRepresentative,
			    r.assigned_person_client AS assignedPersonClient,
			    r.contract_id as contractId,
			    DATE_FORMAT(r.date_of_submission, '%d-%m-%Y') AS dateOfSubmission,
			    DATE_FORMAT(r.date_of_inspection, '%d-%m-%Y') AS dateOfInspection,
			    DATE_FORMAT(r.time_of_inspection, '%H:%i') AS timeOfInspection,
			    ico.inspection_status AS inspectionStatus,
			    r.status AS status,
			    ic.test_insite_lab as approvalStatus,
			    r.action AS action,
			    m.measurement_type AS measurementType,
			    m.total_qty AS totalQty,
			    ic.site_image AS imgClient,
			    ico.site_image AS imgContractor,
			    ico.post_test_report_path As testResCon,
			    ic.post_test_report_path As testResEngg

			FROM rfi_data r
			LEFT JOIN (
			    SELECT rfi_id_fk, site_image, test_insite_lab,post_test_report_path
			    FROM rfi_inspection_details
			    WHERE uploaded_by = 'Engg'
			) ic ON r.id = ic.rfi_id_fk
			LEFT JOIN (
			    SELECT rfi_id_fk, inspection_status, site_image,post_test_report_path
			    FROM rfi_inspection_details
			    WHERE uploaded_by != 'Engg'
			) ico ON r.id = ico.rfi_id_fk
			LEFT JOIN measurements m ON r.id = m.rfi_id_fk
			   WHERE r.is_deleted = 0 OR r.is_deleted IS NULL
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
				    r.description AS rfiDescription,
				    r.assigned_person_client AS assignedPersonClient,
				    DATE_FORMAT(r.date_of_submission, '%d-%m-%y') AS dateOfSubmission,
				    DATE_FORMAT(r.date_of_inspection, '%d-%m-%y') AS dateOfInspection,
				    DATE_FORMAT(r.time_of_inspection, '%H:%i') AS timeOfInspection,
				    ico.inspection_status AS inspectionStatus,
				    r.status as status,
				    r.action as action,
				    m.measurement_type AS measurementType,
				    m.total_qty AS totalQty,
				    ico.site_image as imgContractor,
				    ic.site_image as imgClient
				FROM rfi_data r
				LEFT JOIN (
				    SELECT rfi_id_fk, site_image, inspection_status
				    FROM rfi_inspection_details
				    WHERE uploaded_by != 'Engg'
				) AS ico ON r.id = ico.rfi_id_fk
				LEFT JOIN (
				    SELECT rfi_id_fk, site_image
				    FROM rfi_inspection_details
				    WHERE uploaded_by = 'Engg'
				) AS ic ON r.id = ic.rfi_id_fk
				LEFT JOIN measurements m ON r.id = m.rfi_id_fk
			WHERE r.created_by = :createdBy
			AND (r.is_deleted = 0 OR r.is_deleted IS NULL)
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
			    r.name_of_representative AS nameOfRepresentative,
			    r.assigned_person_client AS assignedPersonClient,
			    DATE_FORMAT(r.date_of_submission, '%d-%m-%y') AS dateOfSubmission,
			       DATE_FORMAT(r.date_of_inspection, '%d-%m-%y') AS dateOfInspection,
			    DATE_FORMAT(r.time_of_inspection, '%H:%i') AS timeOfInspection,
			    ico.inspection_status AS inspectionStatus,
			    r.status as status,
			    r.action as action,
			    m.measurement_type AS measurementType,
			    m.total_qty AS totalQty,
			    ico.site_image as imgContractor,
			    ic.site_image as imgClient,
			    ic.test_insite_lab as approvalStatus,
			    ic.post_test_report_path As testResCon,
			    ico.post_test_report_path As testResEngg
			FROM rfi_data r
			LEFT JOIN (
			    SELECT rfi_id_fk, site_image, inspection_status,post_test_report_path
			    FROM rfi_inspection_details
			    WHERE uploaded_by != 'Engg'
			) ico ON r.id = ico.rfi_id_fk
			LEFT JOIN (
			    SELECT rfi_id_fk, site_image,test_insite_lab,post_test_report_path
			    FROM rfi_inspection_details
			    WHERE uploaded_by = 'Engg'
			) ic ON r.id = ic.rfi_id_fk
			LEFT JOIN measurements m ON r.id = m.rfi_id_fk
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
				    r.description AS rfiDescription,
				    r.name_of_representative AS nameOfRepresentative,
				    r.assigned_person_client AS assignedPersonClient,
				    DATE_FORMAT(r.date_of_submission, '%d-%m-%y') AS dateOfSubmission,
				    DATE_FORMAT(r.date_of_inspection, '%d-%m-%y') AS dateOfInspection,
				    DATE_FORMAT(r.time_of_inspection, '%H:%i') AS timeOfInspection,
				    ico.inspection_status AS inspectionStatus,
				    r.status as status,
				    ic.test_insite_lab as approvalStatus,
				    r.action as action,
				    m.measurement_type AS measurementType,
				    m.total_qty AS totalQty,
				    ico.site_image as imgContractor,
				    ic.site_image as imgClient,
				    ico.post_test_report_path As testResCon,
				    ic.post_test_report_path As testResEngg

				FROM rfi_data r
				LEFT JOIN (
				    SELECT rfi_id_fk, site_image, inspection_status,post_test_report_path
				    FROM rfi_inspection_details
				    WHERE uploaded_by != 'Engg'
				) ico ON r.id = ico.rfi_id_fk
				LEFT JOIN (
				    SELECT rfi_id_fk, site_image, test_insite_lab,post_test_report_path
				    FROM rfi_inspection_details
				    WHERE uploaded_by = 'Engg'
				) ic ON r.id = ic.rfi_id_fk
				LEFT JOIN measurements m ON r.id = m.rfi_id_fk
				WHERE r.assigned_person_client = :assignedPersonClient
			AND (r.is_deleted = 0 OR r.is_deleted IS NULL)
				ORDER BY r.created_at DESC
				""", nativeQuery = true)
	List<RfiListDTO> findByAssignedPersonClient(@Param("assignedPersonClient") String assignedPersonClient);

	@Query(value = "SELECT COUNT(id) FROM rfi_data", nativeQuery = true)
	int countOfAllRfiCreatedSoFar();

	int countByAssignedPersonClient(String assignedTo);

	int countByCreatedBy(String createdBy);

	@Query(value = "SELECT r.id, r.status , i.test_insite_lab as ApprovalStatus FROM rfi_data r \r\n"
			+ "left join rfi_inspection_details i \r\n" + "on r.id = i.rfi_id_fk and uploaded_by = 'Engg'\r\n"
			+ "WHERE r.id = :id", nativeQuery = true)
	Optional<RfiStatusProjection> findStatusById(@Param("id") Long id);

	@Query(value = "select r.rfi_id , r.id,rv.id, rv.action as status, rv.remarks as remarks, validation_authority as valdationAuth from rfi_data as r\r\n"
			+ "right join rfi_validation as rv on r.id = rv.rfi_id_fk\r\n"
			+ " where r.is_deleted !=1\r\n"
			+ "ORDER BY rv.sent_for_validation_at DESC", nativeQuery = true)
	public List<GetRfiDTO> showRfiValidationsItAdmin();

	@Query(value = "select r.rfi_id , r.id,rv.id, rv.action as status, rv.remarks as remarks, validation_authority as valdationAuth from rfi_data as r\r\n"
			+ "right join rfi_validation as rv on r.id = rv.rfi_id_fk\r\n" + "where validation_authority = 'DyHod' and r.is_deleted !=1 \r\n"
			+ "ORDER BY rv.sent_for_validation_at DESC", nativeQuery = true)
	public List<GetRfiDTO> showRfiValidationsDyHod(String userId);

	@Query(value = "    SELECT r.rfi_id,\r\n" + "           r.id,\r\n" + "           rv.id,\r\n"
			+ "           rv.action AS status,\r\n" + "           rv.remarks AS remarks,\r\n"
			+ "			   validation_authority as valdationAuth \r\n" + "    FROM rfi_data r\r\n"
			+ "    RIGHT JOIN rfi_validation rv\r\n" + "        ON r.id = rv.rfi_id_fk\r\n"
			+ " where r.is_deleted !=1\r\n"
			+ "    ORDER BY rv.sent_for_validation_at DESC ", nativeQuery = true)
	public List<GetRfiDTO> showRfiValidationsEnggAuth(@Param("userName") String userName);

	@Query(value = "    SELECT r.rfi_id,\r\n" + "           r.id,\r\n" + "           rv.id,\r\n"
			+ "           rv.action AS status,\r\n" + "           rv.remarks AS remarks, \r\n"
			+ "			   validation_authority as valdationAuth \r\n" + "    FROM rfi_data r\r\n"
			+ "    RIGHT JOIN rfi_validation rv\r\n" + "        ON r.id = rv.rfi_id_fk\r\n"
			+ "    WHERE assigned_person_client LIKE CONCAT('%',:userName, '%') and validation_authority = 'EnggAuthority' and r.is_deleted !=1 \r\n"
			+ "    ORDER BY rv.sent_for_validation_at DESC ", nativeQuery = true)
	public List<GetRfiDTO> showRfiValidationsAssignedBy(@Param("userName") String userName);

	@Query(value = """
			SELECT
			  -- RFI base fields
			  ANY_VALUE(r.consultant) AS consultant,
			  ANY_VALUE(r.contract_short_name) AS contract,
			  ANY_VALUE(r.created_by) AS contractor,
			  ANY_VALUE(r.contract_id) AS contractId,
			  ANY_VALUE(r.rfi_id) AS rfiId,
			  ANY_VALUE(r.status) AS rfiStatus,

			  ANY_VALUE(DATE_FORMAT(ic.inspection_date, '%Y-%m-%d')) AS dateOfInspection,
			  ANY_VALUE(ico.location) AS location,
			  ANY_VALUE(TIME_FORMAT(r.time_of_inspection, '%H:%i:%s')) AS proposedInspectionTime,
			  ANY_VALUE(TIME_FORMAT(ic.time_of_inspection, '%H:%i:%s')) AS actualInspectionTime,

			  -- Description
			  ANY_VALUE(r.rfi_description) AS rfiDescription,
			  ANY_VALUE(r.enclosures) AS enclosures,
			  ANY_VALUE(r.name_of_representative) AS contractorRepresentative,
			  ANY_VALUE(r.assigned_person_client) AS clientRepresentative,
			  ANY_VALUE(r.description) AS descriptionByContractor,

			  -- Validation
			  ANY_VALUE(v.action) AS validationStatus,
			  ANY_VALUE(v.remarks) AS remarks,

			  -- Inspection details by role
			  ANY_VALUE(ic.selfie_path) AS selfieClient,
			  ANY_VALUE(ico.selfie_path) AS selfieContractor,
			  ANY_VALUE(ic.site_image) AS imagesUploadedByClient,
			  ANY_VALUE(ico.site_image) AS imagesUploadedByContractor,
			  ANY_VALUE(ic.test_insite_lab) AS testStatus,
			  ANY_VALUE(ico.test_site_documents) AS testSiteDocumentsContractor,
			  ANY_VALUE(ico.post_test_report_path) As testResultContractor,
			    ANY_VALUE(ic.post_test_report_path) As testResultEngineer,
			    ANY_VALUE(ico.supporting_documents) as conSupportFilePaths,
			    ANY_VALUE(ic.supporting_documents) as enggSupportFilePaths,
					ANY_VALUE(
					  GROUP_CONCAT(
					    CONCAT(
					      ua.file_name, '::',
					      REPLACE(IFNULL(ua.description, ''), '::', ''),
					      '##'
					    )
					    ORDER BY ua.id
					    SEPARATOR '||'
					  )
					) AS attachmentData
			FROM rfi_data r
			  LEFT JOIN rfi_inspection_details ic
			    ON r.id = ic.rfi_id_fk AND ic.uploaded_by = 'Engg'
			  LEFT JOIN rfi_inspection_details ico
			    ON r.id = ico.rfi_id_fk AND ico.uploaded_by != 'Engg'
			  LEFT JOIN rfi_validation v
			    ON v.rfi_id_fk = r.id
			  LEFT JOIN rfi_enclosure re
			    ON re.rfi_id_fk = r.id
			LEFT JOIN rfi_attachments ua ON ua.rfi_id_fk = r.id
			WHERE r.id = :id
			GROUP BY r.id;
			""", nativeQuery = true)
	List<RfiReportDTO> getRfiReportDetails(@Param("id") long id);

	@Query(value = """
			SELECT
			    ANY_VALUE(r.project_name) AS project,
			    ANY_VALUE(r.work_short_name) AS work,
			    ANY_VALUE(r.contract_short_name) AS contract,
			    ANY_VALUE(r.contract_id) AS contractId,
			    ANY_VALUE(r.structure_type) AS structureType,
			    ANY_VALUE(r.structure) AS structure,
			    ANY_VALUE(r.component) AS component,
			    ANY_VALUE(r.element) AS element,
			    ANY_VALUE(r.activity) AS activity,
			    ANY_VALUE(r.rfi_description) AS rfiDescription,
			    ANY_VALUE(r.action) AS action,
			    ANY_VALUE(r.type_of_rfi) AS typeOfRfi,
			    ANY_VALUE(r.name_of_representative) AS contractorRepresentative,
			    ANY_VALUE(r.created_by) AS contractor,
			    ANY_VALUE(r.enclosures) AS enclosures,
			    ANY_VALUE(r.rfi_id) AS rfiId,
			    ANY_VALUE(r.status) AS rfiStatus,
			    ANY_VALUE(r.description) AS descriptionByContractor,
			    ANY_VALUE(DATE_FORMAT(r.date_of_submission, '%Y-%m-%d')) AS dateOfCreation,
			    ANY_VALUE(DATE_FORMAT(ico.inspection_date, '%Y-%m-%d')) AS conInspDate,
			    ANY_VALUE(DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d')) AS proposedDateOfInspection,
			    ANY_VALUE(DATE_FORMAT(ic.inspection_date, '%Y-%m-%d')) AS actualDateOfInspection,
			    ANY_VALUE(TIME_FORMAT(r.time_of_inspection, '%H:%i:%s')) AS proposedInspectionTime,
			    ANY_VALUE(TIME_FORMAT(ic.time_of_inspection, '%H:%i:%s')) AS actualInspectionTime,
			    ANY_VALUE(r.dy_hod_user_id) AS dyHodUserId,
			    ANY_VALUE(r.assigned_person_client) AS clientRepresentative,
			    ANY_VALUE(r.client_department) AS clientDepartment,
			    ANY_VALUE(ico.location) AS conLocation,
			    ANY_VALUE(ic.location) AS clientLocation,
			    ANY_VALUE(ico.chainage) AS chainage,
			    ANY_VALUE(v.action) AS validationStatus,
			    ANY_VALUE(v.remarks) AS remarks,
			    ANY_VALUE(v.comment) AS validationComments,
			    ANY_VALUE(ic.selfie_path) AS selfieClient,
			    ANY_VALUE(ico.selfie_path) AS selfieContractor,
			    ANY_VALUE(ic.site_image) AS imagesUploadedByClient,
			    ANY_VALUE(ico.site_image) AS imagesUploadedByContractor,
			    ANY_VALUE(ico.inspection_status) AS typeOfTest,
			    ANY_VALUE(ic.test_insite_lab) AS testStatus,
			    ANY_VALUE(ic.ae_remarks) AS engineerRemarks,
			    ANY_VALUE(ico.test_site_documents) AS testSiteDocumentsContractor,
			    ANY_VALUE(ico.post_test_report_path) As testResultContractor,
			    ANY_VALUE(ic.post_test_report_path) As testResultEngineer,
			    ANY_VALUE(NULL) AS dyHodUserName,
			    ANY_VALUE(ico.supporting_documents) as conSupportFilePaths,
			    ANY_VALUE(ic.supporting_documents) as enggSupportFilePaths,
					ANY_VALUE(
					  GROUP_CONCAT(
					    CONCAT(
					      ua.file_name, '::',
					      REPLACE(IFNULL(ua.description, ''), '::', ''),
					      '##'
					    )
					    ORDER BY ua.id
					    SEPARATOR '||'
					  )
					) AS attachmentData

			FROM rfi_data r
			LEFT JOIN rfi_inspection_details ic
			    ON r.id = ic.rfi_id_fk AND ic.uploaded_by = 'Engg'
			LEFT JOIN rfi_inspection_details ico
			    ON r.id = ico.rfi_id_fk AND ico.uploaded_by != 'Engg'
			LEFT JOIN rfi_validation v ON v.rfi_id_fk = r.id
			LEFT JOIN rfi_enclosure re ON re.rfi_id_fk = r.id
			         LEFT JOIN rfi_attachments ua on  ua.rfi_id_fk = r.id
			WHERE r.id = :id
			GROUP BY r.id
			""", nativeQuery = true)
	List<RfiDetailsLogDTO> getRfiReportDetailsRfiLog(@Param("id") long id);

	@Query(value = """
			SELECT
			    r.id AS id,
			    ANY_VALUE(r.rfi_id) AS rfiId,
			    ANY_VALUE(DATE_FORMAT(r.date_of_submission, '%Y-%m-%d')) AS dateOfSubmission,
			    ANY_VALUE(r.structure),
			    ANY_VALUE(r.rfi_description) AS rfiDescription,
			    ANY_VALUE(r.created_by) AS rfiRequestedBy,
			    ANY_VALUE(r.client_department) AS department,
			    ANY_VALUE(r.assigned_person_client) AS person,
			    ANY_VALUE(DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d')) AS dateRaised,
			    ANY_VALUE(DATE_FORMAT(i.inspection_date, '%Y-%m-%d')) AS dateResponded,
			    ANY_VALUE(i.test_insite_lab) AS enggApproval,
			    ANY_VALUE(r.status) AS status,
			    ANY_VALUE(r.e_sign_status) AS eStatus,
			    ANY_VALUE(COALESCE(r.reason_for_delete, i.ae_remarks, rv.remarks)) AS notes,
			    ANY_VALUE(r.project_name) AS project,
			    ANY_VALUE(r.work_short_name) AS work,
			    ANY_VALUE(r.contract_short_name) AS contract,
			    ANY_VALUE(r.name_of_representative) AS nameOfRepresentative,
			    ANY_VALUE(r.txn_id) AS txnId
			FROM rfi_data AS r
			LEFT JOIN rfi_inspection_details AS i ON r.id = i.rfi_id_fk AND i.uploaded_by = 'Engg'
			LEFT JOIN rfi_validation AS rv ON rv.rfi_id_fk = r.id
			GROUP BY r.id
			ORDER BY r.created_at DESC
			""", nativeQuery = true)
	List<RfiLogDTO> listAllRfiLogItAdmin();

	// 🟩 Contractor / Created By
	@Query(value = """
			SELECT
			    r.id AS id,
			    ANY_VALUE(r.rfi_id) AS rfiId,
			    ANY_VALUE(r.structure),
			    ANY_VALUE(DATE_FORMAT(r.date_of_submission, '%Y-%m-%d')) AS dateOfSubmission,
			    ANY_VALUE(r.rfi_description) AS rfiDescription,
			    ANY_VALUE(r.created_by) AS rfiRequestedBy,
			    ANY_VALUE(r.client_department) AS department,
			    ANY_VALUE(r.assigned_person_client) AS person,
			    ANY_VALUE(DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d')) AS dateRaised,
			    ANY_VALUE(DATE_FORMAT(i.inspection_date, '%Y-%m-%d')) AS dateResponded,
			    ANY_VALUE(i.test_insite_lab) AS enggApproval,
			    ANY_VALUE(r.status) AS status,
			    ANY_VALUE(r.e_sign_status) AS eStatus,
			    ANY_VALUE(COALESCE(r.reason_for_delete, i.ae_remarks, rv.remarks)) AS notes,
			    ANY_VALUE(r.project_name) AS project,
			    ANY_VALUE(r.work_short_name) AS work,
			    ANY_VALUE(r.contract_short_name) AS contract,
			    ANY_VALUE(r.name_of_representative) AS nameOfRepresentative,
			    ANY_VALUE(r.txn_id) AS txnId
			FROM rfi_data AS r
			LEFT JOIN rfi_inspection_details AS i ON r.id = i.rfi_id_fk AND i.uploaded_by = 'Engg'
			LEFT JOIN rfi_validation AS rv ON rv.rfi_id_fk = r.id
			WHERE r.created_by = :userName
			GROUP BY r.id
			ORDER BY r.created_at DESC
			""", nativeQuery = true)
	List<RfiLogDTO> listAllRfiLogByCreatedBy(@Param("userName") String userName);

	// 🟩 Engineer
	@Query(value = """
			SELECT
			    r.id AS id,
			    ANY_VALUE(r.rfi_id) AS rfiId,
			    ANY_VALUE(DATE_FORMAT(r.date_of_submission, '%Y-%m-%d')) AS dateOfSubmission,
			    ANY_VALUE(r.structure),
			    ANY_VALUE(r.rfi_description) AS rfiDescription,
			    ANY_VALUE(r.created_by) AS rfiRequestedBy,
			    ANY_VALUE(r.client_department) AS department,
			    ANY_VALUE(r.assigned_person_client) AS person,
			    ANY_VALUE(DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d')) AS dateRaised,
			    ANY_VALUE(DATE_FORMAT(i.inspection_date, '%Y-%m-%d')) AS dateResponded,
			    ANY_VALUE(i.test_insite_lab) AS enggApproval,
			    ANY_VALUE(r.status) AS status,
			    ANY_VALUE(r.e_sign_status) AS eStatus,
			    ANY_VALUE(COALESCE(r.reason_for_delete, i.ae_remarks, rv.remarks)) AS notes,
			    ANY_VALUE(r.project_name) AS project,
			    ANY_VALUE(r.work_short_name) AS work,
			    ANY_VALUE(r.contract_short_name) AS contract,
			    ANY_VALUE(r.name_of_representative) AS nameOfRepresentative,
			    ANY_VALUE(r.txn_id) AS txnId
			FROM rfi_data AS r
			LEFT JOIN rfi_inspection_details AS i ON r.id = i.rfi_id_fk AND i.uploaded_by = 'Engg'
			LEFT JOIN rfi_validation AS rv ON rv.rfi_id_fk = r.id
			WHERE r.assigned_person_client = :userName
			GROUP BY r.id
			ORDER BY r.created_at DESC
			""", nativeQuery = true)
	List<RfiLogDTO> listAllRfiLogByAssignedBy(@Param("userName") String userName);

	@Query(value = """
			SELECT
			    r.id AS id,
			    ANY_VALUE(r.rfi_id) AS rfiId,
			    ANY_VALUE(DATE_FORMAT(r.date_of_submission, '%Y-%m-%d')) AS dateOfSubmission,
			    ANY_VALUE(r.structure),
			    ANY_VALUE(r.rfi_description) AS rfiDescription,
			    ANY_VALUE(r.created_by) AS rfiRequestedBy,
			    ANY_VALUE(r.client_department) AS department,
			    ANY_VALUE(r.assigned_person_client) AS person,
			    ANY_VALUE(DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d')) AS dateRaised,
			    ANY_VALUE(DATE_FORMAT(i.inspection_date, '%Y-%m-%d')) AS dateResponded,
			    ANY_VALUE(i.test_insite_lab) AS enggApproval,
			    ANY_VALUE(r.status) AS status,
			    ANY_VALUE(r.e_sign_status) AS eStatus,
			    ANY_VALUE(COALESCE(r.reason_for_delete, i.ae_remarks, rv.remarks)) AS notes,
			    ANY_VALUE(r.project_name) AS project,
			    ANY_VALUE(r.work_short_name) AS work,
			    ANY_VALUE(r.contract_short_name) AS contract,
			    ANY_VALUE(r.name_of_representative) AS nameOfRepresentative,
			    ANY_VALUE(r.txn_id) AS txnId
			FROM rfi_data AS r
			LEFT JOIN rfi_inspection_details AS i ON r.id = i.rfi_id_fk AND i.uploaded_by = 'Engg'
			LEFT JOIN rfi_validation AS rv ON rv.rfi_id_fk = r.id
			WHERE r.dy_hod_user_id = :userId
			GROUP BY r.id
			ORDER BY r.created_at DESC
			""", nativeQuery = true)
	List<RfiLogDTO> listAllRfiLogByDyHod(@Param("userId") String userId);

	long countByStatus(EnumRfiStatus status);

	@Query("SELECT COUNT(r) FROM RFI r WHERE r.status IN :statuses")
	long countByStatuses(@Param("statuses") List<EnumRfiStatus> statuses);

	// For Contractor
	long countByStatusAndCreatedBy(EnumRfiStatus status, String createdBy);

	@Query("SELECT COUNT(r) FROM RFI r WHERE r.status IN :statuses AND r.createdBy = :createdBy")
	long countByStatusesAndCreatedBy(@Param("statuses") List<EnumRfiStatus> statuses,
			@Param("createdBy") String createdBy);

	@Query("SELECT COUNT(DISTINCT r) FROM RFI r JOIN r.inspectionDetails i "
			+ "WHERE r.status = 'INSPECTION_DONE' AND i.testInsiteLab = 'Rejected' " + "AND r.createdBy = :createdBy")
	long countRejectedInspectionsByCreatedBy(@Param("createdBy") String createdBy);

	@Query("SELECT COUNT(r) FROM RFI r JOIN r.inspectionDetails i "
			+ "WHERE r.status = 'INSPECTION_DONE' AND i.testInsiteLab = 'Rejected'")
	long countRejectedInspections();

	@Query("SELECT COUNT(DISTINCT r) FROM RFI r JOIN r.inspectionDetails i "
			+ "WHERE r.status = 'INSPECTION_DONE' AND i.testInsiteLab = 'Rejected' "
			+ "AND r.assignedPersonClient = :assignedTo")
	long countRejectedInspectionsByAssignedTo(@Param("assignedTo") String assignedTo);

	@Query("SELECT COUNT(DISTINCT r) FROM RFI r JOIN r.inspectionDetails i "
			+ "WHERE r.status = 'INSPECTION_DONE' AND i.testInsiteLab = 'Rejected' "
			+ "AND (r.createdBy = :userName OR r.nameOfRepresentative = :userName OR r.assignedPersonClient = :userName)")
	long countRejectedInspectionsByRegularUser(@Param("userName") String userName);

	// For Engineer
	long countByStatusAndAssignedPersonClient(EnumRfiStatus status, String assignedTo);

	@Query("SELECT COUNT(r) FROM RFI r WHERE r.status IN :statuses AND r.assignedPersonClient = :assignedTo")
	long countByStatusesAndAssignedPersonClient(@Param("statuses") List<EnumRfiStatus> statuses,
			@Param("assignedTo") String assignedTo);

	// Count by single status for regular users (includes contractor rep, engineer,
	// etc.)
	@Query("SELECT COUNT(r) FROM RFI r WHERE r.status = :status AND "
			+ "(r.createdBy = :userName OR r.nameOfRepresentative = :userName OR r.assignedPersonClient = :userName)")
	long countByStatusByRegularUser(@Param("status") EnumRfiStatus status, @Param("userName") String userName);

	@Query("SELECT COUNT(r) FROM RFI r WHERE r.status IN :statuses AND "
			+ "(r.createdBy = :userName OR r.nameOfRepresentative = :userName OR r.assignedPersonClient = :userName)")
	long countByStatusesByRegularUser(@Param("statuses") List<EnumRfiStatus> statuses,
			@Param("userName") String userName);

	@Query(value = "select id from rfi_data " + "where contract_id = :contract "
			+ "and structure_type = :structureType " + "and structure = :structure", nativeQuery = true)
	List<Integer> getRfiIdsByFilter(String contract, String structureType, String structure);

	@Query(value = "SELECT * FROM rfi_data WHERE id IN (:ids)", nativeQuery = true)
	List<RFI> findByIds(@Param("ids") List<Integer> ids);

	@Query(value = """
			SELECT
			    r.id AS id,
			    r.rfi_id AS rfi_Id,
			    r.project_name AS project,
			    r.structure AS structure,
			    r.element AS element,
			    r.activity AS activity,
			    r.created_by as createdBy,
			    r.description AS rfiDescription,
			    r.assigned_person_client AS assignedPersonClient,
			    r.name_of_representative AS nameOfRepresentative,
			    DATE_FORMAT(r.date_of_submission, '%d-%m-%y') AS dateOfSubmission,
			    DATE_FORMAT(r.date_of_inspection, '%d-%m-%y') AS dateOfInspection,
			    DATE_FORMAT(r.time_of_inspection, '%H:%i') AS timeOfInspection,
			    ico.inspection_status AS inspectionStatus,
			    r.status AS status,
			    ic.test_insite_lab as approvalStatus,
			    r.action AS action,
			    m.measurement_type AS measurementType,
			    m.total_qty AS totalQty,
			    ico.site_image AS imgContractor,
			    ic.site_image AS imgClient,
			    ico.post_test_report_path As testResCon,
			    ic.post_test_report_path As testResEngg
			FROM rfi_data r
			LEFT JOIN (
			    SELECT r1.rfi_id_fk, r1.site_image, r1.inspection_status, r1.post_test_report_path
			    FROM rfi_inspection_details r1
			    WHERE r1.uploaded_by != 'Engg'
			      AND r1.id = (
			          SELECT MAX(r2.id)
			          FROM rfi_inspection_details r2
			          WHERE r2.rfi_id_fk = r1.rfi_id_fk
			          AND r2.uploaded_by != 'Engg'
			      )
			) AS ico ON r.id = ico.rfi_id_fk
			LEFT JOIN (
			    SELECT r3.rfi_id_fk, r3.site_image, r3.test_insite_lab, r3.post_test_report_path
			    FROM rfi_inspection_details r3
			    WHERE r3.uploaded_by = 'Engg'
			      AND r3.id = (
			          SELECT MAX(r4.id)
			          FROM rfi_inspection_details r4
			          WHERE r4.rfi_id_fk = r3.rfi_id_fk
			          AND r4.uploaded_by = 'Engg'
			      )
			) AS ic ON r.id = ic.rfi_id_fk
			LEFT JOIN measurements m ON r.id = m.rfi_id_fk
			  WHERE r.name_of_representative = :representative
			   AND (r.is_deleted = 0 OR r.is_deleted IS NULL)
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

	// 🟩 Regular User / Representative
	@Query(value = """
			SELECT
			    r.id AS id,
			    ANY_VALUE(r.rfi_id) AS rfiId,
			    ANY_VALUE(DATE_FORMAT(r.date_of_submission, '%Y-%m-%d')) AS dateOfSubmission,
			    ANY_VALUE(r.structure),
			    ANY_VALUE(r.structure),
			    ANY_VALUE(r.rfi_description) AS rfiDescription,
			    ANY_VALUE(r.created_by) AS rfiRequestedBy,
			    ANY_VALUE(r.client_department) AS department,
			    ANY_VALUE(r.assigned_person_client) AS person,
			    ANY_VALUE(DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d')) AS dateRaised,
			    ANY_VALUE(DATE_FORMAT(i.inspection_date, '%Y-%m-%d')) AS dateResponded,
			    ANY_VALUE(i.test_insite_lab) AS enggApproval,
			    ANY_VALUE(r.status) AS status,
			    ANY_VALUE(r.e_sign_status) AS eStatus,
			    ANY_VALUE(COALESCE(r.reason_for_delete, i.ae_remarks, rv.remarks)) AS notes,
			    ANY_VALUE(r.project_name) AS project,
			    ANY_VALUE(r.work_short_name) AS work,
			    ANY_VALUE(r.contract_short_name) AS contract,
			    ANY_VALUE(r.name_of_representative) AS nameOfRepresentative,
			    ANY_VALUE(r.txn_id) AS txnId
			FROM rfi_data AS r
			LEFT JOIN rfi_inspection_details AS i ON r.id = i.rfi_id_fk AND i.uploaded_by = 'Engg'
			LEFT JOIN rfi_validation AS rv ON rv.rfi_id_fk = r.id
			WHERE LOWER(r.name_of_representative) = LOWER(:userName)
			GROUP BY r.id
			ORDER BY r.created_at DESC
			""", nativeQuery = true)
	List<RfiLogDTO> listAllRfiLogByRepresentative(@Param("userName") String userName);

	// REpository Data inserting Method For Bulk updating theExecutive to filtered
	// rfi-Ids in Assign Executive Page
	@Transactional
	@Modifying
	@Query("UPDATE RFI r SET r.assignedPersonUserId = :userId, " + "r.clientDepartment = :department, "
			+ "r.assignedPersonClient = :client " + "WHERE r.id IN :ids")
	int bulkUpdateAssignedExecutive(@Param("userId") String userId, @Param("department") String department,
			@Param("client") String client, @Param("ids") List<Long> ids);

	@Query("SELECT r.contractorEsignDone FROM RFI r WHERE r.id = :id")
	Boolean isContractorSigned(@Param("id") Long id);

	@Query("SELECT r.engineerEsignDone FROM RFI r WHERE r.id = :id")
	Boolean isEngineerSigned(@Param("id") Long id);

	@Modifying
	@Transactional
	@Query("UPDATE RFI r SET r.contractorEsignDone = TRUE WHERE r.id = :id")
	void markContractorSigned(@Param("id") String espTxnID);

	@Modifying
	@Transactional
	@Query("UPDATE RFI r SET r.engineerEsignDone = TRUE WHERE r.id = :id")
	void markEngineerSigned(@Param("id") String espTxnID);

	@Query(value = """
			    SELECT
			        r.id AS id,
			        ANY_VALUE(r.rfi_id) AS rfiId,
			        ANY_VALUE(DATE_FORMAT(r.date_of_submission, '%Y-%m-%d')) AS dateOfSubmission,
			        ANY_VALUE(r.structure),
			        ANY_VALUE(r.rfi_description) AS rfiDescription,
			        ANY_VALUE(r.created_by) AS rfiRequestedBy,
			        ANY_VALUE(r.client_department) AS department,
			        ANY_VALUE(r.assigned_person_client) AS person,
			        ANY_VALUE(DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d')) AS dateRaised,
			        ANY_VALUE(DATE_FORMAT(i.inspection_date, '%Y-%m-%d')) AS dateResponded,
			        ANY_VALUE(i.test_insite_lab) AS enggApproval,
			        ANY_VALUE(r.status) AS status,
			        ANY_VALUE(r.e_sign_status) AS eStatus,
			        ANY_VALUE(COALESCE(r.reason_for_delete, i.ae_remarks, rv.remarks)) AS notes,
			        ANY_VALUE(r.project_name) AS project,
			        ANY_VALUE(r.work_short_name) AS work,
			        ANY_VALUE(r.contract_short_name) AS contract,
			        ANY_VALUE(r.name_of_representative) AS nameOfRepresentative,
			        ANY_VALUE(r.txn_id) AS txnId
			    FROM rfi_data AS r
			    LEFT JOIN rfi_inspection_details AS i ON r.id = i.rfi_id_fk AND i.uploaded_by = 'Engg'
			    LEFT JOIN rfi_validation AS rv ON rv.rfi_id_fk = r.id
			    GROUP BY r.id
			    ORDER BY r.created_at DESC
			""", nativeQuery = true)
	List<RfiLogDTO> listAllRfiLogByDataAdmin();

}