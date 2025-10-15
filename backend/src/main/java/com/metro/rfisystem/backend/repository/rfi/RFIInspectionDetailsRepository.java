package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;

public interface RFIInspectionDetailsRepository extends JpaRepository<RFIInspectionDetails, Long> {

	Optional<RFIInspectionDetails> findByRfiId(Long rfiId);

	List<RFIInspectionDetails> findByRfi_Id(Long rfiId);

	@Query(value = "SELECT site_image FROM rfi_inspection_details WHERE rfi_id_fk = :id AND uploaded_by= :uploadedBy", nativeQuery = true)
	public List<String> findSiteImagesByIdAndUploader(@Param("id") Long id, @Param("uploadedBy") String uploadedBy);

	Optional<RFIInspectionDetails> findByRfiAndUploadedBy(RFI rfi, String uploadedBy);
	
	@Query(value = "select * from rfi_inspection_details where rfi_id_fk = "
			+ ":rfiId AND uploaded_by = :uploadedBy", nativeQuery = true)
	Optional<RFIInspectionDetails> findByRfiIdAndUploadedBy(Long rfiId, String uploadedBy);


	@Query(value = "SELECT site_image FROM rfi_inspection_details WHERE rfi_id_fk = :id AND uploaded_by='Engg'", nativeQuery = true)
	public List<String> findSiteImagesByIdAndUploadedByClient(@Param("id") Long id);

	@Query(value = "SELECT site_image FROM rfi_inspection_details WHERE rfi_id_fk = :id AND uploaded_by!='Engg'", nativeQuery = true)
	public List<String> findSiteImagesByIdAndUploadedByContractor(@Param("id") Long id);

	@Query(value = "SELECT * FROM rfi_inspection_details WHERE rfi_id_fk = :rfiId ORDER BY id DESC LIMIT 1", nativeQuery = true)
	Optional<RFIInspectionDetails> findLatestByRfiId(@Param("rfiId") Long rfiId);

	   @Query("SELECT i FROM RFIInspectionDetails i WHERE i.rfi.id = :rfiId ORDER BY i.id DESC")
	   Optional<RFIInspectionDetails> findTopByRfiIdOrderByIdDesc(Long rfiId);
	
	@Query("SELECT i FROM RFIInspectionDetails i WHERE i.uploadedBy = :uploadedBy AND i.workStatus = com.metro.rfisystem.backend.constants.InspectionWorkFlowStatus.draft")
	List<RFIInspectionDetails> findDraftInspections(@Param("uploadedBy") String uploadedBy);

	@Query("SELECT i FROM RFIInspectionDetails i WHERE i.uploadedBy = :uploadedBy AND i.workStatus = com.metro.rfisystem.backend.constants.InspectionWorkFlowStatus.SUBMITTED")
	List<RFIInspectionDetails> findSubmittedByContractor(@Param("uploadedBy") String uploadedBy);

	@Query("SELECT i FROM RFIInspectionDetails i WHERE i.workStatus = com.metro.rfisystem.backend.constants.InspectionWorkFlowStatus.SUBMITTED")
	List<RFIInspectionDetails> findAllSubmitted();

	@Query("SELECT i FROM RFIInspectionDetails i")
	List<RFIInspectionDetails> findAllInspections();

	@Query("SELECT i FROM RFIInspectionDetails i WHERE i.rfi.id = :rfiId ORDER BY i.id DESC")
	List<RFIInspectionDetails> findInspectionsByRfiId(@Param("rfiId") Long rfiId);

	@Query("SELECT i FROM RFIInspectionDetails i WHERE i.rfi.id = :rfiId")
	List<RFIInspectionDetails> findAllByRfiId(@Param("rfiId") Long rfiId);

	@Query("SELECT i FROM RFIInspectionDetails i WHERE i.rfi.id = :rfiId AND i.uploadedBy = 'Engg'")
	List<RFIInspectionDetails> findEngineerInspectionsByRfiId(@Param("rfiId") Long rfiId);



}
