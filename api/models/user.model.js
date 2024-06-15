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
        default: "https://firebasestorage.googleapis.com/v0/b/blog-app-1f895.appspot.com/o/DefaultProfile.jpg?alt=media"
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;