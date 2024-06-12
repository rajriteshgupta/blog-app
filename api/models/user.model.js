import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: "https://firebasestorage.googleapis.com/v0/b/blog-app-1f895.appspot.com/o/DefaultProfile.jpg?alt=media&token=b033fcfe-6c4e-402b-a4eb-832f836eeea8"
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;