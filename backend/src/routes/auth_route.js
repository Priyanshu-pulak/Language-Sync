import express from "express";
import {signup, onboard, login, logout} from "../controllers/auth_controller.js";
import {protectRoute} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);    
router.post("/logout", logout);

// Apply authentication middleware to all routes below
router.use(protectRoute); 

router.post("/onboarding", onboard);
router.get("/me", (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
})

export default router;