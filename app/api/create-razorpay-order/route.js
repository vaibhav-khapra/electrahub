// app/api/create-razorpay-order/route.js
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // Your Key ID from .env.local
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Your Key Secret from .env.local
});

export async function POST(req) {
    try {
        const { amount, currency, receipt } = await req.json();

        if (!amount || !currency || !receipt) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const options = {
            amount: amount, // amount in the smallest currency unit (e.g., paisa for INR)
            currency: currency,
            receipt: receipt,
            payment_capture: 1, // 1 for automatic capture, 0 for manual
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json({ message: 'Failed to create Razorpay order', error: error.message }, { status: 500 });
    }
}