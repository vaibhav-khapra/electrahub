import jwt from 'jsonwebtoken';

export function generateToken(user) {
    return jwt.sign(
        { id: user._id, mobileNumber: user.mobileNumber },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}
