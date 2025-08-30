import noteModel from "../models/note.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createNote = asyncHandler(async(req,res) => {
    const {title,description} = req.body;

    if(!title || !description){
        throw new ApiError(400,"All fields Are Required");
    }

    const note = await noteModel.findOne({title});

    if(note){
        throw new ApiError(404,"Notes is Already Exits with this Title");
    }

    const createdNotes = await noteModel.create({
        title,
        description,
        user : req.user
    })

    if(!createdNotes){
        throw new ApiError(400,"Failed to Create Notes")
    }

    return res.status(201).json(new ApiResponse(201,"Notes is Created Successfully",{}));
})


const deleteNotes = asyncHandler(async(req,res) => {
    const {noteId} = req.params;

    const note = await noteModel.findByIdAndDelete(noteId);

    if(!note){
        throw new ApiError(404,"Note not found");
    }

    return res.status(200).json(new ApiResponse(200,"Notes Deleted Successfully",{}));
})

const getAllnotes = asyncHandler(async(_, res) => {
    const notes = await noteModel.find();

    if(!notes){
        throw new ApiError(404,"Notes is not Exist");
    }

    return res.status(200).json(new ApiResponse(200,"Notes is Fetched Successfully",{notes}));
})

export {createNote,deleteNotes,getAllnotes};