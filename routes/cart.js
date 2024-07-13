import express from 'express';
import Cart from '../models/cart.model.js';
const router = express.Router();

// GET /api/cart - Obtener todos los productos en el carrito
router.get('/', async (req, res) => {
    try {
        const cart = await Cart.find().populate('products.productId').exec();
        res.json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al obtener el carrito.' });
    }
});

// POST /api/cart/add/:pid - Añadir un producto al carrito
router.post('/add/:pid', async (req, res) => {
    const { pid } = req.params;
    const { quantity } = req.body;

    try {
        let cart = await Cart.findOne();
        if (!cart) {
            cart = new Cart({
                products: [{ productId: pid, quantity }]
            });
            await cart.save();
        } else {
            const productIndex = cart.products.findIndex(p => p.productId.toString() === pid);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ productId: pid, quantity });
            }
            await cart.save();
        }
        res.status(201).json({ message: 'Producto agregado al carrito' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al agregar el producto al carrito.' });
    }
});

// POST /api/cart/delete/:pid - Quitar un producto del carrito
router.post('/delete/:pid', async (req, res) => {
    const { pid } = req.params;

    try {
        const cart = await Cart.findOne();
        if (!cart) {
            res.status(404).json({ message: 'No hay productos en el carrito.' });
            return;
        }

        const updatedProducts = cart.products.filter(p => p.productId.toString() !== pid);
        cart.products = updatedProducts;
        await cart.save();

        res.json({ message: 'Producto eliminado del carrito' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Error al eliminar el producto del carrito.' });
    }
});

export default router;
