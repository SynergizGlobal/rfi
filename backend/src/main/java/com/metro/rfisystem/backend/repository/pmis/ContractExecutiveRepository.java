package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.dto.AllowedContractDTO;
import com.metro.rfisystem.backend.model.pmis.ContractExecutive;

public interface ContractExecutiveRepository extends JpaRepository<ContractExecutive, String>{
	

    @Query("SELECT ce.contractIdFk FROM ContractExecutive ce WHERE ce.executiveUserIdFk = :userId")
    List<String> findContractIdsByExecutiveUserId(String userId);

    @Query(value = """
    	    SELECT DISTINCT u.user_name
    	    FROM contract c
    	    LEFT JOIN contract_executive ce ON c.contract_id = ce.contract_id_fk
    	    LEFT JOIN [user] u ON ce.executive_user_id_fk = u.user_id
    	    LEFT JOIN department d ON u.department_fk = d.department
    	    WHERE c.contract_id = :contractId
    	      AND d.department_name = 'Engineering'
    	""", nativeQuery = true)
    	List<String> findEngineeringUsernamesByContractId(@Param("contractId") String contractId);

    @Query(value = """
    	    SELECT u.user_name, d.department_name
    	    FROM contract_executive ce
    	    JOIN [user] u ON ce.executive_user_id_fk = u.user_id
    	    JOIN department d ON u.department_fk = d.department
    	    WHERE ce.contract_id_fk = :contractId
    	""", nativeQuery = true)
    	List<Object[]> findUserNamesAndDepartmentsByContractId(@Param("contractId") String contractId);

    	@Query(value = """
    		    SELECT DISTINCT u.user_name, d.department_name
    		    FROM contract_executive ce
    		    JOIN [user] u ON ce.executive_user_id_fk = u.user_id
    		    LEFT JOIN department d ON u.department_fk = d.department
    		    JOIN contract c ON c.contract_id = ce.contract_id_fk
    		    WHERE ce.contract_id_fk = :contractId
    		      AND c.dy_hod_user_id_fk = :dyHodUserId
    		""", nativeQuery = true)
    		List<Object[]> findUserNamesAndDepartmentsByContractIdAndDyHodUserId(
    		    @Param("contractId") String contractId,
    		    @Param("dyHodUserId") String dyHodUserId
    		);




}
