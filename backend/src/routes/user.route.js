import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js"; 
import { getRecommendedUsers, getMyFriends } from "../controllers/user.controller.js";

const router = express.Router();

// Use auth middleware to protect all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

export default router;