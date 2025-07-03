import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/conn/db';
import User from '@/app/models/User';
import { generateToken } from '@/app/conn/generatetoken';

export async function POST(request) {
    await connectToDatabase()

    const body = await request.json();
    const { mobileNumber } = body;

    if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
        return NextResponse.json(
            { success: false, message: 'Invalid mobile number' },
            { status: 400 }
        );
    }

    try {
        let user = await User.findOne({ mobileNumber });
        if (!user) {
            user = await User.create({ mobileNumber });
        }

        const token = generateToken(user);

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                mobileNumber: user.mobileNumber,
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
