package com.metro.rfisystem.backend.repository.rfi;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.metro.rfisystem.backend.model.rfi.Measurements;

public interface MeasurementsRepository extends JpaRepository<Measurements, Long>{
	
	Optional<Measurements> findByRfiId(Long id);


}
