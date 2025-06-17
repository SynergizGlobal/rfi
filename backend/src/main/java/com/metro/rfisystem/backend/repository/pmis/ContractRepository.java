package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.dto.ContractInfoProjection;
import com.metro.rfisystem.backend.model.pmis.Contract;

public interface ContractRepository extends JpaRepository<Contract,String>{
	
	
	@Query(value = """
		    SELECT DISTINCT c.contract_short_name AS contractShortName, CAST(c.contract_id AS CHAR) AS contractIdFk
		    FROM p6_activities a
		    LEFT JOIN structure s ON s.structure_id = a.structure_id_fk
		    LEFT OUTER JOIN contract c ON a.contract_id_fk = c.contract_id
		    LEFT OUTER JOIN contract_executive c1 ON c1.contract_id_fk = c.contract_id
		    WHERE c.work_id_fk IS NOT NULL
		      AND a.contract_id_fk IS NOT NULL
		      AND (:workId IS NULL OR c.work_id_fk = :workId)
		    """, nativeQuery = true)
		List<ContractInfoProjection> findContractInfoByWorkId(@Param("workId") String workId);




}
