const express = require('express');
const upload = require('../middleware/multer')
const { signUp, signIn, logout, getme, followOrUnfollow, getSuggestedUsers, editProfile } = require('../controller/userController');
const ensureAuthorization = require('../middleware/authMiddleware');
const { addpost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getFollowingPosts, getUserPosts } = require('../controller/postModels');
const router = express.Router();
router.post("/signUp", signUp)
router.post("/signIn", signIn)
router.get("/logout", logout)
router.get("/profile", ensureAuthorization, getme)
router.post('/follow/:id', ensureAuthorization, followOrUnfollow);
router.get('/getuser', ensureAuthorization, getSuggestedUsers);
router.put('/getuser', ensureAuthorization, editProfile);
router.post('/posts', ensureAuthorization, upload.single('Images'), addpost)

router.delete('/posts/:id', ensureAuthorization, deletePost);
router.post('/posts/:id/comment', ensureAuthorization, commentOnPost);
router.post('/posts/:id/like', ensureAuthorization, likeUnlikePost);
router.get('/posts', ensureAuthorization, getAllPosts);
router.get('/posts/following', ensureAuthorization, getFollowingPosts);
router.get('/posts/user', ensureAuthorization, getUserPosts);
module.exports = router