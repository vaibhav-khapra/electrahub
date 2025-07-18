// app/models/Order.js
import mongoose from 'mongoose';

// Schema for individual items within an order
const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product' // Reference to the Product model
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productImage: { type: String },
});

// Schema for shipping details within an order
const shippingDetailsSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true }, // Optional
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
});

// Schema for payment details (Razorpay specifics)
const paymentDetailsSchema = new mongoose.Schema({
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
    razorpaySignature: { type: String, required: true },
    method: { type: String, default: 'Razorpay' },
    // You can add more fields if needed, like currency, amount paid, etc.
    // although totalPrice already covers amount.
});

// Main Order Schema
const orderSchema = new mongoose.Schema({
    userId: {
        type: String, // Assuming userId is a string (e.g., mobile number) as per your Cart model
        required: true,
        index: true // Index for faster lookup by user
    },
    orderId: { // A custom order ID for display/tracking
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: function (v) {
                return v && v.length > 0; // Ensure there's at least one item
            },
            message: 'Order must contain at least one item'
        }
    },
    shippingDetails: {
        type: shippingDetailsSchema,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, 'Total price cannot be negative']
    },
    orderDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Paid'], // Added 'Paid' status
        default: 'Pending'
    },
    paymentDetails: { // New field for payment gateway details
        type: paymentDetailsSchema,
        required: false // It might not be required for all order types (e.g., COD), but for Razorpay it will be present.
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps automatically
    collection: 'orders' // Explicitly set collection name
});

// Export the Order model
export default mongoose.models.Order || mongoose.model('Order', orderSchema);