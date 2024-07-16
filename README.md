# Entrega final - Curso de Backend
Este proyecto es un sistema de E-Commerce desarrollado con Node.js , Socket.IO, MongoDB, Express y Handlebars diseñado para gestionar productos en tiempo real mediante una interfaz web, permitiendo agregarlos a un carrito de compras.

# Autor: Nicolás Prado

## Características
-  Gestión de Productos: Permite agregar y eliminar productos dinámicamente.
- Interfaz en Tiempo Real: Utiliza Socket.IO para actualizar la lista de productos en tiempo real.
- Persistencia de Datos: Los productos se guardan y se envian al servidor de MongoDB

## Tecnologías empleadas
- Node.js
- Express.js
- Handlebars
- MongoDB (Mongoose)
- Socket.IO

## Estructura del Proyecto
- server.js: Configuración del servidor Express y Socket.IO.
- views/: Contiene las vistas Handlebars para la interfaz de usuario (home.handlebars,
- realTimeProducts.handlebars).
- public/: Archivos estáticos (CSS, imágenes).
- config/: Configuraciones separadas para Handlebars, rutas y Socket.IO.
- Routes: Configuraciones para las rutas cart y products.
- Models: Contiene los modelos del cart y product.

## Uso
- Accede a la página principal para ver todos los productos en http://localhost:8080/
- La página del formulario para crear productos está disponible en http://localhost:8080/realtimeproducts
- Desde la vista home, podras eliminar productos creados, o añadirlos al carrito.
- Desde el carrito podras eliminarlos o finalizar la compra

## Rutas principales
- GET /: Muestra la lista de productos.
- GET /realtimeproducts: Muestra la vista para agregar productos en tiempo real.
- GET /cart: Muestra el carrito de compras.
- POST /product/add: Agrega un nuevo producto.
- POST /cart/add/:id: Agrega un producto al carrito.
- DELETE /cart/delete/:id: Elimina un producto del carrito.
- POST /cart/clear: Vacía el carrito.
- POST /cart/checkout: Realiza la compra de los productos en el carrito.
- DELETE /api/products/:id: Elimina un producto por su ID.


## Instalación
- Clona el repositorio: git clone https://github.com/nicoprado7/PreEntrega2-BACKEND-Prado.git
- Instala las dependencias: npm install / npm install express  / npm install handlebars / npm install express handlebars / npm install mongoose / npm install mongoose-paginate-v2 / npm install  socket.io
- Inicia el servidor: npm run dev


## VIDEO
https://github.com/user-attachments/assets/8d9b6a65-7160-40e2-b443-34acc6a9deef



