package com.metro.rfisystem.backend.repository.rfi;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.metro.rfisystem.backend.dto.MeasurementDTO;
import com.metro.rfisystem.backend.model.rfi.Measurements;

public interface MeasurementsRepository extends JpaRepository<Measurements, Long> {

	Optional<Measurements> findByRfiId(Long id);

	@Query(value = "SELECT measurement_type as measurementType, " + "Length as L, breadth as B, height as H, "
			+ "weight, units, no_of_items as No, total_qty as totalQty "
			+ "FROM measurements WHERE rfi_id_fk = :id", nativeQuery = true)
	Optional<MeasurementDTO> findMeasurementByRfiId(Long id);

}
