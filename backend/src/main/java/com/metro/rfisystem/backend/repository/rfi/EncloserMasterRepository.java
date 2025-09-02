package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.dto.EnclosureNameDto;
import com.metro.rfisystem.backend.dto.RfiEnclosureDTO;
import com.metro.rfisystem.backend.model.rfi.RfiEnclosureMaster;

public interface EncloserMasterRepository extends JpaRepository<RfiEnclosureMaster, Long> {
	@Query("SELECT new com.metro.rfisystem.backend.dto.RfiEnclosureDTO(e.id, e.encloserName) " +
	           "FROM RfiEnclosureMaster e WHERE e.action = :action")
	    List<RfiEnclosureDTO> findAllEncloserNameByAction(@Param("action") String action);
	@Query("SELECT new com.metro.rfisystem.backend.dto.EnclosureNameDto(e.id, e.encloserName) FROM RfiEnclosureMaster e WHERE e.action = :action")
	List<EnclosureNameDto> findEnclosureNamesByAction(@Param("action") String action);
}
