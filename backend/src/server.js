import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth_route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat_route.js";

import {connectDB} from "./lib/db.js";

const app = express();
const PORT = process.env.PORT

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) =>{
    res.send("Hello from backend");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB(); // calling the connectDB() method in db.js to make database connection
})