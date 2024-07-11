import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const ProductSchema = new mongoose.Schema({
    title: String,
    description: String,
    code: String,
    price: Number,
    status: { type: Boolean, default: true },
    stock: Number,
    category: String,
    image: [String]
});


ProductSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', ProductSchema);

export default Product;
