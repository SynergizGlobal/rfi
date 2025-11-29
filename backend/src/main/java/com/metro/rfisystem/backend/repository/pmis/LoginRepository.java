package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.metro.rfisystem.backend.dto.AllowedContractDTO;
import com.metro.rfisystem.backend.model.pmis.User;

@Repository
public interface LoginRepository extends JpaRepository<User, String> {
//
//	@Query("SELECT u FROM User u WHERE u.userName = :userName")
//	List<User> findByUserName(@Param("userName") String userName);

	Optional<User> findByEmailId(String email);

	List<User> findByUserRoleNameFkIgnoreCase(String string);

	@Query(value = "SELECT u.user_name, d.department_name\n" + "FROM [user] u\n"
			+ "JOIN department d ON u.department_fk = d.department\n"
			+ "WHERE LOWER(u.user_role_name_fk) = 'regular user'", nativeQuery = true)
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

	@Query("SELECT u FROM User u WHERE u.designation = 'Contractor' AND u.departmentFk = 'CON'")
	List<User> findContractors();

	@Query(value = "SELECT u.user_id, u.user_name " + "FROM [user] u "
			+ "LEFT JOIN department d ON u.department_fk = d.department "
			+ "LEFT JOIN [user] usr ON u.reporting_to_id_srfk = usr.user_id "
			+ "WHERE u.user_role_name_fk = 'Regular User' " + "AND u.reporting_to_id_srfk = :reportingToId", nativeQuery = true)
	List<Map<String, Object>> findContractorsByReporting(@Param("reportingToId") String reportingToId);
	@Query("SELECT u.userName FROM User u WHERE u.userName = :userName")
	List<String> findUserNamesByUserName(@Param("userName") String userName);

	@Query("SELECT u.userName FROM User u " +
	       "WHERE u.reportingToIdSrfk IS NOT NULL " +
	       "AND u.reportingToIdSrfk <> '' " +
	       "AND u.userRoleNameFk = 'Contractor'")
	List<String> findAllContractorUserNamesWithReportingId();

	@Query("SELECT u FROM User u WHERE u.userId = :userId")
	List<User> findByUserId(@Param("userId") String userId);

//	@Query(value = "SELECT u.user_id, u.user_name " +
//            "FROM [user] u " +
//            "LEFT JOIN department d ON u.department_fk = d.department " +
//            "LEFT JOIN [user] usr ON u.reporting_to_id_srfk = usr.user_id " +
//            "WHERE u.user_role_name_fk = 'Regular User' " +   // ✅ Only Regular Users
//            "OR u.reporting_to_id_srfk = :reportingToId",     // ✅ Must report to logged-in user
//    nativeQuery = true)
//List<Map<String, Object>> findRegularUsersByReporting(@Param("reportingToId") String reportingToId);

	
	@Query(value = """
		    SELECT DISTINCT u.user_id, u.user_name
		    FROM [user] u
		    LEFT JOIN [user] u1 ON u1.user_id = u.reporting_to_id_srfk
		    LEFT JOIN contractor c ON c.contractor_name = u1.user_name
		    WHERE u.user_role_name_fk = 'Regular User'
		      AND u.user_type_fk = 'Contractor Rep'
		""", nativeQuery = true)
		List<Map<String, Object>> findRegularContractorReps();

    @Query(value = """
            SELECT u.user_name
            FROM [user] u
            INNER JOIN [user] manager
                ON u.reporting_to_id_srfk = manager.user_id
            WHERE manager.user_role_name_fk = 'Contractor'
            ORDER BY u.user_name ASC
        """, nativeQuery = true)
        List<Map<String, Object>> getAllRepresentativesReportingToContractor();

	Optional<User> findByUserName(String contractor);

	List<User> findByUserIdIn(List<String> ids);
}
