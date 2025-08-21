package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.metro.rfisystem.backend.model.rfi.RfiDescription;

@Repository
public interface RfiDescriptionRepository extends  JpaRepository<RfiDescription, Integer>{
	
	@Query("SELECT r FROM RfiDescription r WHERE r.activity LIKE %:activity%")
	List<RfiDescription> findByActivity(@Param("activity") String activity);

}
