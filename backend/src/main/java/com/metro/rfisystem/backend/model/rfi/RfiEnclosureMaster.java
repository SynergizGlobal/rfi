package com.metro.rfisystem.backend.model.rfi;

import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class RfiEnclosureMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String encloserName;
    private String checkListTitle;

    private String action;
    @OneToMany(mappedBy = "enclosureMasters")
    private List<ChecklistDescription> checklistDescriptions;

}
