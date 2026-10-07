package com.ejemplo.productos.controlador;

import com.ejemplo.productos.modelo.Producto;
import com.ejemplo.productos.repositorio.ProductoRepositorio;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoControlador {
    private final ProductoRepositorio repositorio;

    public ProductoControlador(ProductoRepositorio repositorio) {
        this.repositorio = repositorio;
    }

    @GetMapping
    public List<Producto> listar() { return repositorio.findAll(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Producto crear(@Valid @RequestBody Producto datos) {
        Producto nuevo = new Producto();
        nuevo.setNombre(datos.getNombre().trim());
        nuevo.setPrecio(datos.getPrecio());
        return repositorio.save(nuevo);
    }

    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @Valid @RequestBody Producto datos) {
        Producto producto = buscar(id);
        producto.setNombre(datos.getNombre().trim());
        producto.setPrecio(datos.getPrecio());
        return repositorio.save(producto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) { repositorio.delete(buscar(id)); }


    private Producto buscar(Long id) {
        return repositorio.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }
}
