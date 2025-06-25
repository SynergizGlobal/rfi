package com.metro.rfisystem.backend.repository.rfi;

import com.metro.rfisystem.backend.model.rfi.RfiValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RfiValidationRepository extends JpaRepository<RfiValidation, Long> {
}
