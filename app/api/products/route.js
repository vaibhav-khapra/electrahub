// app/api/products/route.js

import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/conn/db';
import Product from '@/app/models/product';

// Handle POST request - Add a new product
export async function POST(request) {
    try {
        await connectToDatabase();
        const productData = await request.json();

        const newProduct = await Product.create(productData);

        return NextResponse.json({
            message: 'Product added successfully!',
            product: newProduct
        }, { status: 201 });

    } catch (error) {
        console.error('Error adding product:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            }));
            return NextResponse.json({ message: 'Validation failed', errors }, { status: 400 });
        }

        return NextResponse.json({ message: 'Failed to add product', error: error.message }, { status: 500 });
    }
}

// Handle GET request - Get all products
export async function GET() {
    try {
        await connectToDatabase();
        const products = await Product.find({});
        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ message: 'Failed to fetch products', error: error.message }, { status: 500 });
    }
}
