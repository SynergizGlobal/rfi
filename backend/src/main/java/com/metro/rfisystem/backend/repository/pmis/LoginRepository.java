package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
	
import org.springframework.stereotype.Repository;

import com.metro.rfisystem.backend.model.pmis.User;

@Repository
public interface LoginRepository extends JpaRepository<User, String>  {

	List<User> findByUserName(String userName);

	Optional<User> findByEmailId(String email);

	
	
	
}
