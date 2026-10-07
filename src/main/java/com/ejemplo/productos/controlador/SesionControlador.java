package com.ejemplo.productos.controlador;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;

@RestController
public class SesionControlador {
    @GetMapping("/api/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
    }

    @GetMapping("/api/sesion")
    public Map<String, String> sesion(Principal usuario) {
        return Map.of("usuario", usuario.getName());
    }
}
