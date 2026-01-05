import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try
    {
        const token = req.cookies.jwt; // req.cookies.name(which is in login route)

        if(!token){
            return res.status(401).json({message: "Unauthorized - No token provided"});
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // This name should be same as import jwt(name) from "jsonwebtoken"; here import jwt so jwt.verify

        if(!decoded){
            return res.status(401).json({message: "Unauthorized - Invalid token"});
        }

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(401).json({message: "Unauthorized - User not found"});
        }
        
        req.user = user;
        next();
    }
    catch (error)
    {
        console.log("Error in protectRoute middleware", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};