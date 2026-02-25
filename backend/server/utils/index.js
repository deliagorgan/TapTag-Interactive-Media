const {sendEmail} = require('./emailOperations.js');

const {isValid, transformHashtags, sendPostNotificationToAllFollowers, createMainAdminUser, deleteAllTokens} = require('./utils.js');

const {extractData, insertAndCheckData, modifyData} = require('./metadataManipulation.js');

const {logError, logSuccess} = require('./logConsole.js');

const {nextPost} = require('./randomPostLogic.js');

const {
    nextFeedPost,
    deleteFeedHistory } = require('./feedLogic.js');

const {initSocket, getIo, sendNotificationToUser} = require('./socketOperations.js');

const {checkTextForBannedWords} = require('./validateTextContent.js');

const {isURLSafe} = require('./checkURL.js');

const {loadSynonyms, classifyText} = require('./chooseCategory.js');


module.exports = {
    sendEmail,
    isValid,
    extractData,
    insertAndCheckData,
    modifyData,
    logError,
    logSuccess,
    transformHashtags,
    nextPost,
    initSocket,
    getIo,
    sendNotificationToUser,
    checkTextForBannedWords,
    createMainAdminUser,
    isURLSafe,
    sendPostNotificationToAllFollowers,
    nextFeedPost,
    loadSynonyms,
    classifyText,
    deleteFeedHistory,
    deleteAllTokens,
};