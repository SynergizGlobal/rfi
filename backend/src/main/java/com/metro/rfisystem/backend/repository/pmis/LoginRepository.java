package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.metro.rfisystem.backend.model.pmis.User;

@Repository
public interface LoginRepository extends JpaRepository<User, String>  {

	List<User> findByUserName(String userName);

	Optional<User> findByEmailId(String email);

	List<User> findByUserRoleNameFkIgnoreCase(String string);

	@Query(value = "SELECT u.user_name, d.department_name\n"
			+ "FROM [user] u\n"
			+ "JOIN department d ON u.department_fk = d.department\n"
			+ "WHERE LOWER(u.user_role_name_fk) = 'regular user'",nativeQuery = true)
	List<Object[]> findUserNamesAndDepartmentsByRegularUserRole();
	
	
}
