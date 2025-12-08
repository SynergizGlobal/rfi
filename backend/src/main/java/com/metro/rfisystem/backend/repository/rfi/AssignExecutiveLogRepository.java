package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.metro.rfisystem.backend.model.rfi.AssignExecutiveLog;

import jakarta.transaction.Transactional;

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
			String structureType, String structure);
	
	@Query(value = "select id from rfi_data where"
			+ "  status = 'CREATED'\r\n"
			+ " AND Structure_Type = :structureType"
			+ " AND structure =:Structure"
			+ " AND contract_id = :ContractId\r\n"
			+ "", nativeQuery = true)
	List<Long> getRfiIdsByStructureTypeAndStructure(String structureType, String Structure,String ContractId);

	@Modifying
	@Transactional
	@Query(value = "DELETE a\r\n"
			+ "FROM assign_executive_log a\r\n"
			+ "INNER JOIN assign_executive_log b\r\n"
			+ "  ON a.contract_id = b.contract_id\r\n"
			+ " AND a.structure = b.structure\r\n"
			+ " AND a.structure_type = b.structure_type\r\n"
			+ "WHERE b.id = :id",nativeQuery = true)
	int deleteAssignExecutiveLogById(String id);
	

}
