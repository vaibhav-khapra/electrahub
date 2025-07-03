import { NextResponse } from 'next/server';
import Order from '@/app/models/Order';
import connectToDatabase from '@/app/conn/db';

export async function GET(req, { params }) {
    // Ensure database connection
    try {
        await connectToDatabase();
    } catch (dbError) {
        console.error("Database connection failed:", dbError);
        return NextResponse.json({ message: "Failed to connect to the database." }, { status: 500 });
    }

    const { userId } = params; // Get userId from dynamic route parameters

    // --- Basic Validation ---
    if (!userId) {
        return NextResponse.json({ message: 'User ID is required to fetch orders.' }, { status: 400 });
    }

    try {
        // Fetch all orders for the specified userId, sorted by orderDate descending
        // .lean() is used for performance, returning plain JavaScript objects
        const orders = await Order.find({ userId: userId }).sort({ orderDate: -1 }).lean();

        if (!orders || orders.length === 0) {
            return NextResponse.json({ message: 'No orders found for this user.' }, { status: 404 });
        }

        // --- Respond to the frontend ---
        return NextResponse.json({
            message: 'Orders fetched successfully!',
            data: orders,
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching orders:", error);
        // Return a generic server error message
        return NextResponse.json({
            message: 'Failed to fetch orders due to a server error.'
        }, { status: 500 });
    }
}
