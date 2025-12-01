import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res){
    try{
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and:[
                {_id: {$ne: currentUserId}}, // exclude current user
                {_id: {$nin: currentUser.friends}}, // exclude current user's friends
                {isOnboarded: true}, // this is compulsory that the user must be onboarded if he won't be onboarded then his native language and learnig language we won't be able to find
            ],
        });

        res.status(200).json(recommendedUsers);
    }
    catch (error){
        console.error("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id).select("friends").populate("friends", "fullName profilePic nativeLanguage learningLanguage");
    
        res.status(200).json(user.friends);
    }
    catch (error){
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function sendFriendRequest(req, res){
    try{
        const myId = req.user.id;
        const {recipientId} = req.params;

        if(myId == recipientId){
            return res.status(400).json({message: "You can't send friend request to yourself"});
        }
        
        const recipient = await User.findById(recipientId);

        if(!recipient){
            return res.status(404).json({message: "Recipient not found"});
        }
        
        if(recipient.friends.includes(myId)){
            return res.status(400).json({message: "You are already friends with this recipient"});
        }

        // Check if a friend request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId },
            ],
        });

        if (existingRequest) {
            return res.status(400).json({ message: "A friend request already exists between you and this recipient" });
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        res.status(201).json(friendRequest);
    }
    catch (error){
        console.error("Error in sendFriendRequest controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const {id : requestId} = req.params;

        const friendRequesrt = await FriendRequest.findById(requestId);

        if(!friendRequesrt){
            return res.status(404).json({message: "Friend request not found"});
        }

        // Verify that the logged-in user is the recipient of the friend request
        if(friendRequesrt.recipient.toString() !== req.user.id){
            return res.status(403).json({message: "You are not authorized to accept this friend request"});
        }

        friendRequesrt.status = "accepted";
        await friendRequesrt.save();

        // Add each user to the other's friends list

        // $addToSet: adds elements to an array only if they do not already exist.
        await User.findByIdAndUpdate(friendRequesrt.sender, {
            $addToSet: { friends: friendRequesrt.recipient },
        });
        await User.findByIdAndUpdate(friendRequesrt.recipient, {
            $addToSet: { friends: friendRequesrt.sender },
        });

        res.status(200).json({ message: "Friend request accepted" });
    }
    catch (error) {
        console.error("Error in acceptFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getFriendRequests(req, res){
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted",
        }).populate("recipient", "fullName profilePic");
        
        res.status(200).json({incomingReqs, acceptedReqs});
    }
    catch (error) {
        console.error("Error in getFriendRequests controller", error.message);
        res.status(500).json({ message: "Internal Server Error" }); 
    }
}

export async function getOutgoingFriendReqs(req, res){
    try {
        const outgoingReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(outgoingReqs);
    }
    catch (error) {
        console.error("Error in getOutgoingFriendReqs controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}