package com.metro.rfisystem.backend.repository.rfi;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIChecklistItem;

public interface RFIInspectionChecklistRepository extends JpaRepository<RFIChecklistItem, Long> {

	Optional<RFIChecklistItem> findByRfi(RFI rfi);
}
