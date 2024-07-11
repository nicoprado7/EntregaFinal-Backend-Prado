<<<<<<< HEAD
# Segunda entrega - Curso de Backend
Este proyecto es un sistema básico de E-Commerce desarrollado con Node.js y Socket.IO, diseñado para gestionar productos en tiempo real mediante una interfaz web.
# Autor: Nicolás Prado

## Características
-  Gestión de Productos: Permite agregar y eliminar productos dinámicamente.
- Interfaz en Tiempo Real: Utiliza Socket.IO para actualizar la lista de productos en tiempo real.
- Persistencia de Datos: Los productos se guardan y recuperan desde un archivo JSON (products.json).

## Tecnologías empleadas
- Node.js: Entorno de ejecución del servidor.
- Express: Framework web para Node.js.
- Socket.IO: Biblioteca para aplicaciones web en tiempo real.
- Handlebars: Motor de plantillas para renderizar las vistas HTML.
- File System: Utilizado para la persistencia de datos en archivos JSON.

## Estructura del Proyecto
- server.js: Configuración del servidor Express y Socket.IO.
- views/: Contiene las vistas Handlebars para la interfaz de usuario (home.handlebars,
- realTimeProducts.handlebars).
- public/: Archivos estáticos (CSS, imágenes).
- config/: Configuraciones separadas para Handlebars, rutas y Socket.IO.

## Uso
- Accede a la página principal para ver todos los productos en http://localhost:8080/
- La página de productos en tiempo real está disponible en http://localhost:8080/realtimeproducts
- Agrega nuevos productos utilizando el formulario en la página de productos en tiempo real.
- Elimina productos haciendo clic en el botón "Eliminar" en ambas vistas.

## Instalación
- Clona el repositorio: git clone https://github.com/nicoprado7/PreEntrega2-BACKEND-Prado.git
- Instala las dependencias: npm install / npm install express  / npm install handlebars /
npm install socket.io
- Inicia el servidor: npm run start
 
=======
# EntregaFinal-Backend-Prado
>>>>>>> 9f301f1e049f1b7f67a8b4260d50a8ddf1c21718
