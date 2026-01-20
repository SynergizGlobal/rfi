package com.metro.rfisystem.backend.repository.rfi;

import org.springframework.data.jpa.repository.JpaRepository;
import com.metro.rfisystem.backend.model.rfi.RfiAttachments;

public interface UploadAttachmentRepository extends JpaRepository<RfiAttachments, Long> {
	

}
