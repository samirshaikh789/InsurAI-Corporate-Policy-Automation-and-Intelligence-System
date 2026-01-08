package com.insurai.insurai_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final EmployeeJwtAuthenticationFilter employeeJwtAuthenticationFilter;
    private final AgentJwtAuthenticationFilter agentJwtAuthenticationFilter;
    private final HrJwtAuthenticationFilter hrJwtAuthenticationFilter;
    private final AdminJwtAuthenticationFilter adminJwtAuthenticationFilter;

    public SecurityConfig(EmployeeJwtAuthenticationFilter employeeJwtAuthenticationFilter,
                          AgentJwtAuthenticationFilter agentJwtAuthenticationFilter,
                          HrJwtAuthenticationFilter hrJwtAuthenticationFilter,
                          AdminJwtAuthenticationFilter adminJwtAuthenticationFilter) {
        this.employeeJwtAuthenticationFilter = employeeJwtAuthenticationFilter;
        this.agentJwtAuthenticationFilter = agentJwtAuthenticationFilter;
        this.hrJwtAuthenticationFilter = hrJwtAuthenticationFilter;
        this.adminJwtAuthenticationFilter = adminJwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {}) // Keep global CORS
            .authorizeHttpRequests(auth -> auth
                // Employee claim endpoints
                .requestMatchers("/employee/claims/**").hasRole("EMPLOYEE")
                .requestMatchers("/employee/queries/**").hasRole("EMPLOYEE")
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/hr/claims").hasAnyRole("HR")
                .requestMatchers("/admin/claims").hasAnyRole("ADMIN")
                .requestMatchers("/hr/claims/fraud").hasRole("HR")
                .requestMatchers("/admin/claims/fraud").hasRole("ADMIN")
                // Notifications endpoints
               .requestMatchers("/notifications/user/**").hasAnyAuthority("ROLE_EMPLOYEE", "ROLE_HR", "ROLE_ADMIN")
.requestMatchers("/notifications/**").hasAnyRole("HR", "ADMIN") // delete endpoints
.requestMatchers("/notifications/*/read").hasAnyAuthority("ROLE_EMPLOYEE", "ROLE_HR", "ROLE_ADMIN") // allow mark as read

    .requestMatchers("/employee/chatbot").hasRole("EMPLOYEE")




                // Public endpoints
                .requestMatchers(
                    "/auth/**",
                    "/auth/forgot-password",
                    "/auth/reset-password/**",
                    "/admin/**",
                    "/admin/policies",
                    "/admin/policies/save",
                    "/agent/**",
                    "/employee/login",
                    "/agent/login",
                    "/employee/register",
                    "/employee/policies",
                    "/hr/login",
                    "/agent/availability/**",
                    "/agent/queries/pending/**",
                    "/employees/**",
                    "/hr/**"
                ).permitAll()

                // Agent endpoints
                .requestMatchers("/agent/queries/respond/**", "/agent/queries/all/**").hasRole("AGENT")

                // Employee endpoints (other than claims/queries)
                .requestMatchers("/employee/**").hasRole("EMPLOYEE")

                // Claim endpoints for HR/Admin
                .requestMatchers(
                    "/claims/approve/**",
                    "/claims/reject/**",
                    "/claims/all"
                ).hasAnyRole("HR", "ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(formLogin -> formLogin.disable());

        // Add JWT filters in order
        http.addFilterBefore(employeeJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(agentJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(hrJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(adminJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // Global CORS configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
