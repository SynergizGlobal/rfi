package com.metro.rfisystem.backend.model.rfi;

import java.util.List;

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
    
    
    
    @OneToMany(mappedBy = "checklistDescription", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RFIChecklistItem> rfiChecklistItems ;


}
