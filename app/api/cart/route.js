// app/api/cart/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/app/conn/db';
import Cart from '@/app/models/Cart';


export async function POST(req) {
    try {
        await connectToDatabase();

        const body = await req.json();
        const {
            userId, // string (mobile number)
            productId, // This is a string from frontend, needs conversion for DB
            quantity,
            productName,
            productPrice,
            productImage,
        } = body;

        // Log the received data for debugging
        console.log('Received cart data (POST):', { userId, productId, quantity, productName, productPrice, productImage });

        // Validate required fields and quantity
        if (!userId || !productId || typeof quantity !== 'number' || quantity <= 0) {
            // Log which specific field is missing or invalid
            console.error('Missing or invalid required cart item data:', {
                userId: !!userId,
                productId: !!productId,
                quantity: quantity, // Log the actual quantity received
                isNumber: typeof quantity === 'number',
                isPositive: quantity > 0
            });
            return NextResponse.json(
                { message: 'Missing or invalid required cart item data (userId, productId, quantity must be a positive number).' },
                { status: 400 }
            );
        }

        // Find cart using string userId (mobile number)
        let userCart = await Cart.findOne({ userId });

        if (userCart) {
            const itemIndex = userCart.items.findIndex(
                // Ensure comparison is always string to string
                (item) => item.productId.toString() === productId
            );

            if (itemIndex > -1) {
                // Update quantity and other product details
                userCart.items[itemIndex].quantity += quantity;
                userCart.items[itemIndex].productName = productName; // Update name
                userCart.items[itemIndex].productPrice = productPrice; // Update price
                userCart.items[itemIndex].productImage = productImage; // Update image
                console.log(`Updated quantity for product ${productId} in cart for user ${userId}`);
            } else {
                // Add new product
                userCart.items.push({
                    productId: new mongoose.Types.ObjectId(productId), // productId converted to ObjectId
                    quantity,
                    productName,
                    productPrice,
                    productImage,
                    addedAt: new Date(),
                });
                console.log(`Added new product ${productId} to existing cart for user ${userId}`);
            }

            userCart.updatedAt = new Date();
            await userCart.save();
            return NextResponse.json({ message: 'Cart updated successfully.' }, { status: 200 });
        } else {
            // Create new cart
            const newCart = new Cart({
                userId, // userId used directly as string
                items: [
                    {
                        productId: new mongoose.Types.ObjectId(productId), // productId converted to ObjectId
                        quantity,
                        productName,
                        productPrice,
                        productImage,
                        addedAt: new Date(),
                    },
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await newCart.save();
            console.log(`Created new cart for user ${userId} and added product ${productId}`);
            return NextResponse.json(
                { message: 'New cart created and product added.' },
                { status: 201 }
            );
        }
    } catch (error) {
        console.error('Add to cart failed (POST):', error);
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

// MODIFIED GET request handler to return the full cart object with totalItems
export async function GET(req) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { message: 'Missing userId query parameter.' },
                { status: 400 }
            );
        }

        const userCart = await Cart.findOne({ userId }).lean(); // Use .lean() for performance

        if (userCart) {
            // Calculate totalItems from the items array
            const totalItems = userCart.items.reduce((sum, item) => sum + item.quantity, 0);
            return NextResponse.json({ ...userCart, totalItems }, { status: 200 });
        } else {
            // If no cart found, return an empty cart object with userId and totalItems: 0
            return NextResponse.json({ userId, items: [], totalItems: 0, createdAt: new Date(), updatedAt: new Date() }, { status: 200 });
        }

    } catch (error) {
        console.error('Fetch cart items failed (GET):', error);
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}