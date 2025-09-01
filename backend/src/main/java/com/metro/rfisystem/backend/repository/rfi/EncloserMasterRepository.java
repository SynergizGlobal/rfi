package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.model.rfi.RfiEnclosureMaster;

public interface EncloserMasterRepository extends JpaRepository<RfiEnclosureMaster, Long> {
	@Query("SELECT e FROM RfiEnclosureMaster e WHERE e.action = :action")
	List<RfiEnclosureMaster> findAllEncloserNameByAction(@Param("action") String action);

}
