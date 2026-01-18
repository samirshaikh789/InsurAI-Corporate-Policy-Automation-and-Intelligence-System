package com.insurai.insurai_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final EmployeeJwtAuthenticationFilter employeeJwtAuthenticationFilter;
    private final AgentJwtAuthenticationFilter agentJwtAuthenticationFilter;
    private final HrJwtAuthenticationFilter hrJwtAuthenticationFilter;

    public SecurityConfig(EmployeeJwtAuthenticationFilter employeeJwtAuthenticationFilter,
                          AgentJwtAuthenticationFilter agentJwtAuthenticationFilter,
                          HrJwtAuthenticationFilter hrJwtAuthenticationFilter) {
        this.employeeJwtAuthenticationFilter = employeeJwtAuthenticationFilter;
        this.agentJwtAuthenticationFilter = agentJwtAuthenticationFilter;
        this.hrJwtAuthenticationFilter = hrJwtAuthenticationFilter;
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
                .requestMatchers("/notifications/**").hasAnyRole("HR", "ADMIN")
                .requestMatchers("/notifications/*/read").hasAnyAuthority("ROLE_EMPLOYEE", "ROLE_HR", "ROLE_ADMIN")

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

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Password Encoder Bean - Required for password hashing
     * Uses BCrypt algorithm for secure password storage
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}