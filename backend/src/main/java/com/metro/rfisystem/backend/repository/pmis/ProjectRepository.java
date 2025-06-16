package com.metro.rfisystem.backend.repository.pmis;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.metro.rfisystem.backend.model.pmis.Project;

public interface ProjectRepository extends JpaRepository<Project, String>{
	
	  @Query(value = "SELECT \r\n"
	  		+ "    wr.project_id_fk,\r\n"
	  		+ "    p.project_id,\r\n"
	  		+ "    p.project_name\r\n"
	  		+ "FROM \r\n"
	  		+ "    work wr\r\n"
	  		+ "LEFT OUTER JOIN \r\n"
	  		+ "    project p ON wr.project_id_fk = p.project_id\r\n"
	  		+ "WHERE \r\n"
	  		+ "    wr.project_id_fk IS NOT NULL \r\n"
	  		+ "    AND wr.work_id IN (\r\n"
	  		+ "        SELECT \r\n"
	  		+ "            c.work_id_fk\r\n"
	  		+ "        FROM \r\n"
	  		+ "            contract c\r\n"
	  		+ "        LEFT OUTER JOIN \r\n"
	  		+ "            work w ON c.work_id_fk = w.work_id\r\n"
	  		+ "        WHERE \r\n"
	  		+ "            c.contract_id IN (\r\n"
	  		+ "                SELECT \r\n"
	  		+ "                    scv.contract_id_fk \r\n"
	  		+ "                FROM \r\n"
	  		+ "                    activities scv \r\n"
	  		+ "                WHERE \r\n"
	  		+ "                    scv.contract_id_fk IS NOT NULL \r\n"
	  		+ "                GROUP BY \r\n"
	  		+ "                    scv.contract_id_fk\r\n"
	  		+ "            )\r\n"
	  		+ "        GROUP BY \r\n"
	  		+ "            c.work_id_fk\r\n"
	  		+ "    )\r\n"
	  		+ "GROUP BY \r\n"
	  		+ "    wr.project_id_fk, \r\n"
	  		+ "    p.project_id, \r\n"
	  		+ "    p.project_name\r\n"
	  		+ "ORDER BY \r\n"
	  		+ "    wr.project_id_fk ASC;\r\n"
	  		+ "", nativeQuery = true)
	    List<String> findDistinctProjectNames();
	  
	  

}
