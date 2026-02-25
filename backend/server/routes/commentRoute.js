const express = require("express");
const router = express.Router();

const {getAllComments,
       deleteCommentByID,
       createComment,
       checkDeletePermission,
       deleteReportedCommentByID,
       getCommentByID,
       updateCommentByID} = require('../controller/commentController.js');


router.post('/create/', createComment); 
router.delete('/admin/:commentID/reportedBy/:reporterID', deleteReportedCommentByID);
router.delete('/permission/delete/:postID/:commentID', checkDeletePermission);
router.delete('/:postID/:commentID', deleteCommentByID);
router.get('/:postID', getAllComments);
router.get('/id/:commentID', getCommentByID);
router.put('/:postID', updateCommentByID);




module.exports = router;
