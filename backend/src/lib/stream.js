import {StreamChat} from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

// with the help of apikey and apisecret we can communicate 
// with stream this is same as we were creating a connectDB in db.js
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try
    {
        // upsertusers is a function in stream which by which if user is not in database of stream the create it else update it
        await streamClient.upsertUsers([userData]);

        return userData;
    }
    catch (error)
    {
        console.error("Error upserting Stream user:", error);
    }
};

const generateStreamToken = (userId) => {};