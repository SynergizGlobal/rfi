package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.metro.rfisystem.backend.model.rfi.AssignExecutiveLog;

@Repository
public interface AssignExecutiveLogRepository extends JpaRepository<AssignExecutiveLog, Long> {
	
	List<AssignExecutiveLog> findAllByOrderByAssignedAtDesc();

	AssignExecutiveLog findTopByContractIdAndStructureTypeAndStructureOrderByAssignedAtDesc(String contractId,
			String structureType, String structure);}
