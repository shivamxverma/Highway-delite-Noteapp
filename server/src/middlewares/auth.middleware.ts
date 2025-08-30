import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user.model.js';
import type { Request, Response, NextFunction } from 'express';
import type { IUser } from '../models/user.model.js';

declare global {
    namespace Express {
        interface Request {
            user?: IUser | null;
        }
    }
}

export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : req.cookies?.accessToken;

        // console.log("Verifying JWT Token:", token);

        if (!token) {
            throw new ApiError(401, 'Unauthorized Request: No token provided');
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);

        console.log("Decoded JWT Token:", decodedToken);

        let userId: string | undefined;
        if (typeof decodedToken === 'object' && decodedToken !== null && '_id' in decodedToken) {
            userId = (decodedToken as JwtPayload)._id as string;
        }
        if (!userId) {
            throw new ApiError(401, 'Invalid Access Token: No user ID found');
        }
        const user = await User.findById(userId).select('-password -refreshToken');

        if (!user) {
            throw new ApiError(401, 'Invalid Access Token');
        }

        req.user = user;
        next();
    } catch (error: any) {
        const statusCode = error instanceof ApiError ? error.statusCode : 500;
        const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Internal Server Error';
        console.error('JWT Verification Error:', error instanceof Error ? error.message : error);
        return res.status(statusCode).json({
            status: 'error',
            message
        });
    }
});