const postModels = require('../model/postModels'); // Make sure this path is correct
const cloudinaryupload = require('../utils/cloudinary');
const User = require('../model/userModels'); // Ensure this is the correct path to your User model
const Post = require('../model/postModels'); // Import Post model

// Add Post
module.exports.addpost = async (req, res) => {
    const { text } = req.body;
    const ImagesPath = req.file?.path;
    const userId = req.user.userId;

    console.log('UserId:', userId); // Debugging line

    if (!userId) {
        return res.status(401).json({
            success: false,
            msg: 'Unauthorized: User not authenticated'
        });
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({
            success: false,
            msg: 'Invalid input: Post text is required and must be a non-empty string'
        });
    }

    try {
        let imageData = {};
        if (ImagesPath) {
            imageData = await cloudinaryupload(ImagesPath, 'posts');
        }

        const newPost = new postModels({
            text,
            images: imageData, // Fix the property name here to match the schema
            user: userId
        });

        await newPost.save();

        res.status(201).json({
            success: true,
            msg: 'Post added successfully!',
            post: newPost
        });
    } catch (error) {
        console.error('Error adding post:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to add post',
            error: error.message
        });
    }
};

// Delete Post
module.exports.deletePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.userId;

    try {
        const post = await postModels.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                msg: 'Post not found'
            });
        }

        if (!userId) {
            return res.status(403).json({
                success: false,
                msg: 'Unauthorized: You can only delete your own posts'
            });
        }

        // Use deleteOne instead of remove
        await postModels.deleteOne({ _id: postId });

        res.status(200).json({
            success: true,
            msg: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to delete post',
            error: error.message
        });
    }
};

// Comment on Post
module.exports.commentOnPost = async (req, res) => {
    const postId = req.params.id;
    const { comment } = req.body;
    const userId = req.user.userId;

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
        return res.status(400).json({
            success: false,
            msg: 'Invalid input: Comment text is required and must be a non-empty string'
        });
    }

    try {
        const post = await postModels.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                msg: 'Post not found'
            });
        }

        post.comments.push({ user: userId, text: comment });

        await post.save();

        res.status(200).json({
            success: true,
            msg: 'Comment added successfully',
            post
        });
    } catch (error) {
        console.error('Error commenting on post:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to add comment',
            error: error.message
        });
    }
};

// Like/Unlike Post
module.exports.likeUnlikePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.userId;

    try {
        const post = await postModels.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                msg: 'Post not found'
            });
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({
            success: true,
            msg: isLiked ? 'Post unliked successfully' : 'Post liked successfully',
            post
        });
    } catch (error) {
        console.error('Error liking/unliking post:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to like/unlike post',
            error: error.message
        });
    }
};

// Get All Posts
module.exports.getAllPosts = async (req, res) => {
    try {
        const posts = await postModels.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        console.error('Error getting all posts:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to retrieve posts',
            error: error.message
        });
    }
};

// Get Following Posts
module.exports.getFollowingPosts = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Find the user and populate the following field with user data
        const user = await User.findById(userId).populate('following');

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        // Retrieve the IDs of the users the current user is following
        const followingUserIds = user.following.map(follow => follow._id);

        // Query for posts from the users the current user is following
        const posts = await Post.find({ user: { $in: followingUserIds } }).populate('user');

        res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        console.error('Error getting following posts:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to retrieve following posts',
            error: error.message
        });
    }
};

// Get User Posts
module.exports.getUserPosts = async (req, res) => {
    const userId = req.user.userId;

    try {
        const posts = await postModels.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        console.error('Error getting user posts:', error);
        res.status(500).json({
            success: false,
            msg: 'Failed to retrieve user posts',
            error: error.message
        });
    }
};
