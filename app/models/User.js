import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        mobileNumber: {
            type: String,
            required: true,
            unique: true,
            match: [/^\d{10}$/, 'Invalid mobile number'],
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
