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

//	@Query(value = """
//			            SELECT
//			    m.id AS id,
//			    m.encloser_name AS enclosername,
//			    m.action AS action,
//			    m.check_list_title AS checklisttitle,
//			    COALESCE(d.checklist_description, 'N/A') AS checklistDescription,
//			    i.status AS status,
//				i.contractor_remark as conRemark,
//			    i.ae_remark as aeRemark
//			FROM rfi_enclosure_master m
//			LEFT JOIN checklist_description d
//			    ON m.id = d.master_id
//			LEFT JOIN rfi_checklist_item i
//			    ON d.id = i.chk_des_id
//			JOIN rfi_data r
//			    ON r.id = i.rfi_id_fk
//			WHERE m.encloser_name = :encloserName
//			  AND r.id = 217
//			ORDER BY m.id;
//
//			            """, nativeQuery = true)
//	List<ChecklistProjection> findAllWithConditionalChecklistDescription(@Param("encloserName") String encloserName);
//}
	@Query(value = """
		    SELECT
		        m.id AS id,
		        m.encloser_name AS enclosername,
		        m.action AS action,
		        m.check_list_title AS checklisttitle,
		        COALESCE(d.checklist_description, 'N/A') AS checklistDescription,
		        i.status AS status,
		        i.contractor_remark AS contractorRemark,
		        i.ae_remark AS aeRemark
		    FROM rfi_enclosure_master m
		    LEFT JOIN checklist_description d
		        ON m.id = d.master_id
		    LEFT JOIN rfi_checklist_item i
		        ON d.id = i.chk_des_id
		    JOIN rfi_data r
		        ON r.id = i.rfi_id_fk
		    WHERE m.encloser_name = :encloserName
		      AND r.id = 212
		    ORDER BY m.id
		    """, nativeQuery = true)
		List<ChecklistProjection> findAllWithConditionalChecklistDescription(@Param("encloserName") String encloserName);

	
}
