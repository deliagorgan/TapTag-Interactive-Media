const { addImageInCloud,
        downloadImageFromCloud,
        deleteImageFromCloud } = require('./cloudOperations.js');

const { findCommentByID,
        findCommentsByPostID,
        addComment,
        updateComment,
        deleteComment } = require('./commentOperations.js');

const { findFollowersByID,
        findFollowingByID,
        followExists,
        addFollower,
        deleteFollower } = require('./followerOperation.js');

const { findHashtagByID,
        findHashtagByName,
        findHashtagsByPostID,
        findHashtagByPartialName,
        hashtagExists,
        addHashtag,
        deleteHashtag } = require('./hashtagOperations.js');

const { findImageByID,
        addImage,
        getAllImages,
        deleteImage } = require('./imageOperations.js');


const { findLikeByID,
        findLikesByPostID,
        findLikesByUserID,
        findLikesByUserAndPostID,
        addLike,
        deleteLike } = require('./likeOperations.js');


const { addPost,
        updatePost,
        deletePost,
        findAllPosts,
        findRandomPost,
        findPostsByUserID,
        findPostByPhotoID,
        findPostByHashtagName,
        findUnseenPostsFromFollowing,
        findSeenPostsFromFollowing,
        findPostsCountByUserID,
        findPostsByPostCategory,
        findRandomUnseenPost,
        findPostByID } = require('./postOperations.js');

const { findUserByUsername,
        findUserByID,
        findAllUsers,
        findUserByToken,
        findUserIDByUsername,
        findUsersByPartialUsername,
        findAllAdminUsers,
        findAllNonAdminUsers,
        addUser,
        updateUser,
        deleteUser,
        findUserByEmail } = require('./userOperations.js');


const { addViewedPost,
        getTotalNumberOfViewedPosts,
        getViewsByPostIDUserID,
        getViewsByPostID } = require('./viewedPostOperations.js');


const { addViewedProfile,
        getTotalNumberOfViewedProfiles,
        getViewsByProfileIDUserID,
        getViewsByProfileID } = require('./viewedProfileOperations.js');


const { addLikeNotification,
        findLikeNotificationByID,
        findLikeNotificationsByRecipientID,
        updateLikeNotificationStatusByID,
        deleteLikeNotification } = require('./likeNotificationOperations.js');


const { addCommentNotification,
        findCommentNotificationByID,
        findCommentNotificationsByRecipientID,
        updateCommentNotificationStatusByID,
        deleteCommentNotification } = require('./commentNotificationOperations.js');


const { addFollowNotification,
        findFollowNotificationByID,
        findFollowNotificationsByRecipientID,
        updateFollowNotificationStatusByID,
        deleteFollowNotification } = require('./followNotificationOperations.js');


const { addPostNotification,
        findPostNotificationByID,
        findPostNotificationsByRecipientID,
        updatePostNotificationStatusByID,
        deletePostNotification } = require('./postNotificationOperations.js');

const { addPostReportNotification,
        findPostReportNotificationByID,
        findPostReportNotificationsByRecipientID,
        updatePostReportNotificationStatusByID,
        deletePostReportNotification } = require('./postReportNotificationOperations.js');

const { addCommentReportNotification,
        findCommentReportNotificationByID,
        findCommentReportNotificationsByRecipientID,
        updateCommentReportNotificationStatusByID,
        deleteCommentReportNotification } = require('./commentReportNotificationOperations.js');

const { addGenericNotification,
        findGenericNotificationByID,
        findGenericNotificationsByRecipientID,
        updateGenericNotificationStatusByID,
        deleteGenericNotification } = require('./genericNotificationOperations.js');


const { addCommentReport,
        findCommentReportByID,
        findCommentReportsByCommentID,
        findAllCommentReports,
        findCommentReportsByCommentIDUserID,
        findCommentReportByReporterID,
        findCommentReportByCommentOwner,
        deleteCommentReport } = require('./commentReportOperations.js');


const { addPostReport,
        findPostReportByID,
        findPostReportsByPostIDUserID,
        findAllPostReports,
        findPostReportByReporterID,
        findPostReportByPostOwner,
        findPostReportsByPostID,
        deletePostReport } = require('./postReportOperations.js');

const { addViewedRegion,
        getTotalNumberOfViewedRegions,
        getRegionViewsByPostIDUserID,
        getRegionViewsByPostID } = require('./viewedRegionOperations.js');

const { addPaymentHistory,
        getAllPaymentTransactions } = require('./paymentHistoryOperations.js');


const { addPostCategory,
        getAllPostCategoriesByPostID,
        removePostCategoriesByPostID } = require('./postCategory.js');


