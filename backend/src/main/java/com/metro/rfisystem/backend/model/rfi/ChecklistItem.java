package com.metro.rfisystem.backend.model.rfi;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "checklist_description")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ChecklistItem {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long checklistItemId;

    private String description;
    

    @ManyToOne
    @JoinColumn(name = "desc_encl_id_fk")
    private RFiChecklistDescription enclosure;
}
