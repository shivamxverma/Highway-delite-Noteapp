import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";
import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from "../services/email.service.js";
import otpModel from "../models/otp.model.js";
import bcrypt from 'bcryptjs';

interface userPayload {
    _id?: string;
    email: string;
    name: string;
    google_id?: string | undefined;
    dob: Date,

}

const generateRandomOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const generateAccessTokenAndRefreshToken = (user: userPayload) => {
    try {
        const payload = {
            _id: user._id,
            email: user.email,
            name: user.name,
            dob: user.dob,
            ...(user.google_id && { google_id: user.google_id })
        };

        const generateAccessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: '1h' }
        );

        const generateRefreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: '7d' }
        );

        return { accessToken: generateAccessToken, refreshToken: generateRefreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
}

const generateOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const existingOTP = await otpModel.findOne({ email });
    if (existingOTP) {
        await existingOTP.deleteOne();
    }

    const otpCode = generateRandomOTP();
    const hashedOTP = await bcrypt.hash(otpCode, 10);

    const newOTP = new otpModel({
        email,
        code: hashedOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await newOTP.save();

    await sendVerificationEmail(email, otpCode);

    return res.status(200).json(new ApiResponse(200, "OTP sent to email"));
})

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, dob, otp } = req.body;

    if (!name || !email || !dob || !otp) {
        throw new ApiError(400, "Name, Email and Date of Birth are required");
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const otpRecord = await otpModel.findOne({ email });
    if (!otpRecord) {
        throw new ApiError(400, "OTP not found or expired");
    }

    console.log(otpRecord);

    const isOTPValid = await bcrypt.compare(String(otp), String(otpRecord.code));

    console.log(isOTPValid);

    if (!isOTPValid) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (otpRecord.expiresAt < new Date()) {
        await otpRecord.deleteOne();
        throw new ApiError(400, "OTP has expired");
    }

    await otpRecord.deleteOne();

    const newUser = new userModel({
        name,
        email,
        dob: new Date(dob),
        isVerified: true
    });

    await newUser.save();

    return res.status(201).json(new ApiResponse(201, "User registered successfully"));
})

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        throw new ApiError(400, "Email is required");
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const otpRecord = await otpModel.findOne({ email });

    if (!otpRecord) {
        throw new ApiError(400, "OTP not found or expired");
    }

    const isOTPValid = await bcrypt.compare(otp, otpRecord.code);

    if (!isOTPValid) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (otpRecord.expiresAt < new Date()) {
        await otpRecord.deleteOne();
        throw new ApiError(400, "OTP has expired");
    }

    await otpRecord.deleteOne();

    const { accessToken, refreshToken } = generateAccessTokenAndRefreshToken({
        _id: user._id as string | undefined,
        email: user.email,
        name: user.name,
        google_id: user.google_id,
        dob: user.dob
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    })

    return res.status(200).json(new ApiResponse(200, "Login Successful", { accessToken }));
})

const googleAuth = asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;
    console.log(idToken);
    if (!idToken) {
        throw new ApiError(400, "Access token is required");
    }

    const response = await axios.get(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: { Authorization: `Bearer ${idToken}` },
    });

    const { user_metadata, email, id: google_id } = response.data as {
        user_metadata?: { full_name?: string; name?: string, dob?: string };
        email?: string;
        id?: string;
    };
    const name = user_metadata?.full_name || user_metadata?.name || 'User';

    if (!email) {
        throw new ApiError(400, "Google authentication failed: Email not found");
    }

    let user = await userModel.findOne({ email });

    if (!user) {
        user = new userModel({
            email,
            google_id,
            name,
            isVerified: true,
            dob: user_metadata?.dob ? new Date(user_metadata.dob) : new Date()
        });
        await user.save();
    } else if (user.google_id !== google_id) {
        user.google_id = google_id;
        await user.save();
    }

    const { accessToken, refreshToken } = generateAccessTokenAndRefreshToken({
        _id: user._id as string,
        email,
        name,
        google_id,
        dob: user?.dob ?? new Date()
    });

    console.log(accessToken, refreshToken);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    })

    return res.status(200).json(new ApiResponse(200, "Google authentication successful", { email, accessToken }));
})

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) throw new ApiError(404, "No refresh token");

    const payload: any = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);

    const user = await userModel.findOne({ email: payload.email });

    if (!user) throw new ApiError(404, "User not found");

    const newAccessToken = jwt.sign(
        { email: user.email, name: user.name, google_id: user.google_id },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1h" }
    );

    return res.json(200).json(new ApiResponse(201, "New AccessToken is Created", { accessToken: newAccessToken }));
})

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    await userModel.findByIdAndUpdate(userId, {
        $or: { refreshToken: undefined }
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
})

export { generateOTP, googleAuth, registerUser, loginUser, refreshAccessToken, logoutUser };