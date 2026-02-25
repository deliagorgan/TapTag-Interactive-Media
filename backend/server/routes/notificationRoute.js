const express = require("express");
const router = express.Router();

const {
    getNotificationsByUserID,

    setLikeNotificationsAsViewed,
    setCommentNotificationsAsViewed,
    setPostNotificationsAsViewed,
    setFollowNotificationsAsViewed,
    setPostReportNotificationsAsViewed,
    setCommentReportNotificationsAsViewed,
    setGenericNotificationsAsViewed,

    deleteLikeNotification,
    deleteCommentNotification,
    deletePostNotification,
    deleteFollowNotification,
    deletePostReportNotification,
    deleteCommentReportNotification,
    deleteGenericNotification, } = require('../controller/notificationController.js');


router.get('/', getNotificationsByUserID);

router.post('/view/like/:notificationID/', setLikeNotificationsAsViewed);
router.post('/view/comment/:notificationID/', setCommentNotificationsAsViewed);
router.post('/view/post/:notificationID/', setPostNotificationsAsViewed);
router.post('/view/follow/:notificationID/', setFollowNotificationsAsViewed);
router.post('/view/postReport/:notificationID/', setPostReportNotificationsAsViewed);
router.post('/view/commentReport/:notificationID/', setCommentReportNotificationsAsViewed);
router.post('/view/generic/:notificationID/', setGenericNotificationsAsViewed);



router.delete('/like/:notificationID/', deleteLikeNotification);
router.delete('/comment/:notificationID/', deleteCommentNotification);
router.delete('/post/:notificationID/', deletePostNotification);
router.delete('/follow/:notificationID/', deleteFollowNotification);
router.delete('/postReport/:notificationID/', deletePostReportNotification);
router.delete('/commentReport/:notificationID/', deleteCommentReportNotification);
router.delete('/generic/:notificationID/', deleteGenericNotification);


module.exports = router;
