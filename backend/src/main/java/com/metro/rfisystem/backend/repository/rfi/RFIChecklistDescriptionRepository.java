package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.metro.rfisystem.backend.model.rfi.RFiChecklistDescription;

public interface RFIChecklistDescriptionRepository extends JpaRepository<RFiChecklistDescription, Long> {

    @Query("SELECT DISTINCT e.enclosername FROM RFiChecklistDescription e WHERE e.action = 'OPEN'")
    List<String> findUniqueOpenEncloserNames();
    
    @Query(value="select checklist_description as checklist_items\r\n"
    		+ " from rfi_checklistdescription \r\n"
    		+ " where encloser_name =:enclosureName LIMIT 1",nativeQuery=true)
    List<String> getChecklistDescription(String enclosureName);

}
