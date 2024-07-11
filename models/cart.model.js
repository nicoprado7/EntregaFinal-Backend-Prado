import mongoose from 'mongoose';

const { Schema } = mongoose;

const cartSchema = new Schema({
    products: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true }
    }]
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
