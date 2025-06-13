package com.metro.rfisystem.backend.repository.rfi;

import org.springframework.data.jpa.repository.JpaRepository;


import org.springframework.stereotype.Repository;

import com.metro.rfisystem.backend.model.rfi.RFI;



@Repository
public interface RFIRepository extends JpaRepository<RFI, Long> {
}
