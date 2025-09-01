package com.metro.rfisystem.backend.model.rfi;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
public class RFiChecklistDescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rfi_description")
    private String rfiDescription;

    @Column(name = "encloser_name")
    private String enclosername;

    @Column(name = "action")
    private String action; // OPEN or UPLOAD






}
    
