package com.metro.rfisystem.backend.model.rfi;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "measurements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Measurements {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
    @Column(name = "measurement_type")
    private String measurementType;

    @Column(name = "length")
    private Double length;

    @Column(name = "breadth")
    private Double breadth;

    @Column(name = "height")
    private Double height;

    @Column(name = "no_of_items")
    private Integer noOfItems;
  
    @Column(name = "total_qty")
    private Double totalQty;
    
    @OneToOne
    @JoinColumn(name = "rfi_id_fk", referencedColumnName = "id")
    @JsonBackReference
    private RFI rfi;


}
