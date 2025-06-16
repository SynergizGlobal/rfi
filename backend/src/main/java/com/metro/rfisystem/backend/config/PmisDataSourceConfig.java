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
 
import java.util.HashMap;
import java.util.Map;
 
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
        ds.setJdbcUrl("jdbc:sqlserver://203.153.40.44:1433;databaseName=pmis;encrypt=false;");
        ds.setUsername("Synergiz");
        ds.setPassword("$y^7r@(k1$pm1$");
        ds.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        return ds;
    }
 
    @Bean(name = "pmisEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("pmisDataSource") DataSource dataSource) {
 
        Map<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", "none"); // 💡 Disable schema update
 
        return builder
                .dataSource(dataSource)
                .packages("com.metro.rfisystem.backend.model.pmis")
                .persistenceUnit("pmisPU")
                .properties(properties) // ✅ Apply properties here
                .build();
    }
 
    @Bean(name = "pmisTransactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("pmisEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
 
 