package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.metro.rfisystem.backend.dto.ExecutiveDTO;
import com.metro.rfisystem.backend.model.pmis.P6Activity;

public interface P6ActivityRepository extends JpaRepository<P6Activity, Integer> {

	@Query(value = """
						   SELECT component AS strip_chart_component
			FROM p6_activities a
			LEFT JOIN structure s ON s.structure_id = a.structure_id_fk
			WHERE
			    component IS NOT NULL
			    AND component <> ''
			    AND (component_details != 'OBC' OR component_details IS NULL)
			    AND a.contract_id_fk = :contractId
			    AND structure_type_fk = :structureType
			    AND structure = :structure
			GROUP BY component;
						    """, nativeQuery = true)
	List<String> findComponentByStructureTypeAndContractIdAndStructure(@Param("structureType") String structureType,
			@Param("contractId") String contractId, @Param("structure") String structure);

	@Query(value = """
						   	SELECT DISTINCT
    component_id AS strip_chart_component_id_name
FROM p6_activities a
LEFT JOIN structure s ON s.structure_id = a.structure_id_fk
WHERE component_id IS NOT NULL
  AND (component_details != 'OBC' OR component_details IS NULL)
  AND component_id <> ''
  AND a.contract_id_fk = :contractId
  AND s.structure_type_fk = :structureType
  AND s.structure = :structure
  AND component = :component
						    """, nativeQuery = true)
	List<String> findElementByStructureTypeAndStructureAndComponent(@Param("contractId") String contractId,@Param("structureType") String structureType,
			@Param("structure") String structure, @Param("component") String component);

	@Query(value = """
						   SELECT
			distinct a.p6_activity_name
			FROM
			 p6_activities a
			LEFT JOIN
			 structure s11 ON s11.structure_id = a.structure_id_fk
			WHERE
			 a.p6_activity_id IS NOT NULL
			 AND (a.component_details != 'OBC' OR a.component_details IS NULL)
			 AND s11.structure_type_fk = :structureType
			 AND s11.structure = :structure
			 AND a.component = :component
			 aND a.component_id = :component_id;
						    """, nativeQuery = true)
	List<String> findActivityNamesByStructureTypeAndStructureAndComponentAndCompId(
			@Param("structureType") String structureType, @Param("structure") String structure,
			@Param("component") String component, @Param("component_id") String component_id);
	
