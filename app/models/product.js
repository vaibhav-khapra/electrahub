// productModel.js

import mongoose from 'mongoose';

// Define the Product Schema
// This schema defines the structure, data types, and validation rules
// for product documents stored in your MongoDB collection.
const productSchema = new mongoose.Schema({
    // Product Name: Required string
    name: {
        type: String,
        required: [true, 'Product name is required'], // 'true' for boolean required, or an array with message
        trim: true, // Removes whitespace from both ends of a string
        minlength: [3, 'Product name must be at least 3 characters long'],
        maxlength: [200, 'Product name cannot exceed 100 characters'],
    },
    // Brand: String, optional
    brand: {
        type: String,
        trim: true,
        maxlength: [50, 'Brand name cannot exceed 50 characters'],
    },
    // Price: Required number, must be positive
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'], // Minimum value
    },
    // Rating: Number, between 0 and 5, optional
    rating: {
        type: Number,
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot exceed 5'],
        default: 0, // Default value if not provided
    },
    // Reviews: Number, integer, non-negative, optional
    reviews: {
        type: Number,
        min: [0, 'Number of reviews cannot be negative'],
        default: 0,
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity in stock is required'], 
        min: [0, 'Quantity cannot be negative'],
        default: 0,
    },
    imageUrl: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        trim: true,
        maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    stock: {
        type: Boolean,
        default: function () {
            return this.quantity > 0; 
        }
    },
    date: {
        type: Date,
        default: Date.now,
        required: [true, 'Date is required'] 
    }
}, {
    timestamps: true,
    collection: 'products' 
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
