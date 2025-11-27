import {upsertStreamUser} from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req, res)
{
    const {email, password, fullName} = req.body;

    try
    {
        if (!email || !password || !fullName)
        {
            return res.status(400).json({message: "All fields are required"});
        }

        if (password.length < 6)
        {
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // To check with regex we use test function
        if(!emailRegex.test(email))
        {
            return res.status(400).json({message: "Invalid email format"});
        }

        const existingUser = await User.findOne({email});
        if (existingUser)
        {
            return res.status(400).json({message: "Email already exists, please use a diffrent one"});
        }

        const idx = Math.floor(Math.random() * 100) + 1; // [1, 100]
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        });

        // Creating same new user in stream also
        try{
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName, 
                image: newUser.profilePic || "",
            });
            console.log(`Stream user created for ${newUser.fullName}`);
        }
        catch(error)
        {
            console.log("Error creating Stream user:", error);
        }
        // Why JWT is Used in Auth Systems
        // Stateless authentication – You don’t need to store 
        //                            sessions in the database.
        // Scalable – Works well for 
        // distributed systems (no shared session store needed).
        // Secure – If configured correctly, it's safe and widely adopted.
        const token = jwt.sign(
            {userId : newUser._id},
            process.env.JWT_SECRET_KEY,
            {expiresIn: "7d",
        });

        // The token in the cookie acts as proof that the user is logged in.
        // For every authenticated route, you check for this cookie, verify the JWT, and extract the userId.
        res.cookie(
            "jwt",
            token,
            {
                httpOnly: true, // prevent XSS attacks
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: "strict", // prevent CSRF attacks
                secure: process.env.NODE_ENV === "production",
            }
        );

        res.status(201).json({success: true, message:
            "User created successfully", user: newUser
        });
    }
    catch (error)
    {
        console.log("Error in signup:", error);
        res.status(500).json({message: "Internal Server error"});
    }
}

export async function login(req, res){
    try
    {
        const {email, password} = req.body;

        if (!email || !password)
        {
            return res.status(400).json({message: "All fields are required"});
        }

        const existingUser = await User.findOne({email});

        const isPasswordCorrect = await existingUser.matchPassword(password);
        
        if(!existingUser || !isPasswordCorrect) return res.status(401).json({message: "Invalid email or password"});
        
        const token = jwt.sign(
            {userId : existingUser._id},
            process.env.JWT_SECRET_KEY,
            {expiresIn: "7d",
        });

        res.cookie(
            "jwt",
            token,
            {
                httpOnly: true, // prevent XSS attacks
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: "strict", // prevent CSRF attacks
                secure: process.env.NODE_ENV === "production",
            }
        );

        res.status(200).json({success: true, message: "Login successful", user: existingUser});
    }
    catch (error)
    {
        console.log("Error in login controller", error.message);

        res.status(500).json({message: "Internal Server Error"});
    }

}

export function logout(req, res){
    res.clearCookie("jwt");
    res.status(200).json({success: true, message: "Logout successful"});
}