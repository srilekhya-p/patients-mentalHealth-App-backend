// controllers/postController.js
const Post = require('../models/post'); // Use require instead of import
const { isContentSafe } = require('../util/moderation'); // Import the moderation function

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { userName, message } = req.body;
        if (!userName || !message) {
            return res.status(400).json({ error: 'Missing userName or message' });  // ✅
        }

        // Check content safety using the Gemini LLM
        const moderationCheck = await isContentSafe(message);

        if (!moderationCheck.isSafe) {
            // BLOCK THE POST
            console.warn(`Post blocked for: ${moderationCheck.harmCategory} - ${moderationCheck.reasoning}`);
            return res.status(403).json({
                message: "Content was flagged as unsafe. Please revise your post according to community guidelines.",
                blockedReason: moderationCheck.harmCategory,
            });
        }

        const newPost = new Post({ userName, message });
        await newPost.save();
        return res.status(201).json(newPost);
    } catch (err) {
        console.error('Error creating post:', err);
        return res.status(500).json({ error: 'Failed to create post' });
    }
};

// Get all posts
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return res.status(200).json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

// Add a reply to a post
exports.replyToPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userName, message } = req.body;

        if (!userName || !message) {
            return res.status(400).json({ error: 'Missing userName or message' });
        }

        // 1. Check content safety using the Gemini LLM
        const moderationCheck = await isContentSafe(message);

        if (!moderationCheck.isSafe) {
            // 2. BLOCK THE POST
            console.warn(`Post blocked for: ${moderationCheck.harmCategory} - ${moderationCheck.reasoning}`);
            return res.status(403).json({
                message: "Content was flagged as unsafe. Please revise your post according to community guidelines.",
                blockedReason: moderationCheck.harmCategory,
            });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.replies.push({ userName, message });
        await post.save();

        return res.status(200).json(post);
    } catch (err) {
        console.error('Error replying to post:', err);
        return res.status(500).json({ error: 'Failed to add reply' });
    }
};

