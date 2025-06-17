package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.metro.rfisystem.backend.model.pmis.Structure;

public interface StructureRepository extends JpaRepository<Structure, Integer> {

	@Query(value = """
			SELECT DISTINCT s1.structure_type_fk
			FROM p6_activities a
			JOIN structure s1 ON s1.structure_id = a.structure_id_fk
			WHERE a.contract_id_fk = :contractId
			  AND s1.structure_type_fk IS NOT NULL
			""", nativeQuery = true)
	List<String> findStructureTypeByContractId(@Param("contractId") String contractId);

	@Query(value = """
					   SELECT s1.structure AS strip_chart_structure_id_fk
			FROM p6_activities s
			LEFT JOIN structure s1 ON s1.structure_id = s.structure_id_fk
			LEFT JOIN contract c ON c.contract_id = s.contract_id_fk
			WHERE
			    s1.structure IS NOT NULL
			    AND s1.structure_type_fk = :structureType
			    AND s.contract_id_fk = :contractId
			GROUP BY s1.structure;
					    """, nativeQuery = true)
	List<String> findStructureByStructureTypeAndContractId(@Param("structureType") String structureType,
			@Param("contractId") String contractId);

}
