// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import configureHandlebars from './config/handlebars.config.js';
import paths from './config/path.config.js';
import { connectDB } from './config/mongoose.config.js';
import Product from './models/product.model.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de multer para el manejo de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const PORT = 8080;
const HOST = 'localhost';

app.use(express.static(paths.publicPath));  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let cart = [];

const getProducts = () => {
    try {
        const data = fs.readFileSync(paths.productsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error al leer productos:', err);
        return [];
    }
};

const saveProducts = (products) => {
    try {
        fs.writeFileSync(paths.productsFilePath, JSON.stringify(products, null, 2));
    } catch (err) {
        console.error('Error al guardar productos:', err);
    }
};

configureHandlebars(app);

// Socket.IO configuration
io.on('connection', (socket) => {


    // Emitir lista de productos al cliente al conectar
    socket.emit('updateProducts', getProducts());

    socket.on('disconnect', () => {

    });

    // Emitir evento 'updateProducts' cuando se actualice la lista de productos
    socket.on('addProduct', () => {
        io.emit('updateProducts', getProducts());
    });

    socket.on('deleteProduct', () => {
        io.emit('updateProducts', getProducts());
    });

    socket.on('addToCart', (productId) => {
        const product = cart.find(item => item._id === productId);
        if (product) {
            product.quantity++;
        } else {
            cart.push({ _id: productId, quantity: 1 });
        }
        io.emit('updateCart', cart);
    });

    socket.on('removeFromCart', (productId) => {
        cart = cart.filter(item => item._id !== productId);
        io.emit('updateCart', cart);
    });

    socket.on('clearCart', () => {
        cart = [];
        io.emit('updateCart', cart);
    });
});

// DELETE /api/products/:id - Eliminar un producto
app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        await Product.findByIdAndDelete(productId).exec();

        // Emitir evento de actualización de productos eliminados
        io.emit('deleteProduct', productId);

        res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/products - Crear un nuevo producto
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { title, description, price, code, stock, category } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '';

        const newProduct = new Product({
            title,
            description,
            price,
            code,
            stock,
            category,
            image
        });

        const savedProduct = await newProduct.save();

        io.emit('updateProducts', await Product.find());
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/products/:id - Actualizar un producto
app.put('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const { title, description, price, code, stock, category } = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(productId, {
            title,
            description,
            price,
            code,
            stock,
            category
        }, { new: true });

        io.emit('updateProducts', await Product.find());
        res.json(updatedProduct);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /cart/add/:id - Añadir producto al carrito
app.post('/cart/add/:id', async (req, res) => {
    const productId = req.params.id;
    const { quantity } = req.body;

    try {
        const productToAdd = await Product.findById(productId).exec();

        if (productToAdd) {
            const existingProductIndex = cart.findIndex(item => item._id.toString() === productId);
            if (existingProductIndex !== -1) {
                cart[existingProductIndex].quantity += quantity;
            } else {
                cart.push({ ...productToAdd.toObject(), quantity });
            }
            io.emit('updateCart', cart);
            res.status(200).json({ message: 'Producto agregado al carrito' });
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (err) {
        console.error('Error al agregar producto al carrito:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /cart/delete/:id - Eliminar producto del carrito
app.delete('/cart/delete/:id', (req, res) => {
    const productId = req.params.id;
    cart = cart.filter(item => item._id.toString() !== productId);

    // Emitir evento de actualización del carrito
    io.emit('updateCart', cart);

    res.status(200).json({ message: 'Producto eliminado del carrito' });
});

// POST /cart/clear - Vaciar carrito
app.post('/cart/clear', (req, res) => {
    cart = [];
    io.emit('updateCart', cart);
    res.status(200).json({ message: 'Carrito vaciado' });
});

// GET / - Página principal
app.get('/', async (req, res) => {
    try {
        const products = await Product.find().exec();
        res.render('home', { products });
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /realtimeproducts - Vista de productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
    const products = getProducts();
    res.render('realTimeProducts', { products });
});

// GET /cart - Vista del carrito de compras
app.get('/cart', (req, res) => {
    res.render('cart', { products: cart });
});

// POST /product/add - Añadir producto
app.post('/product/add', upload.single('image'), (req, res) => {
    const { title, description, price, code, stock, category } = req.body;
    const image = `/uploads/${req.file.filename}`;
    let products = getProducts();
    const newProduct = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        title,
        description,
        price: parseFloat(price),
        code,
        stock: parseInt(stock),
        category,
        image
    };

    products.push(newProduct);
    saveProducts(products);

    io.emit('updateProducts', products);
    res.redirect('/');
});

// Rutas API para productos y carrito
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

server.listen(PORT, HOST, () => {
    console.log(`Servidor ejecutándose en http://${HOST}:${PORT}/realtimeproducts`);
    connectDB();
});

export { server, io };
