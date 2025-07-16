package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.dto.ContractDropdownDTO;
import com.metro.rfisystem.backend.dto.ContractInfoProjection;
import com.metro.rfisystem.backend.model.pmis.Contract;

public interface ContractRepository extends JpaRepository<Contract, String> {

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

	@Query(value = "SELECT contract_id FROM contract WHERE contract_short_name = :shortName", nativeQuery = true)
	String findContractIdByShortName(@Param("shortName") String shortName);

	@Query("SELECT c.contractId FROM Contract c WHERE c.dyHodUserIdFk = :userId")
	List<String> findContractIdsByDyHodUserId(@Param("userId") String userId);

	@Query("SELECT c.contractId FROM Contract c WHERE c.contractorIdFk = :contractorId")
	List<String> findContractIdsByContractorId(@Param("contractorId") String contractorId);

	@Query(value = """
			    SELECT DISTINCT c.contract_short_name AS contractShortName,
			                    CAST(c.contract_id AS CHAR) AS contractIdFk
			    FROM contract c
			    LEFT JOIN contract_executive ce ON ce.contract_id_fk = c.contract_id
			    WHERE c.hod_user_id_fk = :userId
			       OR c.dy_hod_user_id_fk = :userId
			       OR ce.executive_user_id_fk = :userId
			       OR (SELECT contractor_id FROM contractor ctr
			            JOIN [user] u ON ctr.email_id = u.email_id
			            WHERE u.user_id = :userId) = c.contractor_id_fk
			""", nativeQuery = true)
	List<ContractDropdownDTO> findAllowedContractShortNames(@Param("userId") String userId);

	@Query("SELECT c.contractId FROM Contract c")
	List<String> findAllContractIds();

	@Query(value = "SELECT contract_short_name AS contractShortName, contract_id AS contractIdFk FROM contract", nativeQuery = true)
	List<ContractDropdownDTO> findAllContractShortNames();
	
}
