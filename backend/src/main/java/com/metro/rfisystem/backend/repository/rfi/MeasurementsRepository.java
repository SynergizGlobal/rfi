package com.metro.rfisystem.backend.repository.rfi;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.metro.rfisystem.backend.dto.MeasurementDTO;
import com.metro.rfisystem.backend.model.rfi.Measurements;

public interface MeasurementsRepository extends JpaRepository<Measurements, Long> {

	Optional<Measurements> findByRfiId(Long id);

	@Query(value = "\r\n" + "SELECT measurement_type as measurementType,\r\n"
			+ "Length as L, breadth as B, height as H, no_of_items as No,\r\n"
			+ " total_qty as totalQty FROM measurements WHERE rfi_id_fk = :id", nativeQuery = true)
	Optional<MeasurementDTO> findMeasurementByRfiId(Long id);

}
