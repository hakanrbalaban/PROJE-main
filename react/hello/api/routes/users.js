import express from "express";
import { getUser, getSuggestions, updateUser } from "../controllers/user.js";

const router = express.Router()

router.get("/find/:userId", getUser)
router.get("/suggestions", getSuggestions)
router.put("/", updateUser)

export default router
