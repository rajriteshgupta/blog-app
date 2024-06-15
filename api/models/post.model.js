import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    default: "https://firebasestorage.googleapis.com/v0/b/blog-app-1f895.appspot.com/o/DefaultPost.png?alt=media"
  },
  category: {
    type: String,
    default: "uncategorized"
  },
}, {timestamps: true});

const Post = mongoose.model('Post', postSchema);

export default Post;