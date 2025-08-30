import rateLimit from 'express-rate-limit';
import redisClient from '../configs/redis.config.js';
import { Request, Response, NextFunction } from "express";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse';

const otpRateLimiter = async(req : Request ,res : Response,next : NextFunction) => {
    const userId = req.body.email;
    console.log("UserID in OTP Rate Limiter:", userId); 
    if(!userId){
       throw new ApiError(400,"User Field is Required");
    }

    const minuteKey = `otp:${userId}:minute`;
    const blockKey = `otp:${userId}:block`;

    const isBlocked = await redisClient.get(blockKey);

    if(isBlocked){
        return new ApiError(429,"Too many OTP requests. Try again after 1 hour");
    }

    const count = await redisClient.incr(minuteKey);

    if(count == 1){
        await redisClient.expire(minuteKey,60);
    }

    if(count > 3){
        await redisClient.set(blockKey,"1","EX",60*60);
        return res.status(429).json({ error: "Too many OTP requests. Try again after 1 hour." });
    }

    next();

}

export default otpRateLimiter;


