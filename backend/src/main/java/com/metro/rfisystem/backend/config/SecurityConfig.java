package com.metro.rfisystem.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

	@Value("${REACT_APP_API_FRONTEND_URL}")
	private String frontendUrl;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
				// enable CORS using your existing bean
				.cors().configurationSource(corsConfigurationSource()).and()
				// disable CSRF for simplicity, needed for external POST requests like eSign
				.csrf().disable()
				// configure URL authorization
				.authorizeHttpRequests(auth -> auth
						// allow eSign callback to be accessed without authentication
						.requestMatchers("/rfiSystem/signedResponse").permitAll()
						.requestMatchers("/rfiSystem/engineerSignedResponse").permitAll()
						// protect your session check endpoint
						.requestMatchers("/api/auth/session").authenticated()
						// allow all other requests
						.anyRequest().permitAll())
				// allow iframe if needed
				.headers().frameOptions().disable().and()
				// form login configuration (or your login method)
				.formLogin();

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(Arrays.asList(frontendUrl, "https://es-staging.cdac.in", "https://syntrackpro.com"));
		config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(Arrays.asList("*"));
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}
}