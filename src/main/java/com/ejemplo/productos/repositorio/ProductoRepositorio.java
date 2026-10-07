package com.ejemplo.productos.repositorio;

import com.ejemplo.productos.modelo.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

// Spring proporciona guardar, buscar y eliminar sin escribir SQL.
public interface ProductoRepositorio extends JpaRepository<Producto, Long> {}
