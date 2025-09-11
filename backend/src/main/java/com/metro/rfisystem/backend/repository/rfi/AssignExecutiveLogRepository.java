package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.metro.rfisystem.backend.model.rfi.AssignExecutiveLog;

@Repository
public interface AssignExecutiveLogRepository extends JpaRepository<AssignExecutiveLog, Long> {
	

	@Query(value = """
			SELECT a.*
			FROM assign_executive_log a
			INNER JOIN (
			    SELECT contract_id, structure_type, structure, MAX(assigned_at) AS max_assigned_at
			    FROM assign_executive_log
			    GROUP BY contract_id, structure_type, structure
			) b ON a.contract_id = b.contract_id
			   AND a.structure_type = b.structure_type
			   AND a.structure = b.structure
			   AND a.assigned_at = b.max_assigned_at
			   order by assigned_at desc
			""", nativeQuery = true)
	List<AssignExecutiveLog> findLatestAssignments();
	
	AssignExecutiveLog findTopByContractIdAndStructureTypeAndStructureOrderByAssignedAtDesc(String contractId,
			String structureType, String structure);}
