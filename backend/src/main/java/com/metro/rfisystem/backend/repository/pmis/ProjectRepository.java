package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.metro.rfisystem.backend.dto.ProjectDTO;
import com.metro.rfisystem.backend.model.pmis.Project;

public interface ProjectRepository extends JpaRepository<Project, String> {

	@Query(value = "SELECT \n" + "    p.project_name,\n" + "    p.project_id\n" + "FROM \n" + "    work wr\n"
			+ "LEFT OUTER JOIN \n" + "    project p ON wr.project_id_fk = p.project_id\n" + "WHERE \n"
			+ "    wr.project_id_fk IS NOT NULL\n" + "    AND wr.work_id IN (\n" + "        SELECT \n"
			+ "            c.work_id_fk\n" + "        FROM \n" + "            contract c\n"
			+ "        LEFT OUTER JOIN \n" + "            work w ON c.work_id_fk = w.work_id\n" + "        WHERE \n"
			+ "            c.contract_id IN (\n" + "                SELECT \n"
			+ "                    a.contract_id_fk\n" + "                FROM \n"
			+ "                    p6_activities a\n" + "                LEFT JOIN \n"
			+ "                    structure s ON s.structure_id = a.structure_id_fk\n"
			+ "                LEFT OUTER JOIN \n"
			+ "                    contract co ON a.contract_id_fk = co.contract_id\n" + "                WHERE \n"
			+ "                    a.contract_id_fk IS NOT NULL\n" + "                GROUP BY \n"
			+ "                    a.contract_id_fk\n" + "            )\n" + "        GROUP BY \n"
			+ "            c.work_id_fk\n" + "    )\n" + "GROUP BY \n" + "    wr.project_id_fk,\n"
			+ "    p.project_id,\n" + "    p.project_name\n" + "ORDER BY \n" + "    wr.project_id_fk ASC;\n"
			+ "", nativeQuery = true)
	List<ProjectDTO> findDistinctProjectNames();


}

