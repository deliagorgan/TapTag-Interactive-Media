const express = require("express");
const router = express.Router();

const { getPostByID,
        updatePostByID,
        getPostsByHashtag,
        getPostsByUserID,
        getRandomPost,
        deletePostByID,
        checkDeletePermission,
        deleteReportedPostByID,
        resetFeed,
        getNextFeedPost,
        getPostsByText,
        getPostsCountByUserID,
        getAllPosts,
        addPost } = require('../controller/postController.js');


router.post("/text/", getPostsByText);

router.post("/", addPost);
router.get("/", getAllPosts);

router.get("/feed/", getNextFeedPost);
router.get("/feed/reset/", resetFeed);

router.get("/explore/", getRandomPost);
router.get("/hashtag/:name/", getPostsByHashtag);
router.get("/user/:userID/", getPostsByUserID);
router.get("/count/user/:userID/", getPostsCountByUserID);

router.delete('/admin/:postID/reportedBy/:reporterID', deleteReportedPostByID);
router.delete("/permission/delete/:id/", checkDeletePermission);
router.delete("/:id/", deletePostByID);

router.post("/:id/", updatePostByID);

router.get("/:id/", getPostByID);



module.exports = router;