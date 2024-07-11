const configureSocket = (io, getProducts, saveProducts) => {
    io.on('connection', (socket) => {
        console.log('New WebSocket connection');

        socket.emit('updateProducts', getProducts());

        socket.on('addProduct', (productData) => {
            const products = getProducts();
            const newProduct = { id: products.length + 1, ...productData, status: true, thumbnails: ["imagen"] };
            products.push(newProduct);
            saveProducts(products);
            io.emit('updateProducts', products);
        });

        socket.on('deleteProduct', (productId) => {
            let products = getProducts();
            products = products.filter(product => product.id !== productId);
            saveProducts(products);
            io.emit('updateProducts', products);
        });
    });
};

export default configureSocket;
