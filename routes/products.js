// routes/products.js
import express from 'express';
const router = express.Router();
import Product from '../models/product.model.js';
import multer from 'multer';
import path from 'path';

// Configuración de multer para la subida de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Render HTML with Handlebars
router.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort === 'desc' ? -1 : 1;
    const query = req.query.query || '';

    try {
        const filter = {};
        if (query) {
            filter.$or = [
                { category: query },
                { availability: query }
            ];
        }

        const totalProducts = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort({ price: sort })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalPages = Math.ceil(totalProducts / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.render('home', {
            products,
            data: {
                totalPages,
                hasPrevPage,
                hasNextPage,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
                page,
                limit,
                sort: req.query.sort || '',
                query,
                totalDocs: totalProducts
            }
        });
    } catch (err) {
        console.error('Error al obtener los productos:', err);
        res.status(500).send('Error al cargar la página de productos');
    }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await Product.findById(pid);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al obtener el producto.' });
    }
});

// POST /api/products - Crear un nuevo producto
router.post('/', upload.single('image'), async (req, res) => {
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
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(pid, {
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        }, { new: true });

        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al actualizar el producto.' });
    }
});

// DELETE /api/products/:pid - Eliminar un producto
router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;

    try {
        const deletedProduct = await Product.findByIdAndDelete(pid);
        if (deletedProduct) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al eliminar el producto.' });
    }
});

export default router;
