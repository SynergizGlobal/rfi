package com.metro.rfisystem.backend.repository.rfi;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.metro.rfisystem.backend.dto.GetRfiDTO;
import com.metro.rfisystem.backend.dto.RfiReportDTO;
import com.metro.rfisystem.backend.dto.RfiStatusProjection;
import com.metro.rfisystem.backend.model.rfi.RFI;
import java.util.List;




@Repository
public interface RFIRepository extends JpaRepository<RFI, Long> {	

	 Optional<RFI> findById(Long id);
	 
    @Query("SELECT r FROM RFI r WHERE r.rfi_Id = :rfiId")
    Optional<RFI> findByRfiId(@Param("rfiId") String rfiId);
    
    List<RFI> findByCreatedBy(String createdBy);

	List<RFI> findByAssignedPersonClient(String assignedPersonClient);

	int countByAssignedPersonClient(String assignedTo);
	
	@Query(value = "SELECT id, status FROM rfi_data WHERE id = :id", nativeQuery = true)
	Optional<RfiStatusProjection> findStatusById(@Param("id") Long id);

	@Query(value = "select r.rfi_id , r.id,rv.id \r\n" + "from rfi_data as r\r\n"
			+ "right join rfi_validation as rv\r\n" + "on r.id = rv.rfi_id_fk", nativeQuery = true)
	public List<GetRfiDTO> showRfiValidations();

	
	
	@Query(value = "SELECT\r\n"
			+ "  r.consultant AS consultant,\r\n"
			+ "  r.contract_short_name AS contract,\r\n"
			+ "  r.created_by AS contractor,\r\n"
			+ "  r.contract_id AS contractId,\r\n"
			+ "  r.rfi_id AS rfiId,\r\n"
			+ "  DATE_FORMAT(r.date_of_inspection, '%Y-%m-%d') AS dateOfInspection,\r\n"
			+ "  r.location AS location,\r\n"
			+ "  TIME_FORMAT(r.time_of_inspection, '%H:%i:%s') AS proposedInspectionTime,\r\n"
			+ "  TIME_FORMAT(i.time_of_inspection, '%H:%i:%s') AS actualInspectionTime,\r\n"
			+ "  r.rfi_description AS rfiDescription,\r\n"
			+ "  r.enclosures AS enclosures,\r\n"
			+ "  r.name_of_representative AS contractorRepresentative,\r\n"
			+ "  r.assigned_person_client AS clientRepresentative,\r\n"
			+ "  r.description AS descriptionByContractor,\r\n"
			+ "  c.drawing_approved AS drawingStatus,\r\n"
			+ "  c.alignment_ok AS alignmentStatus,\r\n"
			+ "  c.drawing_remark_contractor AS drawingRemarksContracotr,\r\n"
			+ "  c.drawing_remarkae AS drawingRemarksClient,\r\n"
			+ "  c.alignment_remark_contractor AS alignmentoCntractorRemarks,\r\n"
			+ "  c.alignment_remarkae AS alignmentClientRemarks,\r\n"
			+ "  v.action AS status,\r\n"
			+ "  v.remarks AS remarks,\r\n"
			+ "  enc.enclosureNames,\r\n"
			+ "  enc.enclosureFilePaths,\r\n"
			+ "  i.selfie_path AS selfiePath,\r\n"
			+ "  i.img_uploaded_by_client AS imagesUploadedByClient,\r\n"
			+ "  i.img_uploaded_by_contractor AS imagesUploadedByContractor,\r\n"
			+ "  i.test_insite_lab AS testInsiteLab,\r\n"
			+ "  i.test_site_documents AS testSiteDocuments,\r\n"
			+ "  c.contractor_signature AS contractorSignature,\r\n"
			+ "  c.gc_mrvc_representative_signature AS gcMrvcSignature\r\n"
			+ "FROM rfi_data r\r\n"
			+ "JOIN rfi_inspection_details i ON r.id = i.rfi_id_fk\r\n"
			+ "JOIN rfi_validation v ON v.rfi_id_fk = r.id\r\n"
			+ "JOIN rfi_checklist_item c ON i.id = c.inspection_id_fk\r\n"
			+ "LEFT JOIN (\r\n"
			+ "    SELECT \r\n"
			+ "      inspection_id_fk,\r\n"
			+ "      GROUP_CONCAT(enclosure_name SEPARATOR ', ') AS enclosureNames,\r\n"
			+ "      GROUP_CONCAT(enclosure_upload_file SEPARATOR ', ') AS enclosureFilePaths\r\n"
			+ "    FROM rfi_enclosure\r\n"
			+ "    GROUP BY inspection_id_fk\r\n"
			+ ") enc ON enc.inspection_id_fk = i.id\r\n"
			+ "WHERE r.id = :id \r\n"
			+ "GROUP BY r.id;\r\n"
			+ "", nativeQuery = true)
	List<RfiReportDTO> getRfiReportDetails(@Param("id") long id);





}
