package com.metro.rfisystem.backend.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RfiLogFilterDTO  {
    private List<String> projects;
    private List<String> works;
    private List<String> contracts;
}
