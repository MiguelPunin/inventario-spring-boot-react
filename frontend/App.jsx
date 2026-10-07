import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './estilos.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [productos, setProductos] = useState([]);
  const [id, setId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [ocupado, setOcupado] = useState(false);
  // Cambia entre mostrar y ocultar la contraseña.
  const [mostrarClave, setMostrarClave] = useState(false);

  // Una sola función para comunicarse con Spring Boot.
  async function pedir(url, metodo = 'GET', datos, formulario = false) {
    const opciones = { method: metodo, headers: {} };
    if (metodo !== 'GET') {
      const respuesta = await fetch('/api/csrf');
      if (!respuesta.ok) throw new Error('No se pudo obtener la protección de la sesión.');
      const csrf = await respuesta.json();
      opciones.headers[csrf.headerName] = csrf.token;
    }
    if (datos) {
      opciones.headers['Content-Type'] = formulario
        ? 'application/x-www-form-urlencoded' : 'application/json';
      opciones.body = formulario ? new URLSearchParams(datos) : JSON.stringify(datos);
    }
    const respuesta = await fetch(url, opciones);
    if (respuesta.status === 401) {
      setUsuario(null);
      setProductos([]);
      throw new Error(url === '/api/login' ? 'Usuario o contraseña incorrectos.' : 'Inicia sesión para continuar.');
    }
    if (!respuesta.ok) throw new Error('No se pudo completar la operación. Revisa los datos e inténtalo otra vez.');
    return respuesta.headers.get('content-type')?.includes('application/json') ? respuesta.json() : null;
  }

  async function listar() { setProductos(await pedir('/api/productos')); }
  function limpiar() { setId(null); setNombre(''); setPrecio(''); }

  useEffect(() => {
    async function iniciar() {
      try {
        const sesion = await pedir('/api/sesion');
        setUsuario(sesion.usuario);
        await listar();
      } catch (error) { setMensaje(error.message); }
      finally { setCargando(false); }
    }
    iniciar();
  }, []);

  async function entrar(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setOcupado(true); setMensaje('');
    try {
      await pedir('/api/login', 'POST', { username: datos.get('usuario'), password: datos.get('clave') }, true);
      const sesion = await pedir('/api/sesion');
      setUsuario(sesion.usuario); limpiar(); await listar();
    } catch (error) { setMensaje(error.message); }
    finally { setOcupado(false); }
  }

  async function guardar(evento) {
    evento.preventDefault(); setOcupado(true); setMensaje('');
    try {
      await pedir(id === null ? '/api/productos' : `/api/productos/${id}`, id === null ? 'POST' : 'PUT', { nombre: nombre.trim(), precio: Number(precio) });
      limpiar(); await listar(); setMensaje('Producto guardado.');
    } catch (error) { setMensaje(error.message); }
    finally { setOcupado(false); }
  }

  async function eliminar(producto) {
    if (!window.confirm(`¿Eliminar ${producto.nombre}?`)) return;
    setOcupado(true); setMensaje('');
    try {
      await pedir(`/api/productos/${producto.id}`, 'DELETE');
      if (id === producto.id) limpiar();
      await listar(); setMensaje('Producto eliminado.');
    } catch (error) { setMensaje(error.message); }
    finally { setOcupado(false); }
  }

  async function salir() {
    setOcupado(true);
    try { await pedir('/api/logout', 'POST'); setUsuario(null); setProductos([]); limpiar(); setMensaje('Sesión cerrada.'); }
    catch (error) { setMensaje(error.message); }
    finally { setOcupado(false); }
  }

  if (cargando) return <main>Cargando…</main>;
  // El login tiene una tarjeta pequeña; el inventario usa más espacio.
  return <div className={usuario ? 'pagina pagina-inventario' : 'pagina pagina-login'}>
    <main className={usuario ? 'tarjeta tarjeta-inventario' : 'tarjeta tarjeta-login'}>
    {/* Dibujo de una caja junto al nombre de la aplicación. */}
    <header className="encabezado">
      <svg className="logo" viewBox="0 0 64 64" aria-hidden="true">
        <path fill="#287cff" d="M32 3 59 18 32 34 5 18Z" />
        <path fill="#398cff" d="M5 21 30 36 30 61 5 46Z" />
        <path fill="#54a0ff" d="M34 36 59 21 59 46 34 61Z" />
        <path d="m18 11 27 16v10" fill="none" stroke="white" strokeWidth="3" />
      </svg>
      <div>
        <h1>Mis productos</h1>
        <p className="subtitulo">Inventario</p>
      </div>
      {/* El saludo aparece cuando el usuario inicia sesión. */}
      {usuario && <div className="barra">
        <span>Hola, <strong>{usuario}</strong></span>
        <button className="boton-accion" onClick={salir} disabled={ocupado}>
          <svg className="icono-boton" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 4H4v16h6M9 12h12m-5-5 5 5-5 5" />
          </svg>
          Cerrar sesión
        </button>
      </div>}
    </header>

    {/* Este aviso cambia según lo que pase: error, salida o guardado. */}
    {mensaje && <p role="status" className="mensaje">
      <span className="icono-aviso" aria-hidden="true">i</span>
      {mensaje}
    </p>}

    {!usuario ? <form className="formulario-login" onSubmit={entrar}>
      <h2>Iniciar sesión</h2>

      {/* Nombre del campo y caja para escribir el usuario. */}
      <label htmlFor="usuario">Usuario</label>
      <div className="campo-login">
        <svg className="icono-campo" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="7" r="3.5" />
          <path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" />
        </svg>
        <input
          id="usuario"
          name="usuario"
          placeholder="Ingresa tu usuario"
          autoComplete="username"
          required
        />
      </div>

      {/* El botón del ojo solo cambia la visibilidad de la contraseña. */}
      <label htmlFor="clave">Contraseña</label>
      <div className="campo-login">
        <svg className="icono-campo" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <input
          id="clave"
          name="clave"
          type={mostrarClave ? 'text' : 'password'}
          placeholder="Ingresa tu contraseña"
          autoComplete="current-password"
          required
        />
        <button
          className="boton-ojo"
          type="button"
          onClick={() => setMostrarClave(!mostrarClave)}
          aria-label={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={mostrarClave}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {!mostrarClave && <path d="m3 3 18 18" />}
          </svg>
        </button>
      </div>

      <button className="boton-entrar" type="submit" disabled={ocupado}>
        {ocupado ? 'Entrando...' : 'Entrar'}
      </button>
    </form> : <>
      {/* Cuadro azul para crear o editar un producto. */}
      <form className="formulario-producto" onSubmit={guardar}>
        <h2>{id === null ? 'Nuevo producto' : 'Editar producto'}</h2>

        <label htmlFor="nombre-producto">Nombre</label>
        <div className="campo-producto">
          <svg className="icono-campo" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 3h9l9 9-9 9-9-9Z" />
            <circle cx="8" cy="8" r="1" />
          </svg>
          <input
            id="nombre-producto"
            placeholder="Ingrese el nombre del producto"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            maxLength={80}
            required
          />
        </div>

        <label htmlFor="precio-producto">Precio ($)</label>
        <div className="campo-producto">
          <span className="simbolo-precio" aria-hidden="true">$</span>
          <input
            id="precio-producto"
            type="number"
            placeholder="Ingrese el precio"
            min="0.01"
            max="99999999.99"
            step="0.01"
            value={precio}
            onChange={e => setPrecio(e.target.value)}
            required
          />
        </div>

        <div className="acciones-formulario">
          <button className="boton-accion" type="submit" disabled={ocupado}>
            <svg className="icono-boton" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 3h13l3 3v15H4ZM8 3v6h8V3M8 21v-8h8v8" />
            </svg>
            Guardar
          </button>
          {id !== null && <button
            className="boton-cancelar"
            type="button"
            onClick={limpiar}
            disabled={ocupado}
          >
            Cancelar
          </button>}
        </div>
      </form>

      {/* Cada producto ocupa una fila de la tabla. */}
      <h2>Lista de productos</h2>
      <div className="tabla">
        <table>
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Precio</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 && <tr>
              <td colSpan="3" className="tabla-vacia">Todavía no hay productos.</td>
            </tr>}
            {productos.map(p => <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>${Number(p.precio).toFixed(2)}</td>
              <td>
                <div className="acciones-tabla">
                  <button
                    className="boton-accion"
                    disabled={ocupado}
                    onClick={() => {
                      setId(p.id);
                      setNombre(p.nombre);
                      setPrecio(p.precio);
                      setMensaje('');
                    }}
                  >
                    <svg className="icono-boton" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m4 16-1 5 5-1L21 7l-4-4ZM14 6l4 4M12 21h9" />
                    </svg>
                    Editar
                  </button>
                  <button
                    className="boton-accion boton-eliminar"
                    disabled={ocupado}
                    onClick={() => eliminar(p)}
                  >
                    <svg className="icono-boton" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </>}
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
