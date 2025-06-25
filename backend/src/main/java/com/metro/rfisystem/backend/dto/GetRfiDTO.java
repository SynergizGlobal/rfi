package com.metro.rfisystem.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetRfiDTO {
	
	public String string_rfi_id;
	public long long_rfi_id;
	public long long_rfi_validate_id;

}
