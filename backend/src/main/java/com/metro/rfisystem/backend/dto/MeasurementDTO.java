package com.metro.rfisystem.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeasurementDTO {
	
	 private String measurementType;
     private Double L;
     private Double B;
     private Double H;
     private Double weight;    
     @JsonProperty("units")
     private String units;
     private Integer No;
     private Double totalQty;


}
