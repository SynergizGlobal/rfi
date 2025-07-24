package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.metro.rfisystem.backend.dto.AllowedContractDTO;
import com.metro.rfisystem.backend.model.pmis.Contractor;

@Repository
public interface ContractorRepository extends JpaRepository<Contractor, String> {
	@Query("SELECT c.contractorId FROM Contractor c WHERE c.contractorName = ("
			+ "SELECT u.userName FROM User u WHERE u.userId = :userId)")
	String findContractorIdByUserId(@Param("userId") String userId);

	@Query("SELECT c.contractId AS contractIdFk, c.contractShortName AS contractShortName "
			+ "FROM Contract c WHERE c.contractorIdFk = :contractorId")
	List<AllowedContractDTO> findAllowedContractShortNames(@Param("contractorId") String contractorId);

	@Query("SELECT c.contractorId FROM Contractor c WHERE c.contractorName = :contractorName")
	String findContractorIdByContractorName(@Param("contractorName") String contractorName);

	@Query(value = """
		    SELECT DISTINCT 
		        u.user_id AS userId,
		        u.user_name AS userName,
		        u.designation AS designation,
		        ce.contract_id_fk AS contractId
		    FROM contract c
		    JOIN contract_executive ce ON ce.contract_id_fk = c.contract_id
		    JOIN [user] u ON ce.executive_user_id_fk = u.user_id
		    WHERE c.dy_hod_user_id_fk = (
		        SELECT user_id FROM [user] WHERE user_name = :userName
		    )
		""", nativeQuery = true)
		List<Map<String, Object>> findEngineersUnderDyHOD(@Param("userName") String userName);
}
