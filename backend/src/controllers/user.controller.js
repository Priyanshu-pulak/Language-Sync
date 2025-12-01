import User from "../models/User.js";

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