package com.metro.rfisystem.backend.model.rfi;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rfi_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "rfi")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class RfiAttachments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rfi_id_fk", nullable = false)
    @JsonBackReference
    private RFI rfi;

    @Column(name = "description")
    private String description;
    
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;
    
    @Column(name = "uploaded_by")
    private String uploadedBy;
}
