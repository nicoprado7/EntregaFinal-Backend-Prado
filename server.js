import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import configureHandlebars from './config/handlebars.config.js';
import paths from './config/path.config.js';
import configureSocket from './config/socket.config.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
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
configureSocket(io, getProducts, saveProducts);

app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        await Product.findByIdAndDelete(productId).exec();

        let products = getProducts();
        products = products.filter(product => product.id !== productId);
        saveProducts(products);

        io.emit('updateProducts', products);
        res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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

app.post('/cart/delete/:id', (req, res) => {
    const productId = req.params.id;
    cart = cart.filter(item => item._id.toString() !== productId);
    io.emit('updateCart', cart);
    res.status(200).json({ message: 'Producto eliminado del carrito' });
});

// Nueva ruta para vaciar el carrito
app.post('/cart/clear', (req, res) => {
    cart = [];
    io.emit('updateCart', cart);
    res.status(200).json({ message: 'Carrito vaciado' });
});

// Nueva ruta para comprar
app.post('/cart/checkout', (req, res) => {
    // Aquí podrías agregar lógica adicional para procesar el pago
    cart = [];
    io.emit('updateCart', cart);
    res.status(200).json({ message: 'Compra realizada' });
});

app.get('/', async (req, res) => {
    try {
        const products = await Product.find().exec();
        res.render('home', { products });
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/realtimeproducts', (req, res) => {
    const products = getProducts();
    res.render('realTimeProducts', { products });
});

app.get('/cart', (req, res) => {
    res.render('cart', { products: cart });
});

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

    newProduct.save()
    .then(savedProduct => {
        io.emit('updateProducts'); // Emitir evento para actualizar productos
        res.redirect('/');
    })
    .catch(err => {
        console.error('Error al guardar el producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    });
    products.push(newProduct);
    saveProducts(products);
    io.emit('updateProducts', products);
    res.redirect('/');
});

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

server.listen(PORT, HOST, () => {
    console.log(`Ejecutándose en http://${HOST}:${PORT}/`);
    connectDB();
});
