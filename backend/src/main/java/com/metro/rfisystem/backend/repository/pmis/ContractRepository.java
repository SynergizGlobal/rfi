package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.dto.AllowedContractDTO;
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
	List<AllowedContractDTO> findContractIdsByDyHodUserId(@Param("userId") String userId);

	@Query("SELECT c.contractId FROM Contract c WHERE c.contractorIdFk = :contractorId")
	List<String> findContractIdsByContractorId(@Param("contractorId") String contractorId);

	@Query(value = """
					SELECT DISTINCT
					    c.contract_short_name AS contractShortName,
					  TRIM(CAST(c.contract_id AS CHAR)) AS contractIdFk,
			          TRIM(CAST(c.work_id_fk AS CHAR)) AS workId,
			           us.designation AS designation
					FROM contract c
					LEFT JOIN work w ON c.work_id_fk = w.work_id
					LEFT JOIN contractor cr ON c.contractor_id_fk = cr.contractor_id
					LEFT JOIN project p ON w.project_id_fk = p.project_id
					LEFT JOIN department d1 ON c.contract_department = d1.department
					LEFT JOIN [user] u ON c.hod_user_id_fk = u.user_id
					LEFT JOIN department hoddt ON u.department_fk = hoddt.department
					LEFT JOIN [user] us ON c.dy_hod_user_id_fk = us.user_id
					LEFT JOIN contract_executive ce ON c.contract_id = ce.contract_id_fk
					LEFT JOIN contractexecutives ce1 ON ce1.work_id_fk = c.work_id_fk
					LEFT JOIN department dt ON ce.department_id_fk = dt.department
					WHERE c.contract_id IS NOT NULL
					  AND (
					      c.contractor_id_fk = :contractorId
					      OR c.hod_user_id_fk = :userId
					      OR c.dy_hod_user_id_fk = :userId
					      OR c.contract_id IN (
					          SELECT contract_id_fk
					          FROM contract_executive
					          WHERE executive_user_id_fk = :userId
					      )
					      OR c.contract_id IN (
					          SELECT c2.contract_id
					          FROM contractexecutives ce2
					          INNER JOIN work w2 ON w2.work_id = ce2.work_id_fk
					          INNER JOIN contract c2 ON c2.work_id_fk = w2.work_id
					          WHERE ce2.executive_user_id_fk = :userId
					      )
					  )
					""", nativeQuery = true)
	List<ContractDropdownDTO> findAllowedContractShortNames(@Param("userId") String userId,
			@Param("contractorId") String contractorId);

	@Query("SELECT c.contractId FROM Contract c")
	List<AllowedContractDTO> findAllContractIds();

	@Query(value = """
		    SELECT 
		        c.contract_short_name AS contractShortName,
		        TRIM(c.contract_id) AS contractIdFk,
		        TRIM(c.work_id_fk) AS workId,
		        u.designation AS designation
		    FROM contract c
		    LEFT JOIN [user] u ON c.dy_hod_user_id_fk = u.user_id
		""", nativeQuery = true)
		List<ContractDropdownDTO> findAllContractShortNames();


	@Query(value = """
		    SELECT DISTINCT 
		        TRIM(c.contract_id) AS contractId,
		        ISNULL(u.designation, '') AS designation
		    FROM contract c
		    LEFT JOIN [user] u ON c.dy_hod_user_id_fk = u.user_id
		    WHERE c.contractor_id_fk = :contractorId
		      AND c.dy_hod_user_id_fk IS NOT NULL
		      AND c.dy_hod_user_id_fk <> ''
		""", nativeQuery = true)
		List<Map<String, Object>> findContractsAndDyhodDesignationsByContractor(@Param("contractorId") String contractorId);

	@Query(value = """
		    SELECT DISTINCT
		        c.contract_id AS contractId,
		        us.designation AS designation
		    FROM contract c
		    LEFT JOIN [user] us ON c.dy_hod_user_id_fk = us.user_id
		    WHERE us.designation = :designation
		""", nativeQuery = true)
		List<Map<String, Object>> findContractsByDyhodDesignation(@Param("designation") String designation);

	@Query(value = """
		    SELECT c.contract_id
		    FROM contract c
		    INNER JOIN [user] u ON c.dy_hod_user_id_fk = u.user_id
		    WHERE u.user_name = :userName
		    """, nativeQuery = true)
		List<String> findContractIdsByDyHodUserName(@Param("userName") String userName);

	@Query("SELECT c.dyHodUserIdFk FROM Contract c WHERE c.contractId = :contractId")
	Optional<String> findDyHodUserIdByContractId(@Param("contractId") String contractId);


}
