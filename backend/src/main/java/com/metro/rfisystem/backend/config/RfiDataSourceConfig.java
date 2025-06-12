package com.metro.rfisystem.backend.config;

import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import jakarta.persistence.EntityManagerFactory;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
    basePackages = "com.metro.rfisystem.backend.repository.rfi", 
    entityManagerFactoryRef = "rfiEntityManagerFactory",
    transactionManagerRef = "rfiTransactionManager"
)
public class RfiDataSourceConfig {

    @Primary
    @Bean(name = "rfiDataSource")
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    @Primary
    @Bean(name = "rfiEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
        EntityManagerFactoryBuilder builder,
        @Qualifier("rfiDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.metro.rfisystem.backend.model.rfi") 
                .persistenceUnit("rfiPU")
                .build();
    }
    

    @Primary
    @Bean(name = "rfiTransactionManager")
    public PlatformTransactionManager transactionManager(
        @Qualifier("rfiEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
