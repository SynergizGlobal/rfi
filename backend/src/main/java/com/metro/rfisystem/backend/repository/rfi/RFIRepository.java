package com.metro.rfisystem.backend.repository.rfi;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.metro.rfisystem.backend.model.rfi.RFI;



@Repository
public interface RFIRepository extends JpaRepository<RFI, Long> {	

    @Query("SELECT r FROM RFI r WHERE r.rfi_Id = :rfiId")
    Optional<RFI> findByRfiId(@Param("rfiId") String rfiId);

}
