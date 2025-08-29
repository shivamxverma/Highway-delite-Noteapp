import mongoose from "mongoose";

export interface IOTP extends mongoose.Document {
    email : string;
    code : string;
    expiresAt : Date;
    createdAt : Date;
    updatedAt : Date;
}

const otpSchema = new mongoose.Schema({
    email : {
        required : true,
        type : String,
        unique : true
    },
    code : {
        required : true,
        type : String
    },
    expiresAt : {
        required : true,
        type : Date
    }
},{
    timestamps : true
})

export const otpModel = mongoose.model<IOTP>("Otp",otpSchema);

export default otpModel;