// app/api/verify-payment/route.js
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose'; // Needed for database operations
import Product from '@/app/models/product'; // Adjust path if necessary
import Cart from '@/app/models/Cart';     // Adjust path if necessary
import Order from '@/app/models/Order';   // Adjust path if necessary
import connectToDatabase from '@/app/conn/db'; // Adjust path if necessary

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
    // Ensure database connection
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ message: "Failed to connect to the database." }, { status: 500 });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, cartItems, shippingDetails, totalPrice } = await req.json();

        // --- 1. Verify the payment signature ---
        // This is crucial for security to ensure the payment was not tampered with.
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpay_signature) {
            console.error('Payment verification failed: Invalid signature.');
            return NextResponse.json({ success: false, message: 'Payment verification failed: Invalid signature.' }, { status: 400 });
        }

        // --- 2. If signature is valid, proceed with your internal order creation/update ---
        // This is the logic moved from your previous /api/orders/route.js

        // Basic Validation (can be more robust if needed)
        if (!userId || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !shippingDetails || totalPrice === undefined) {
            console.error('Missing or invalid order data received after payment verification.');
            return NextResponse.json({ success: false, message: 'Payment verified but missing order details.' }, { status: 400 });
        }

        let internalOrderId;
        try {
            // Start a session for transaction (optional but recommended for atomicity)
            // Note: Transactions are only supported on replica sets for MongoDB.
            // If you're using a standalone MongoDB, you might need to adjust.
            // For simplicity, we'll proceed without explicit transactions here,
            // but for production, consider them for critical operations.

            // Create and Store the New Order
            const newOrder = new Order({
                userId,
                orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Generate a unique order ID
                items: cartItems, // Store the items from the cart
                shippingDetails,
                totalPrice,
                orderDate: new Date(),
                status: 'Paid', // Set status to 'Paid' since payment is verified
                paymentDetails: { // Store Razorpay payment details
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    method: 'Razorpay',
                }
            });

            // Update product quantities (decrement stock)
            for (const item of cartItems) {
                const product = await Product.findById(item.productId);
                if (!product || product.quantity < item.quantity) {
                    // This scenario should ideally be prevented earlier (e.g., in cart update)
                    // but as a fallback, you might want to handle it here (e.g., refund, manual intervention)
                    console.error(`Insufficient stock for product ${item.productName} (ID: ${item.productId})`);
                    // For now, we'll just log and continue, but in a real app,
                    // you might want to revert the payment or mark the order as failed.
                    // Or, if using transactions, abort the transaction.
                } else {
                    await Product.findByIdAndUpdate(
                        item.productId,
                        { $inc: { quantity: -item.quantity } },
                        { new: true } // Return the updated document
                    );
                }
            }

            // Delete the user's cart after successful order placement and stock update
            await Cart.deleteOne({ userId });

            await newOrder.save(); // Save the new order to MongoDB
            internalOrderId = newOrder.orderId; // Capture the generated internal order ID

            console.log('New order placed in MongoDB and verified:', internalOrderId);

        } catch (dbError) {
            console.error("Error saving order to database or updating stock after successful payment:", dbError);
            // If there's a DB error *after* payment is verified, you have a critical situation.
            // You might need to:
            // 1. Log this extensively.
            // 2. Alert an admin.
            // 3. Potentially initiate a refund process if the order couldn't be fulfilled.
            return NextResponse.json({ success: false, message: 'Payment verified but failed to record order internally. Please contact support.' }, { status: 500 });
        }


        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully. Order placed.',
            orderId: internalOrderId, // Return your internal order ID
        }, { status: 200 });

    } catch (error) {
        console.error('Error in payment verification or order processing:', error);
        return NextResponse.json({ success: false, message: 'An unexpected error occurred during payment processing.' }, { status: 500 });
    }
}