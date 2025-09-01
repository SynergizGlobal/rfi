package com.metro.rfisystem.backend.repository.rfi;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.metro.rfisystem.backend.model.rfi.RFI;
import com.metro.rfisystem.backend.model.rfi.RFIChecklistItem;

public interface RFIInspectionChecklistRepository extends JpaRepository<RFIChecklistItem, Long> {

	Optional<RFIChecklistItem> findByRfi(RFI rfi);

	Optional<RFIChecklistItem> findByRfiAndEnclosureName(RFI inspection, String enclosureName);
	List<RFIChecklistItem> findAllByRfiAndEnclosureName(RFI inspection, String enclosureName);
	
	@Query(value = "select checklist_description from rfi_checklistdescription where  encloser_name = :enclosureName and \r\n"
			+ "rfi_description =:rfiDesc", nativeQuery = true)
	public String getChecklistDescriptin(String rfiDesc, String enclosureName);
}
