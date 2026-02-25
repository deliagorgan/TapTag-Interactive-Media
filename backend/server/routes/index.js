const commentRoutes = require('./commentRoute.js');
const followRoutes = require('./followRoute.js');
const imageRoutes = require('./imageRoute.js');
const likeRoutes = require('./likeRoute.js');
const postRoutes = require('./postRoute.js');
const registerRoutes = require('./registerRoute.js');
const userRoutes = require('./userRoute.js')
const hashtagRoutes = require('./hashtagRoute.js');
const emailVerificationRoutes = require('./emailVerificationRoute.js');
const viewedPostRoutes = require('./viewedPostRoute.js');
const changePasswordRoutes = require('./changePasswordRoute.js');
const notificationRoutes = require('./notificationRoute.js');
const checkIntegrityRoutes = require('./checkIntegrityRoute.js');
const paymentRoutes = require('./paymentRoute.js');
const postReportRoutes = require('./postReportRoute.js');
const commentReportRoutes = require('./commentReportRoute.js');
const viewedRegionRoutes = require('./viewedRegionRoute.js');
const paymentHistoryRoutes = require('./paymentHistoryRoute.js');
const viewedProfileRoutes = require('./viewedProfileRoute.js');



module.exports = {commentRoutes,
                  followRoutes,
                  imageRoutes,
                  hashtagRoutes,
                  likeRoutes,
                  postRoutes,
                  registerRoutes,
                  emailVerificationRoutes,
                  viewedPostRoutes,
                  changePasswordRoutes,
                  notificationRoutes,
                  checkIntegrityRoutes,
                  paymentRoutes,
                  postReportRoutes,
                  commentReportRoutes,
                  viewedRegionRoutes,
                  paymentHistoryRoutes,
                  viewedProfileRoutes,
                  userRoutes };
