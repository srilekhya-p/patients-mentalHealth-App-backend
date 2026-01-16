const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/', postController.createPost);
router.get('/', postController.getPosts);
router.post('/:postId/replies', postController.replyToPost);

module.exports = router;
