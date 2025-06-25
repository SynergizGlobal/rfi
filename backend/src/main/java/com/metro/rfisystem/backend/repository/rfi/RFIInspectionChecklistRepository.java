package com.metro.rfisystem.backend.repository.rfi;

import org.springframework.data.jpa.repository.JpaRepository;

import com.metro.rfisystem.backend.model.rfi.RFIChecklistItem;

public interface RFIInspectionChecklistRepository extends JpaRepository<RFIChecklistItem, Long> {

}
