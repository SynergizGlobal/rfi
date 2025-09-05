package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.metro.rfisystem.backend.model.rfi.AssignExecutiveLog;

@Repository
public interface AssignExecutiveLogRepository extends JpaRepository<AssignExecutiveLog, Long> {
	
	List<AssignExecutiveLog> findAllByOrderByAssignedAtDesc();
}
