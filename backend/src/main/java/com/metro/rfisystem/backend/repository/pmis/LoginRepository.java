package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.metro.rfisystem.backend.dto.AllowedContractDTO;
import com.metro.rfisystem.backend.model.pmis.User;

@Repository
public interface LoginRepository extends JpaRepository<User, String>  {

	@Query("SELECT u FROM User u WHERE u.userName = :userName")
	List<User> findByUserName(@Param("userName") String userName);

	Optional<User> findByEmailId(String email);

	List<User> findByUserRoleNameFkIgnoreCase(String string);

	@Query(value = "SELECT u.user_name, d.department_name\n"
			+ "FROM [user] u\n"
			+ "JOIN department d ON u.department_fk = d.department\n"
			+ "WHERE LOWER(u.user_role_name_fk) = 'regular user'",nativeQuery = true)
	List<Object[]> findUserNamesAndDepartmentsByRegularUserRole();

	@Query(value = """
		    SELECT u.user_name + ' (' + d.department_name + ')' AS engineer
		    FROM contract_executive ce
		    INNER JOIN [user] u ON ce.executive_user_id_fk = u.user_id
		    INNER JOIN department d ON u.department_fk = d.department
		    WHERE ce.contract_id_fk = :contractId
		      AND d.department_name = 'Engineering'
		    """, nativeQuery = true)
		List<String> findEngineersByContractId(@Param("contractId") String contractId);

	
	
}
