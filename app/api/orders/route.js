// app/api/orders/route.js

import { NextResponse } from 'next/server';
import mongoose from 'mongoose'; // Still needed for ObjectId if you were to use it, but not for transactions here.
import Product from '@/app/models/product';
import Cart from '@/app/models/Cart';
import Order from '@/app/models/Order'; // Adjust path if necessary
import connectToDatabase from '@/app/conn/db'; // Adjust path if necessary

export async function POST(req) {
    // Ensure database connection
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ message: "Failed to connect to the database." }, { status: 500 });
    }

    const body = await req.json();
    const { userId, cartItems, shippingDetails, totalPrice } = body;

    // --- Basic Validation ---
    if (!userId || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !shippingDetails || totalPrice === undefined) {
        return NextResponse.json({ message: 'Missing or invalid order data.' }, { status: 400 });
    }

    

    try {
        // --- Create and Store the New Order ---
        const newOrder = new Order({
            userId,
            orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Generate a unique order ID
            items: cartItems, // Store the items from the cart
            shippingDetails,
            totalPrice,
            orderDate: new Date(),
            status: 'Pending', // Initial status
        });
        const userCart = await Cart.deleteOne({ userId })
        for (const item of cartItems) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: -item.quantity } },
                { new: true }
            );
        }


        await newOrder.save(); // Save the new order to MongoDB

        console.log('New order placed in MongoDB:', newOrder.orderId);

        // --- Respond to the frontend ---
        return NextResponse.json({
            message: 'Order placed successfully!',
            orderId: newOrder.orderId,
            order: newOrder,
        }, { status: 200 });

    } catch (error) {
        console.error("Error placing order:", error);
        // Return a generic server error message
        return NextResponse.json({
            message: 'Failed to place order due to a server error.'
        }, { status: 500 });
    }
}
