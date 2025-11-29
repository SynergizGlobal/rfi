package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.dto.EnclosureDTO;
import com.metro.rfisystem.backend.model.rfi.RFIEnclosure;

public interface RFIEnclosureRepository extends JpaRepository<RFIEnclosure, Long> {
	
	List<RFIEnclosure> findByRfiIdAndEnclosureName(Long rfiId, String enclosureName);
	
	 @Query(value = "SELECT " +
	            "enclosure_name AS enclosureName, " +
	            "enclosure_upload_file AS file " +
	            "FROM rfi_enclosure " +
	            "WHERE rfi_id_fk = :rfiId",
	            nativeQuery = true)
	    List<EnclosureDTO> findEnclosuresByRfiId(@Param("rfiId") Long rfiId);
	 
	 
	 List<RFIEnclosure> findAllByRfi_IdAndEnclosureName(Long rfiId, String enclosureName);

	 @Query("SELECT e.enclosureName, e.enclosureUploadFile  FROM RFIEnclosure e WHERE e.rfi.id = :rfiId")
	 List<Object[]> findByRfiId(@Param("rfiId") Long rfiId);


}