module.exports = {
    /*
        functii pentru cloud
    */
    addImageInCloud,
    downloadImageFromCloud,
    deleteImageFromCloud,

    /*
        functii pentru comentarii
    */
    findCommentByID,
    findCommentsByPostID,
    addComment,
    updateComment,
    deleteComment,

    /*
        functii pentru followeri
    */
    findFollowersByID,
    findFollowingByID,
    followExists,
    addFollower,
    deleteFollower,

    /*
        functii pentru hashtag-uri
    */
    findHashtagByID,
    findHashtagByName,
    findHashtagsByPostID,
    hashtagExists,
    findHashtagByPartialName,
    addHashtag,
    deleteHashtag,

    /*
        functii pentru imagini
    */
    findImageByID,
    addImage,
    getAllImages,
    deleteImage,

    /*
        functii pentru like-uri
    */
    findLikeByID,
    findLikesByPostID,
    findLikesByUserID,
    findLikesByUserAndPostID,
    addLike,
    deleteLike,

    /*
        functii pentru postari
    */
    addPost,
    updatePost,
    deletePost,
    findRandomPost,
    findUserIDByUsername,
    findAllPosts,
    findPostsByUserID,
    findPostByPhotoID,
    findPostByHashtagName,
    findPostsByPostCategory,
    findPostsCountByUserID,
    findPostByID,
    findUnseenPostsFromFollowing,
    findSeenPostsFromFollowing,
    findRandomUnseenPost,


    /*
        functii pentru useri
    */
    findUserByUsername,
    findUserByID,
    findAllUsers,
    findUserByToken,
    findUsersByPartialUsername,
    findAllAdminUsers,
    findAllNonAdminUsers,
    addUser,
    updateUser,
    deleteUser,
    findUserByEmail,

    /*
        functii pentru vizualizarea postari
    */
    addViewedPost,
    getTotalNumberOfViewedPosts,
    getViewsByPostIDUserID,
    getViewsByPostID,

    /*
        functii pentru vizualizarea profilului
    */
    addViewedProfile,
    getTotalNumberOfViewedProfiles,
    getViewsByProfileIDUserID,
    getViewsByProfileID,

    /*
        functii pentru notificarile like urilor
    */
    addLikeNotification,
    findLikeNotificationByID,
    findLikeNotificationsByRecipientID,
    updateLikeNotificationStatusByID,
    deleteLikeNotification,

    /*
        functii pentru notificarile comentariilor
    */
    addCommentNotification,
    findCommentNotificationByID,
    findCommentNotificationsByRecipientID,
    updateCommentNotificationStatusByID,
    deleteCommentNotification,

    /*
        functii pentru notificarile follow-ului
    */
    addFollowNotification,
    findFollowNotificationByID,
    findFollowNotificationsByRecipientID,
    updateFollowNotificationStatusByID,
    deleteFollowNotification,


    /*
        functii pentru notificarile postarilor adaugate
    */
    addPostNotification,
    findPostNotificationByID,
    findPostNotificationsByRecipientID,
    updatePostNotificationStatusByID,
    deletePostNotification,

    /*
        functii pentru notificarile pentru raportarea unei postari
    */
    addPostReportNotification,
    findPostReportNotificationByID,
    findPostReportNotificationsByRecipientID,
    updatePostReportNotificationStatusByID,
    deletePostReportNotification,

    /*
        functii pentru notificarile pentru raportarea unui comentariu
    */
    addCommentReportNotification,
    findCommentReportNotificationByID,
    findCommentReportNotificationsByRecipientID,
    updateCommentReportNotificationStatusByID,
    deleteCommentReportNotification,

    /*
        functii pentru notificarile pentru stergerea unui comentariu/postare
    */
    addGenericNotification,
    findGenericNotificationByID,
    findGenericNotificationsByRecipientID,
    updateGenericNotificationStatusByID,
    deleteGenericNotification,

    /*
        functii pentru raportarea unui comentariu
    */
    addCommentReport,
    findCommentReportByID,
    findCommentReportsByCommentID,
    findAllCommentReports,
    findCommentReportsByCommentIDUserID,
    findCommentReportByReporterID,
    findCommentReportByCommentOwner,
    deleteCommentReport,

    /*
        functii pentru raportarea unei postari
    */
    addPostReport,
    findPostReportByID,
    findAllPostReports,
    findPostReportsByPostIDUserID,
    findPostReportsByPostID,
    findPostReportByReporterID,
    findPostReportByPostOwner,
    deletePostReport,

    /*
        functii pentru vizionarea unei regiuni
    */
    addViewedRegion,
    getTotalNumberOfViewedRegions,
    getRegionViewsByPostIDUserID,
    getRegionViewsByPostID,

    /*
        functii pentru tranzactii
    */
    addPaymentHistory,
    getAllPaymentTransactions,

    /*
        functii pentru categoriile postarilor
    */
    addPostCategory,
    getAllPostCategoriesByPostID,
    removePostCategoriesByPostID
};
