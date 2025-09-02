package com.metro.rfisystem.backend.repository.rfi;

import com.metro.rfisystem.backend.dto.ChecklistDTO;
import com.metro.rfisystem.backend.dto.ChecklistProjection;
import com.metro.rfisystem.backend.model.rfi.ChecklistDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChecklistDescriptionRepository extends JpaRepository<ChecklistDescription, Long> {

    @Query("select c FROM ChecklistDescription c JOIN FETCH c.enclosureMasters e where e.id=:id")
    List<ChecklistDescription> findAllChecklistDescriptionByEnclosureMastersId(@Param("id") Long id);
    
    @Query(value = """
            SELECT 
                m.id as id,
                m.encloser_name as enclosername, 
                m.action as action, 
                m.check_list_title as checklisttitle, 
                COALESCE(d.checklist_description, 'N/A') as checklistDescription
            FROM rfi_enclosure_master m
            LEFT JOIN checklist_description d ON m.id = d.master_id
            WHERE m.encloser_name = :encloserName
            ORDER BY m.id
            """, nativeQuery = true)
        List<ChecklistProjection> findAllWithConditionalChecklistDescription(@Param("encloserName") String encloserName);
    }

