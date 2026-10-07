package com.ejemplo.productos.configuracion;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SeguridadConfig {
    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public UserDetailsService usuarios(PasswordEncoder encoder) {
        // Usuario de demostración: en memoria se guarda el hash BCrypt.
        var usuario = User.withUsername("admin")
            .password(encoder.encode("clave123"))
            .roles("USER").build();
        return new InMemoryUserDetailsManager(usuario);
    }

    @Bean
    public SecurityFilterChain seguridad(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(reglas -> reglas
            .requestMatchers("/", "/index.html", "/app.js", "/app.css", "/api/csrf", "/error").permitAll()
            .anyRequest().authenticated())
            .exceptionHandling(errores -> errores
                .authenticationEntryPoint((req, res, ex) -> res.setStatus(401)))
            .formLogin(login -> login
                .loginProcessingUrl("/api/login")
                .successHandler((req, res, auth) -> res.setStatus(200))
                .failureHandler((req, res, ex) -> res.setStatus(401))
                .permitAll())
            .logout(logout -> logout
                .logoutUrl("/api/logout")
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(204)));
        // CSRF permanece habilitado. Spring administra la sesión y su cookie.
        return http.build();
    }
}
