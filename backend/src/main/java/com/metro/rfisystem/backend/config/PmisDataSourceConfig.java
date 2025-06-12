package com.metro.rfisystem.backend.config;

import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.zaxxer.hikari.HikariDataSource;

import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.metro.rfisystem.backend.repository.pmis", 
    entityManagerFactoryRef = "pmisEntityManagerFactory",
    transactionManagerRef = "pmisTransactionManager"
)
public class PmisDataSourceConfig {

	@Bean(name = "pmisDataSource")
	public DataSource dataSource() {
	    HikariDataSource ds = new HikariDataSource();
	    ds.setJdbcUrl("jdbc:mysql://syntrack-product.cx7j14shahw3.ap-south-1.rds.amazonaws.com:3306/pmis");
	    ds.setUsername("synTrack");
	    ds.setPassword("Ke$sie#9!0");
	    ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
	    return ds;
	}


    @Bean(name = "pmisEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
        EntityManagerFactoryBuilder builder,
        @Qualifier("pmisDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.metro.rfisystem.backend.model.pmis") 
                .persistenceUnit("pmisPU")
                .build();
    }

    @Bean(name = "pmisTransactionManager")
    public PlatformTransactionManager transactionManager(
        @Qualifier("pmisEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
    

}
