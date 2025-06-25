package com.metro.rfisystem.backend.repository.rfi;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.metro.rfisystem.backend.model.rfi.RFIInspectionDetails;

public interface RFIInspectionDetailsRepository extends JpaRepository<RFIInspectionDetails, Long> {

	Optional<RFIInspectionDetails> findByRfiId(Long rfiId);
}
