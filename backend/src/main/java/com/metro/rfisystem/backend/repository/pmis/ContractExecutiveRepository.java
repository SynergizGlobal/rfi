package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.metro.rfisystem.backend.model.pmis.ContractExecutive;

public interface ContractExecutiveRepository extends JpaRepository<ContractExecutive, String>{
	

    @Query("SELECT ce.contractIdFk FROM ContractExecutive ce WHERE ce.executiveUserIdFk = :userId")
    List<String> findContractIdsByExecutiveUserId(String userId);


}
