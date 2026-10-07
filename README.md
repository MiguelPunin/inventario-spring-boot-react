# Mis productos — CRUD y login con Spring Boot y React

Aplicación web para administrar un inventario sencillo. Permite iniciar sesión y crear, consultar, editar y eliminar productos con nombre y precio.

El objetivo del proyecto es aplicar la separación de responsabilidades del patrón Modelo-Vista-Controlador (MVC) y proteger las operaciones del inventario mediante autenticación.

**Estado:** versión académica con login, CRUD y diseño adaptable implementados. Está preparada para ejecutarse localmente.

## Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Requisitos](#requisitos)
- [Acceso y ejecución](#acceso-y-ejecución)
- [Uso y demostración](#uso-y-demostración)
- [Organización del proyecto](#organización-del-proyecto)
- [Patrón MVC](#patrón-mvc)
- [Rutas del CRUD](#rutas-del-crud)
- [Autenticación y datos](#autenticación-y-datos)
- [Problemas frecuentes](#problemas-frecuentes)
- [Alcance](#alcance)
- [Autor](#autor)
- [Referencias](#referencias)

## Funcionalidades

- Inicio de sesión con usuario y contraseña.
- Opción para mostrar u ocultar la contraseña en el formulario.
- Creación de productos con nombre y precio.
- Consulta de productos en una tabla.
- Edición y eliminación de productos, con confirmación antes de eliminar.
- Validación de los datos en el formulario y en el servidor.
- Bloqueo de las rutas del inventario cuando no existe una sesión autenticada.
- Cierre de sesión y almacenamiento de productos en una base de datos local.
- Interfaz que ajusta sus espacios para pantallas pequeñas.

## Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
|---|---|
| Java | Lenguaje del servidor; el proyecto tiene configurada la versión 17 como base. |
| Spring Boot 3.5.0 y Spring MVC | Inicio de la aplicación y controladores de la API REST. |
| Spring Security | Autenticación, sesiones, protección de rutas y hash BCrypt. |
| Spring Data JPA | Acceso a la base de datos mediante un repositorio. |
| H2 | Base de datos guardada en archivos locales. |
| React 19.1.0 | Formularios, tabla de productos y estado de la interfaz. |
| CSS | Colores, distribución de elementos y adaptación a distintos tamaños de pantalla. |
| esbuild 0.25.5 | Compilación de los archivos de React y CSS. |
| Maven y npm | Administración de dependencias y comandos de compilación. |

## Requisitos

- JDK 17 o 21.
- Maven 3.6.3 o superior.
- Node.js 20 o superior, con npm.
- Un navegador web y conexión a Internet para descargar las dependencias iniciales.

Java, Maven y Node.js deben estar disponibles en el `PATH`. Para comprobarlo, ejecutar:

```sh
java -version
mvn -version
node -v
npm -v
```

No es necesario instalar MySQL ni iniciar una base de datos por separado: H2 se ejecuta dentro de la aplicación.

## Acceso y ejecución

1. En este repositorio de GitHub, seleccionar **Code → Download ZIP** y extraer el archivo. También se puede clonar usando la dirección que aparece en **Code**.
2. Abrir la carpeta extraída en VS Code o en el editor de preferencia.
3. Abrir una terminal en la carpeta que contiene `pom.xml` y `package.json`.
4. Instalar las dependencias y compilar la interfaz:

```sh
npm ci
npm run build
```

5. Iniciar el servidor:

```sh
mvn spring-boot:run
```

En PowerShell se puede usar `npm.cmd` en lugar de `npm` para evitar el bloqueo del archivo `npm.ps1`.

Cuando aparezca **Started Aplicacion**, abrir [http://localhost:8080](http://localhost:8080).

React y la API se sirven desde Spring Boot en el mismo puerto. No se necesita ejecutar `npm start` ni levantar otro servidor para la interfaz.

### Usuario de demostración

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `clave123` |

Mantener la terminal abierta mientras se utiliza la aplicación. Para detener el servidor, presionar **Ctrl + C**.

### Ejecutar como archivo JAR

Después de compilar la interfaz, también se puede generar y ejecutar el archivo JAR:

```sh
mvn package
java -jar target/productos-1.0.0.jar
```

Utilizar una sola forma de ejecución a la vez. Antes de volver a generar el JAR, detener la aplicación si se está ejecutando desde ese archivo.

Después de modificar React o CSS, detener el servidor, ejecutar `npm run build` y volver a iniciarlo. Si se utiliza el JAR, ejecutar también `mvn package` antes de arrancarlo.

## Uso y demostración

[Ver el video: CRUD y Login con Spring Boot y React | Patrón MVC](https://youtu.be/qddcOKMe8PQ)

La pantalla inicial muestra el login. Después de autenticarse, se presenta el formulario de productos, la tabla del inventario y el botón para cerrar sesión.

Para comprobar las funciones principales:

1. Sin iniciar sesión, abrir [la ruta de productos](http://localhost:8080/api/productos). Debe responder con **HTTP 401**, sin mostrar datos.
2. Regresar a la página principal e ingresar una contraseña incorrecta. Debe aparecer un mensaje de error.
3. Iniciar sesión con las credenciales de demostración.
4. Crear un producto llamado **Cuaderno** con precio **2.50** y comprobar que aparece en la tabla.
5. Pulsar **Editar**, cambiar el precio a **3.00** y guardar.
6. Recargar la página y comprobar que el producto sigue disponible.
7. Pulsar **Eliminar** y confirmar la operación.
8. Cerrar sesión e intentar acceder nuevamente a `/api/productos`. Debe responder con **HTTP 401**.

Estas comprobaciones son manuales; esta versión no incluye una suite de pruebas automatizadas.

## Organización del proyecto

```text
frontend/
  App.jsx                     Pantallas y comunicación con la API
  estilos.css                 Estilos de la interfaz
src/main/java/com/ejemplo/productos/
  Aplicacion.java             Punto de inicio del servidor
  configuracion/
    SeguridadConfig.java     Usuario, autenticación y permisos
  controlador/
    ProductoControlador.java Operaciones del CRUD
    SesionControlador.java   Consulta de sesión y token CSRF
  modelo/
    Producto.java            Datos y validaciones del producto
  repositorio/
    ProductoRepositorio.java Acceso a la base de datos
src/main/resources/
  application.properties     Configuración del servidor y de H2
  static/
    index.html               Página donde se carga React
pom.xml                      Dependencias y compilación de Java
package.json                 Dependencias y comandos del frontend
package-lock.json            Versiones de las dependencias de npm
.gitignore                   Archivos excluidos del repositorio
README.md                    Documentación del proyecto
```

`npm run build` genera `app.js` y `app.css` dentro de `src/main/resources/static/`. Maven genera la carpeta `target/`. Estos archivos, `node_modules/` y la base de datos `datos/` están excluidos de Git.

## Patrón MVC

| Parte | Archivo principal | Responsabilidad |
|---|---|---|
| Modelo | `Producto.java` | Representa un producto con id, nombre y precio. |
| Vista | `App.jsx` y `estilos.css` | Muestra los formularios, los mensajes y la tabla. |
| Controlador | `ProductoControlador.java` | Recibe peticiones HTTP y coordina las operaciones. |

React es la biblioteca utilizada para construir la vista. Spring MVC proporciona los controladores REST; el intercambio de datos se realiza mediante JSON.

Al guardar un producto, React envía una petición al controlador. El controlador valida los datos y utiliza `ProductoRepositorio` para guardarlos en H2. Después, React consulta la lista actualizada y la muestra.

## Rutas del CRUD

Todas las rutas siguientes requieren autenticación:

| Método | Ruta | Operación |
|---|---|---|
| GET | `/api/productos` | Consultar la lista de productos. |
| POST | `/api/productos` | Crear un producto. |
| PUT | `/api/productos/{id}` | Actualizar un producto existente. |
| DELETE | `/api/productos/{id}` | Eliminar un producto existente. |

El id se genera automáticamente. El nombre es obligatorio y admite hasta 80 caracteres. El precio debe ser de al menos 0.01 y admite hasta ocho dígitos enteros y dos decimales. Si se intenta modificar o eliminar un producto inexistente, el servidor responde con HTTP 404.

## Autenticación y datos

Spring Security procesa el login en `/api/login`. Si las credenciales son correctas, crea una sesión que el navegador identifica mediante una cookie. La ruta `/api/sesion` permite consultar el usuario autenticado. Al enviar la solicitud a `/api/logout`, la sesión se invalida.

La contraseña de demostración se define en `SeguridadConfig.java` y se transforma con BCrypt al crear el usuario. Spring Security conserva el hash en memoria. BCrypt es un mecanismo de hash: la contraseña se verifica, no se descifra. El botón del ojo únicamente cambia su visibilidad en pantalla.

La aplicación mantiene habilitada la protección CSRF. React obtiene un token desde `/api/csrf` y lo incluye en las peticiones que crean, modifican o eliminan datos, así como en el login y el cierre de sesión.

Los productos se guardan en `datos/`, relativa a la carpeta desde la que se ejecuta el servidor. Permanecen después de reiniciar la aplicación. Eliminar esta carpeta borra los productos almacenados.

## Problemas frecuentes

| Problema | Solución |
|---|---|
| `java`, `mvn` o `npm` no se reconoce | Revisar la instalación y el `PATH`; abrir una terminal nueva. |
| PowerShell bloquea `npm.ps1` | Utilizar `npm.cmd ci` y `npm.cmd run build`. |
| El navegador indica conexión rechazada | Comprobar que el servidor sigue ejecutándose y que apareció `Started Aplicacion`. |
| El puerto 8080 está ocupado | Detener la otra instancia o configurar `server.port=8081` en `application.properties` y acceder al nuevo puerto. |
| Maven no puede reemplazar el JAR | Detener la aplicación con Ctrl + C antes de ejecutar `mvn package`. |
| Los cambios visuales no aparecen | Compilar React, volver a generar el JAR si corresponde, reiniciar el servidor y recargar con Ctrl + F5. |
| `/api/productos` responde 401 | Iniciar sesión en el mismo navegador; es la respuesta esperada cuando no hay autenticación. |

## Alcance

Proyecto académico con un único usuario de demostración. No incluye registro de usuarios, recuperación de contraseñas ni administración de roles. La configuración está orientada a una demostración local.

## Autor

[MiguelPunin](https://github.com/MiguelPunin).

## Referencias

- [Guía de Alura para escribir un README](https://www.aluracursos.com/blog/como-escribir-un-readme-increible-en-tu-github).
- [Introducción a Spring Security](https://spring.io/guides/gs/securing-web).
- [Almacenamiento de contraseñas en Spring Security](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html).
- [Documentación de React](https://react.dev/learn).
