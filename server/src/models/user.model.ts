import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    dob : Date;
    google_id?: string;
    lastLogin?: Date;
    isVerified?: boolean;
    createdAt: Date;
    updatedAt: Date;
    refreshToken?: string;
}

const userShcema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,

    },
    google_id: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    dob: {
        type: Date,
        required: false,
    },
    refreshToken : String

}, { timestamps: true })

export default mongoose.model<IUser>("User", userShcema);
