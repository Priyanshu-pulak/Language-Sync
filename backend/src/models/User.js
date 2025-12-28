import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        fullName:
        {
            type: String,
            required: true,
        },
        email:
        {
            type: String,
            required: true,
            unique: true,
        },
        password:
        {
            type: String,
            required: true,
            minlength: 6,
        },
        bio:
        {
            type: String,
            default: "",
        },
        profilePic:
        {
            type: String,
            default: "",
        },
        nativeLanguage:
        {
            type: String,
            default: "",
        },
        learningLanguage:
        {
            type: String,
            default: "",
        },
        location:
        {
            type: String,
            default: "",
        },
        isOnboarded:
        {
            type: Boolean,
            default: false,
        },
        
        // if some users are freind with this user then their ids will get stored in the friends array not entire user objects
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {timestamps: true} // createdAt and updatedAt fields will be added automatically
);

// Hashing the user passwords before saving them to the database for security reasons
userSchema.pre(
    "save",
    async function(next)
    {
        // If password is not modified then we don't need to hash it again
        
        if (!this.isModified("password")) return next();// is a callback function that tells Mongoose to proceed to the next middleware or complete the save operation. Without calling next(), the save operation would hang indefinitely. 

        try
        {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next(); 
        }
        catch (error)
        {
            next(error); // passing the error to next() will abort the save operation and propagate the error to the caller.
        }
    }
)

userSchema.methods.matchPassword = async function(enteredPassword){
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);

    return isPasswordCorrect;
}

// Creating a Mongoose model from the schema
const User = mongoose.model("User", userSchema);

export default User;