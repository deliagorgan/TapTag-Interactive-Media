const express = require("express");
const router = express.Router();

const { getAllCommentReportsByReceiverID,
        deleteCommentReportByID,
        getAllCommentReportsByCommentID,
        getAllCommentReports,
        getCommentReportsByCommentIDAndCurrentUser,
        checkIfUserHasReported,
        checkIfUserHasBeenReported,
        createCommentReport } = require('../controller/commentReportController.js')


router.get('/currentUser/comment/:commentID', getCommentReportsByCommentIDAndCurrentUser);
router.get('/comment/:commentID', getAllCommentReportsByCommentID);
router.get('/user/:userID/has/reported', checkIfUserHasReported);
router.get('/user/:userID/has/been/reported', checkIfUserHasBeenReported);
router.delete('/:reportID/', deleteCommentReportByID);
router.post('/create/', createCommentReport); 
router.get('/all/', getAllCommentReports);




module.exports = router;
