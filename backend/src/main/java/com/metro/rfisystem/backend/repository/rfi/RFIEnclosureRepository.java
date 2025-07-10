package com.metro.rfisystem.backend.repository.rfi;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.metro.rfisystem.backend.model.rfi.RFIEnclosure;

public interface RFIEnclosureRepository extends JpaRepository<RFIEnclosure, Long> {
	
	Optional<RFIEnclosure> findByRfiIdAndEnclosureName(Long rfiId, String enclosureName);

}
