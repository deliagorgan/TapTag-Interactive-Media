const express = require("express");
const router = express.Router();

const { getAllPostReports,
        deletePostReportByID,
        getAllPostReportsByPostID,
        getPostReportsByPostIDAndCurrentUser,
        checkIfUserHasReported,
        checkIfUserHasBeenReported,
        createPostReport } = require('../controller/postReportController.js')


router.get('/currentUser/post/:postID', getPostReportsByPostIDAndCurrentUser);
router.get('/post/:postID', getAllPostReportsByPostID);
router.get('/user/:userID/has/reported', checkIfUserHasReported);
router.get('/user/:userID/has/been/reported', checkIfUserHasBeenReported);
router.post('/create/', createPostReport); 
router.get('/all/', getAllPostReports);
router.delete('/:reportID/', deletePostReportByID);



module.exports = router;
