package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.metro.rfisystem.backend.model.pmis.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
	    
	    @Query("SELECT u FROM User u WHERE LOWER(u.userId) = LOWER(:userId)")
	    Optional<User> findByUserIdIgnoreCase(@Param("userId") String userId);

	}