	@Query(value = "SELECT \r\n"
			+ "    u.user_name as userName,\r\n"
			+ "    d.department_name as department\r\n"
			+ "FROM [user] u\r\n"
			+ "LEFT JOIN department d \r\n"
			+ "       ON u.department_fk = d.department\r\n"
			+ "WHERE user_id IS NOT NULL\r\n"
			+ "  AND user_type_fk <> ''\r\n"
			+ "  AND u.user_type_fk NOT IN ('Others')\r\n"
			+ "  AND u.department_fk IN (\r\n"
			+ "        SELECT u.department_fk\r\n"
			+ "        FROM contract c\r\n"
			+ "        LEFT JOIN [user] u \r\n"
			+ "               ON u.user_id = c.hod_user_id_fk\r\n"
			+ "        WHERE c.contract_id = :contractId\r\n"
			+ "  )\r\n"
			+ "  AND user_name NOT LIKE '%user%'\r\n"
			+ "  AND pmis_key_fk NOT LIKE '%SGS%'\r\n"
			+ "AND u.department_fk = 'Engg' \r\n"
			+ "ORDER BY \r\n"
			+ "    CASE \r\n"
			+ "        WHEN user_type_fk='HOD' THEN 1\r\n"
			+ "        WHEN user_type_fk='DYHOD' THEN 2\r\n"
			+ "        WHEN user_type_fk='Officers ( Jr./Sr. Scale )' THEN 3\r\n"
			+ "        WHEN user_type_fk='Others' THEN 4\r\n"
			+ "    END ASC,\r\n"
			+ "    CASE\r\n"
			+ "        WHEN u.designation = 'ED Civil' THEN 1\r\n"
			+ "        WHEN u.designation = 'CPM I' THEN 2\r\n"
			+ "        WHEN u.designation = 'CPM II' THEN 3\r\n"
			+ "        WHEN u.designation = 'CPM III' THEN 4\r\n"
			+ "        WHEN u.designation = 'CPM V' THEN 5\r\n"
			+ "        WHEN u.designation = 'CE' THEN 6\r\n"
			+ "        WHEN u.designation = 'ED S&T' THEN 7\r\n"
			+ "        WHEN u.designation = 'CSTE' THEN 8\r\n"
			+ "        WHEN u.designation = 'GM Electrical' THEN 9\r\n"
			+ "        WHEN u.designation = 'CEE Project I' THEN 10\r\n"
			+ "        WHEN u.designation = 'CEE Project II' THEN 11\r\n"
			+ "        WHEN u.designation = 'ED Finance & Planning' THEN 12\r\n"
			+ "        WHEN u.designation = 'AGM Civil' THEN 13\r\n"
			+ "        WHEN u.designation = 'DyCPM Civil' THEN 14\r\n"
			+ "        WHEN u.designation = 'DyCPM III' THEN 15\r\n"
			+ "        WHEN u.designation = 'DyCPM V' THEN 16\r\n"
			+ "        WHEN u.designation = 'DyCE EE' THEN 17\r\n"
			+ "        WHEN u.designation = 'DyCE Badlapur' THEN 18\r\n"
			+ "        WHEN u.designation = 'DyCPM Pune' THEN 19\r\n"
			+ "        WHEN u.designation = 'DyCE Proj' THEN 20\r\n"
			+ "        WHEN u.designation = 'DyCEE I' THEN 21\r\n"
			+ "        WHEN u.designation = 'DyCEE Projects' THEN 22\r\n"
			+ "        WHEN u.designation = 'DyCEE PSI' THEN 23\r\n"
			+ "        WHEN u.designation = 'DyCSTE I' THEN 24\r\n"
			+ "        WHEN u.designation = 'DyCSTE IT' THEN 25\r\n"
			+ "        WHEN u.designation = 'DyCSTE Projects' THEN 26\r\n"
			+ "        WHEN u.designation = 'XEN Consultant' THEN 27\r\n"
			+ "        WHEN u.designation = 'AEN Adhoc' THEN 28\r\n"
			+ "        WHEN u.designation = 'AEN Project' THEN 29\r\n"
			+ "        WHEN u.designation = 'AEN P-Way' THEN 30\r\n"
			+ "        WHEN u.designation = 'AEN' THEN 31\r\n"
			+ "        WHEN u.designation = 'Sr Manager Signal' THEN 32\r\n"
			+ "        WHEN u.designation = 'Manager Signal' THEN 33\r\n"
			+ "        WHEN u.designation = 'Manager Civil' THEN 34\r\n"
			+ "        WHEN u.designation = 'Manager OHE' THEN 35\r\n"
			+ "        WHEN u.designation = 'Manager GS' THEN 36\r\n"
			+ "        WHEN u.designation = 'Manager Finance' THEN 37\r\n"
			+ "        WHEN u.designation = 'Planning Manager' THEN 38\r\n"
			+ "        WHEN u.designation = 'Manager Project' THEN 39\r\n"
			+ "        WHEN u.designation = 'Manager' THEN 40\r\n"
			+ "        WHEN u.designation = 'SSE' THEN 41\r\n"
			+ "        WHEN u.designation = 'SSE Project' THEN 42\r\n"
			+ "        WHEN u.designation = 'SSE Works' THEN 43\r\n"
			+ "        WHEN u.designation = 'SSE Drg' THEN 44\r\n"
			+ "        WHEN u.designation = 'SSE BR' THEN 45\r\n"
			+ "        WHEN u.designation = 'SSE P-Way' THEN 46\r\n"
			+ "        WHEN u.designation = 'SSE OHE' THEN 47\r\n"
			+ "        WHEN u.designation = 'SPE' THEN 48\r\n"
			+ "        WHEN u.designation = 'PE' THEN 49\r\n"
			+ "        WHEN u.designation = 'JE' THEN 50\r\n"
			+ "        WHEN u.designation = 'Demo-HOD-Elec' THEN 51\r\n"
			+ "        WHEN u.designation = 'Demo-HOD-Engg' THEN 52\r\n"
			+ "        WHEN u.designation = 'Demo-HOD-S&T' THEN 53\r\n"
			+ "    END;\r\n"
			+ "",nativeQuery = true)
	List<ExecutiveDTO> getExcecutives(String contractId);

}
