import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js"; 
import {
    getRecommendedUsers,
    getMyFriends,
    sendFriendRequest,
    getFriendRequests,
    acceptFriendRequest,
    getOutgoingFriendReqs,
} from "../controllers/user.controller.js";

const router = express.Router();

// Use auth middleware to protect all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);

router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

export default router;