import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
    title: string;
    description: string;
    user?: string;
    createdAt: Date;
    updatedAt: Date;
}

const noteSchema = new Schema({
    title : {
        type : String,
        unique : true,
        index : true,
        required : true
    },
    description : {
        type : String,
        required : true,
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    }
})

export default mongoose.model<INote>("Note", noteSchema);
