// app/models/Cart.js
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true },
    productName: String,
    productPrice: Number,
    productImage: String,
    addedAt: { type: Date, default: Date.now },
});

const cartSchema = new mongoose.Schema({
    // THIS MUST BE 'String'
    userId: { type: String, required: true, unique: true },
    items: [itemSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);
