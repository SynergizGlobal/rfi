package com.metro.rfisystem.backend.repository.rfi;

import com.metro.rfisystem.backend.model.rfi.RFiChecklistDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RFIChecklistDescriptionRepository extends JpaRepository<RFiChecklistDescription, Long> {

//	  @Query("SELECT new com.metro.rfisystem.backend.dto.ChecklistDTO( " +
//	           "c.id, c.rfiDescription, c.enclosername, c.action, c.checklisttitle, c.checklistDescription ) " +
//	           "FROM RFiChecklistDescription c " +
//	           "WHERE  c.enclosername = :enclosername")
//	    List<ChecklistDTO> findAllWithConditionalChecklistDescription(@Param("enclosername") String enclosername);
//	  
    @Query("SELECT DISTINCT e.enclosername FROM RFiChecklistDescription e WHERE e.action = 'OPEN'")
    List<String> findUniqueOpenEncloserNames();
    
    @Query(value="select checklist_description as checklist_items\r\n"
    		+ " from rfi_checklistdescription \r\n"
    		+ " where encloser_name =:enclosureName LIMIT 1",nativeQuery=true)
           List<String> getChecklistDescription(String enclosureName);

}
