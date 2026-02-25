require('dotenv').config({ path: './backend/server/.env' });

const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const { paymentConfirmed } = require('./controller/paymentController');

//require('dotenv').config({ path: '../../.env' });


const app = express();

app.post(
    `${process.env.API_PATH_PREFIX}/payment/confirm`,
    bodyParser.raw({ type: 'application/json' }),
    (req, res, next) => {
        console.log('🔔 [webhook] got a request, headers:', req.headers);
        next();
    },
    paymentConfirmed
);


app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());

app.use(cors({ origin: "*" }));


const { commentRoutes,
        followRoutes,
        hashtagRoutes,
        imageRoutes,
        likeRoutes,
        postRoutes,
        registerRoutes,
        emailVerificationRoutes,
        viewedPostRoutes,
        viewedRegionRoutes,
        changePasswordRoutes,
        notificationRoutes,
        checkIntegrityRoutes,
        paymentRoutes,
        postReportRoutes,
        commentReportRoutes,
        paymentHistoryRoutes,
        viewedProfileRoutes,
        userRoutes } = require('./routes');



/*
    se initializeaza conexiunea la cloud
*/
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
});


/*
    se seteaza toate rutele
*/
app.use(process.env.API_PATH_PREFIX + "/user", userRoutes);
app.use(process.env.API_PATH_PREFIX + "/comment", commentRoutes);
app.use(process.env.API_PATH_PREFIX + "/follow", followRoutes);
app.use(process.env.API_PATH_PREFIX + "/hashtag", hashtagRoutes);
app.use(process.env.API_PATH_PREFIX + "/post", postRoutes);
app.use(process.env.API_PATH_PREFIX + "/like", likeRoutes);
app.use(process.env.API_PATH_PREFIX + "/image", imageRoutes);
app.use(process.env.API_PATH_PREFIX + "/auth", registerRoutes);
app.use(process.env.API_PATH_PREFIX + "/validate/email", emailVerificationRoutes);
app.use(process.env.API_PATH_PREFIX + "/viewedPost", viewedPostRoutes);
app.use(process.env.API_PATH_PREFIX + "/viewedRegion", viewedRegionRoutes);
app.use(process.env.API_PATH_PREFIX + "/viewedProfile", viewedProfileRoutes);
app.use(process.env.API_PATH_PREFIX + "/change/password", changePasswordRoutes);
app.use(process.env.API_PATH_PREFIX + "/notification", notificationRoutes);
app.use(process.env.API_PATH_PREFIX + "/check", checkIntegrityRoutes);
app.use(process.env.API_PATH_PREFIX + "/payment", paymentRoutes);
app.use(process.env.API_PATH_PREFIX + "/postReport", postReportRoutes);
app.use(process.env.API_PATH_PREFIX + "/commentReport", commentReportRoutes);
app.use(process.env.API_PATH_PREFIX + "/paymentHistory", paymentHistoryRoutes);


const server = http.createServer(app);

const {initSocket} = require('./utils');
initSocket(server);


const stripeListen = spawn('stripe', [
    'listen',
    '-f', `http://${process.env.BACKEND_IP_ADDRESS}:${process.env.SERVER_PORT}/api/payment/confirm`,
    '--api-key', process.env.STRIPE_SECRET_KEY
]);


stripeListen.stdout.on('data', chunk => {
    const text = chunk.toString();
    process.stdout.write(`[stripe-cli] ${text}`);
    
    const m = text.match(/(whsec_[^\s]+)/);
    if (m) {
        process.env.STRIPE_WEBHOOK_SECRET = m[1];
        console.log(`grabbed webhook secret: ${m[1]}`);
    }
});

stripeListen.stderr.on('data', d => {
    process.stderr.write(`[stripe-cli] ${d}`);
});

process.on('SIGINT', () => {
    console.log('Shutting down, killing stripe CLI...');
    stripeListen.kill('SIGINT');
    process.exit();
});
process.on('exit', () => {
    stripeListen.kill();
});



server.listen(process.env.SERVER_PORT, '0.0.0.0', () => {
    const {logSuccess, createMainAdminUser, loadSynonyms, deleteAllTokens} = require('./utils');

    

    /*
        se creaza utilizatorul admin si se incarca fisierul de sinonime
        se elimina toate token-urile din baza de date
    */
    (async () => {
        await createMainAdminUser();
        await loadSynonyms();
        await deleteAllTokens();
    })();
    

    logSuccess('SERVER: ', `Backend running at http://${process.env.BACKEND_IP_ADDRESS}:${process.env.SERVER_PORT}`);
});


