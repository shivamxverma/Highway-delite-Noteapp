import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createNote, deleteNotes, getAllnotes } from "../controllers/note.controller.js";

const router = Router();

router.get("/", verifyJWT, getAllnotes);
router.post("/", verifyJWT, createNote);
router.delete("/:noteId", verifyJWT, deleteNotes);

export default router;