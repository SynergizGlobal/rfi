package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.metro.rfisystem.backend.constants.InspectionWorkFlowStatus;
import com.metro.rfisystem.backend.model.rfi.ChecklistDescription;
import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIChecklistItem;
import org.springframework.data.repository.query.Param;

public interface RFIInspectionChecklistRepository extends JpaRepository<RFIChecklistItem, Long> {

    Optional<RFIChecklistItem> findByRfi(RFI rfi);

    Optional<RFIChecklistItem> findByRfiAndEnclosureName(RFI inspection, String enclosureName);

    List<RFIChecklistItem> findAllByRfiAndEnclosureName(RFI inspection, String enclosureName);

    @Query(value = "select checklist_description from rfi_checklistdescription where  encloser_name = :enclosureName and \r\n"
            + "rfi_description =:rfiDesc", nativeQuery = true)
    String getChecklistDescriptin(String rfiDesc, String enclosureName);

    @Query("FROM RFIChecklistItem r where r.checklistDescription.id IN (:ids)")
    List<RFIChecklistItem> findByChecklistDescription(@Param("ids") List<Long> ids);
    
    
    @Query(value = "select work_status from rfi_inspection_details "
    		+ "where rfi_id_fk = :id and uploaded_by = :uploadedBy",nativeQuery = true)
    public Optional<Integer> getWorkStatusbyRfiIdAndUploadedby(long id,String uploadedBy);

	Optional<RFIChecklistItem> findByRfiAndEnclosureNameAndChecklistDescription(RFI inspection, String enclosureName,
			ChecklistDescription description);
	
	  @Query("FROM RFIChecklistItem r " +
   	       "WHERE r.checklistDescription.id IN (:ids) " +
   	       "AND r.rfi.id = :rfiId")
   List<RFIChecklistItem> findByChecklistDescriptionAndRfi(@Param("ids") List<Long> ids, @Param("rfiId") Long rfiId);


}
