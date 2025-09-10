package com.metro.rfisystem.backend.repository.rfi;

import com.metro.rfisystem.backend.dto.ChecklistDTO;
import com.metro.rfisystem.backend.dto.ChecklistItemDTO;
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

    @Query("SELECT m.id as id,c.id as checklistId,m.encloserName as enclosername,m.checkListTitle as checklisttitle," +
            "COALESCE(c.checklistDescription, 'N/A') as checklistDescription FROM ChecklistDescription c LEFT JOIN c.enclosureMasters m WHERE m.encloserName=:encloserName ORDER BY c.id")
    List<ChecklistProjection> findAllChecklistDescriptionByName(@Param("encloserName") String encloserName);
    
    
 

        @Query(value = "SELECT " +
                "ci.enclosure_name AS enclosureName, " +
                "cd.checklist_description AS checklistDescription, " +
                "ci.con_status AS conStatus, " +
                "ci.ae_status AS aeStatus, " +
                "ci.contractor_remark AS contractorRemark, " +
                "ci.ae_remark AS aeRemark " +
                "FROM rfi_checklist_item ci " +
                "JOIN checklist_description cd ON cd.id = ci.chk_des_id " +
                "WHERE ci.rfi_id_fk = :rfiId",
                nativeQuery = true)
        List<ChecklistItemDTO> findChecklistItemsByRfiId(@Param("rfiId") Long rfiId);
    }

