const configureSocket = (io, getProducts, saveProducts) => {
    io.on('connection', (socket) => {
        console.log('New WebSocket connection');
        // Enviar la lista de productos al cliente
        socket.emit('updateProducts', getProducts());
        // Escuchar el evento para agregar un producto
        socket.on('addProduct', (productData) => {
            const products = getProducts();
            const newProduct = { id: products.length + 1, ...productData, status: true, thumbnails: ["imagen"] };
            products.push(newProduct);
            saveProducts(products);
        // Emitir la lista actualizada de productos a todos los clientes conectados
            io.emit('updateProducts', products);
        });
        // Escuchar el evento para eliminar un producto
        socket.on('deleteProduct', (productId) => {
            let products = getProducts();
            products = products.filter(product => product.id !== productId);
            saveProducts(products);
        // Emitir la lista actualizada de productos a todos los clientes conectados
            io.emit('updateProducts', products);
        });
    });
};

export default configureSocket;
