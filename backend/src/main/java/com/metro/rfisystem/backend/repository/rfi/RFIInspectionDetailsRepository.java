package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;

public interface RFIInspectionDetailsRepository extends JpaRepository<RFIInspectionDetails, Long> {

	Optional<RFIInspectionDetails> findByRfiId(Long rfiId);
	
	@Query(value="SELECT site_image FROM rfi_inspection_details WHERE rfi_id_fk = :id AND uploaded_by= :uploadedBy",nativeQuery=true)
	public List<String> findSiteImagesByIdAndUploader(@Param("id") Long id, @Param("uploadedBy") String uploadedBy);

}
