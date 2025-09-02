package com.metro.rfisystem.backend.model.rfi;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "checklist_description")
public class ChecklistDescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String checklistDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_id")
    @JsonIgnore
    private RfiEnclosureMaster enclosureMasters;
    
    
    @OneToOne(mappedBy = "checklistDescription", fetch = FetchType.LAZY)
    @JsonIgnore
    private RFIChecklistItem rfiChecklistItem;
}
