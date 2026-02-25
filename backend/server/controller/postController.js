const HTTPStatus = require("../constants/HTTPStatus.js");
const { findPostByID,
        addPost: createPost,
        updatePost,
        deletePost, 
        findPostByPhotoID,
        findPostsByUserID,
        addViewedPost,
        findUserByID,
        findAllPosts,
        findRandomPost,
        addGenericNotification,
        addViewedProfile,
        findPostByHashtagName,
        addPostCategory,
        findHashtagsByPostID, 
        removePostCategoriesByPostID} = require('../../database/operations');
const { isValid } = require('../utils/utils.js');
const { sendNotificationToUser } = require('../utils/socketOperations');
const { logError, transformHashtags, logSuccess, nextPost, sendPostNotificationToAllFollowers, deleteFeedHistory, nextFeedPost, classifyText } = require('../utils');
const { UserRoles } = require('../constants/userRole.js');
const { findPostsByPostCategory, findPostsCountByUserID } = require("../../database/operations/postOperations.js");

const prefix = "LOG(postController): ";

/*
    functie care adauga o noua postare in baza de date
*/
async function addPost(req, res) {
    try {
        const {description, photoID, hashtags} = req.body;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se verifica daca mai este o postare cu aceeasi poza
        */
        let result = await findPostByPhotoID(photoID);

        if (result)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Exista deja o postare cu aceeasi imagine."});

        /*
            se prelucreaza lista de nume de hashtag-uri
        */
        const hashtagNames = await transformHashtags(hashtags);

        if (!hashtagNames)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la transformarea din nume in ID pentru hashtaguri."});

        /*
            se creaza postarea
        */
        const post = await createPost({userID: currentUserID, photoID, description}, hashtagNames);

        if (!post)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu s-a putut crea postarea"});

        /*
            se concateneaza hashtagurile si descrierea postarii
        */
        let text = description;

        for (const hashtag of hashtags)
            text = text + ' ' + hashtag.name;

        /*
            se asociaza una sau mai multe categorii pentru postarea data
        */
        const categories = await classifyText(text);

        for (const category of categories) {
            result = await addPostCategory({postID: post.id,
                category: category
            });

            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut adauga categoria"});
        }

        /*
            se creaza si se trimit notificari catre toti utilizatorii care il urmaresc pe utilizatorul care a postat
        */
        result = await sendPostNotificationToAllFollowers(currentUserID, post.id);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-au putut trimite notificari pentru postarea creata"});

        logSuccess(prefix, `Postarea a fost adaugata cu succes.`);
        return res.status(HTTPStatus.OK).json({message: "Postarea a fost adaugata."});

    } catch(err) {
        logError(prefix, `Eroare la crearea postarii: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care verifica daca utiliatorul are permisiunea de a sterge postarea
*/
async function checkDeletePermission(req, res) {
    try {
        const id = req.params.id;

        /*
           se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({permission: false, 
        message: "Token-ul este invalid!"});

        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(id);

        if (!post)
            return res.status(HTTPStatus.OK).json({permission: false, 
        message: "Postarea nu exista!"});

        /*
            se verifica daca utilizatorul poate sterge poza
            doar proprietarul si utilizatorul Admin
        */
        const currentUser = await findUserByID(currentUserID);

        if (currentUserID !== post.userID && currentUser.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.OK).json( {permission: false, 
        message: "Nu ai acces la aceasta postare!"});


        return res.status(HTTPStatus.OK).json({permission: true});

    } catch(err) {
        logError(prefix, `Eroare la crearea postarii: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({permission: false,
            message: err.message});
    }
}

/*
    functie care returneaza toate postarile din sistem
*/
async function getAllPosts(req, res) {
    try {
        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});


        /*
            se verifica daca userul este admin
        */
        const currentUser = await findUserByID(currentUserID);

        if (currentUser.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Utilizatorul nu are acces. Nu este ADMIN." });

        /*
            se extrag postarile
        */
        const posts = await findAllPosts();

        return res.status(HTTPStatus.OK).json(posts);

    } catch (err) {
        logError(prefix, `Eroare la returnearea postarilor: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza postarea cu id-ul dat
*/
async function getPostByID(req, res) { 
    try {
        const id = req.params.id;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(id);

        if (!post)
            return res.status(HTTPStatus.NOT_FOUND).json({message: "Postarea nu exista!"});

        /*
            se adauga o vizualizare pentru postarea ceruta
        */
        const currentUser = await findUserByID(currentUserID);

        if (post.userID != currentUserID && currentUser.role != UserRoles.ADMIN) {
            const result = await addViewedPost({userID: currentUserID, postID: id});

            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-au putut updata statisticile!"});
        }

        return res.status(HTTPStatus.OK).json({ userID: post.userID,
                                                photoID: post.photoID,
                                                description: post.description,
                                                postedAt: post.postedAt, 
                                                id: post.id });

    } catch (err) {
        logError(prefix, `Eroare la returnearea postarilor: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza toate postarile care au un anumit hashtag
*/
async function getPostsByHashtag(req, res) {
    try {
        const name = req.params.name;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se extrag postarile din baza de date
        */
        const posts =  await findPostByHashtagName(name);

        if (posts.length <= 0)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu s-au putut gasi postari cu hashtag-ul dat." });

        return res.status(HTTPStatus.OK).json(posts);

    } catch(err) {
        logError(prefix, `Eroare la returnearea postarilor: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza toate postarile care au fost postate de un anumit user
    aceasta este o functie specifica unei cereri pentru a afisa profilul utilizatorului
    astfel doar aici se inregistreaza ca fiind o vizualizare pe profilul respectiv
    daca utilizatorul este ADMIN nu se inregistreaza
*/
async function getPostsByUserID(req, res) {
    try {
        const userID = req.params.userID;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se extrag postarile
        */
        const posts = await findPostsByUserID(userID);

        if (!posts)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu s-au putut gasi postarile." });

        /*
            se adauga vizualizare pentru profilul cerut se verifica ca nu este ADMIN
        */
        const currentUser = await findUserByID(currentUserID);
        
        if (userID != currentUserID && currentUser.role != UserRoles.ADMIN) {
            const result = await addViewedProfile({userID: currentUserID, profileID: userID});

            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-au putut updata statisticile!"});    
        }

        return res.status(HTTPStatus.OK).json(posts);

    } catch(err) {
        logError(prefix, `Eroare la returnearea postarilor: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza numarul de postari care au fost postate de un anumit user
*/
async function getPostsCountByUserID(req, res) {
    try {
        const userID = req.params.userID;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se extrage numarul de postari
        */
        const count = await findPostsCountByUserID(userID);

        return res.status(HTTPStatus.OK).json({count});

    } catch(err) {
        logError(prefix, `Eroare la returnearea postarilor: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza toate postarile care au aceleasi categorii ca
    textul primit ca input
*/
async function getPostsByText(req, res) {
    try {
        const {text} = req.body;

        logSuccess(prefix, text);

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se extrag categoriile pe baza textului
        */
        const categories = await classifyText(text);

        logSuccess(prefix, categories);

        /*
            se extrag postarile care au cel putin una dintre categorii
        */
        let posts = [];

        for (const category of categories) {
            const result = await findPostsByPostCategory(category);

            posts.push(...result);
        }
        
        /*
            se elimina postarile duplicate
        */
        const seen = new Set();

        const uniquePosts = posts.filter(post => {

            if (seen.has(post.id))
                return false;

            seen.add(post.id);

            return true;
        });

        return res.status(HTTPStatus.OK).json(uniquePosts);

    } catch(err) {
        logError(prefix, `Eroare la returnearea postarilor: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care extrage o postare random din baza de date
*/
async function getRandomPost(req, res) {
    try {
        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se extrage postarea
        */
        const post = await nextPost({
            userID: currentUserID
        });

        if (!post)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ message: "Nu s-au putut gasi postarile." });

        /*
            se adauga o vizualizare pentru postarea ceruta doar data utilizatorul un este cel care a postat
            postarea
        */
        if (currentUserID != post.id) {
            const result = await addViewedPost({userID: currentUserID, postID: post.id});

            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-au putut updata statisticile!"});
        }

        return res.status(HTTPStatus.OK).json(post);

    } catch(err) {
        logError(prefix, `Eroare la returnearea postarilor: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care extrage o postare pentru feed pe baza logicii prezentate in feedLogic.js
*/
async function getNextFeedPost(req, res) {
    try {
        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se extrage postarea
        */
        const post = await nextFeedPost(currentUserID);


        /*
            se adauga o vizualizare pentru postarea ceruta doar daca utilizatorul nu este cel care a adaugat
            postarea
        */
        if (post && currentUserID != post.userID) {
            const result = await addViewedPost({userID: currentUserID, postID: post.id});

            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-au putut updata statisticile!"});
        }

        return res.status(HTTPStatus.OK).json(post);

    } catch(err) {
        logError(prefix, `Eroare la returnearea postarilor pentru feed: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care reseteaza feed-ul
*/
async function resetFeed(req, res) {
    try {

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se extrage postarea
        */
        await deleteFeedHistory(currentUserID);

        return res.status(HTTPStatus.OK).json({message: "Feed-ul s-a resetat cu succes!"});

    } catch(err) {
        logError(prefix, `Eroare la resetarea feed-ului: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care updateaza postarea cu id-ul dat
    se primeste token ul in header, iar descrierea ca json
*/
async function updatePostByID(req, res) {
    try {
        const id = req.params.id;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(id);

        if (!post)
            return res.status(HTTPStatus.NOT_FOUND).json({message: "Postarea nu exista!"});

        /*
            se verifica daca utilizatorul poate modifica postarea
            doar daca este proprietarul
        */

        if (currentUserID !== post.userID)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu ai acces la aceasta postare!"});

        /*
            se modifica postarea
        */
        const description = req.body.description;

        let result = await updatePost(id, { description: description });

        /*
            se concateneaza hashtagurile si descrierea postarii
        */
        let text = description;
        const hashtags = await findHashtagsByPostID(id);

        for (const hashtag of hashtags)
            text = text + ' ' + hashtag.name;

        /*
            se asociaz una sau mai multe categorii pentru postarea data
        */
        console.log(text);
        const categories = await classifyText(text);
        console.log(categories);

        /* 
        sterg categoriile existente 
        */
        await removePostCategoriesByPostID(id);

        for (const category of categories) {
            result = await addPostCategory({postID: id,
                category: category
            });

            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut adauga categoria"});
        }

        if (!result)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu s-a putut updata postarea!"});

        return res.status(HTTPStatus.OK).json({message: "Postarea a fost updata cu succes!"});

    } catch (err) {
        logError(prefix, `Eroare la modificarea postarii: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }

}


/*
    functie care sterge postarea cu id-ul dat
    se primeste token in header si id-ul din params
*/
async function deletePostByID(req, res) {
    try {
        const id = req.params.id;

         /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token-ul este invalid!"});

        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(id);

        if (!post)
            return res.status(HTTPStatus.NOT_FOUND).json({message: "Postarea nu exista!"});

        /*
            se verifica daca utilizatorul poate sterge poza
            doar proprietarul si utilizatorul Admin
        */
        const currentUser = await findUserByID(currentUserID);

        if (currentUserID !== post.userID && currentUser.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Nu ai acces la aceasta postare!"});

        /*
            se extrage autorul postarii
        */
        const postAuthor = await findUserByID(post.userID);

        /*
            se sterge postarea
        */
        result = await deletePost(id);

        if (!result)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu s-a putut sterge postarea!"});

        logSuccess(prefix, `Post deleted.`);

        /*
            daca postarea este stearsa de proprietar nu se mai trimite notificare
        */
        if (currentUserID === post.userID)
            return res.status(HTTPStatus.OK).json({message: "Postarea a fost stearsa cu succes!"});

        /*
            se creaza o notificare catre persoana care a adaugat postarea
        */
        const notification = await addGenericNotification({
            recipientID: post.userID,
            text: `A post added by you has been deleted by an admin!`
        });

        if (!notification)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la crearea notificarii."});

        /*
            se trimite catre frotend notificarea prin socket
        */
        sendNotificationToUser(post.userID, {
            type: 'generic',
            notificationID: notification.id,
            text: `A post added by you has been deleted by an admin!`,
            createdAt: notification.createdAt
        });


        return res.status(HTTPStatus.OK).json({message: "Postarea a fost stearsa cu succes!"});

    } catch (err) {
        logError(prefix, `Eroare la stergerea postarii: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }

}



/*
    functie care sterge o postare raportata
    doar un utilizator admin poate face asta
*/
async function deleteReportedPostByID(req, res) {
    try {
        const postID = req.params.postID;
        const reporterID = req.params.reporterID;

        /*
            se verifica daca token-ul exista sau este valid
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });
    
        /*
            se verifica daca utilizatorul care a facut cerere este admin
        */
        const user = await findUserByID(userID);

        if (user.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Nu esti admin!" });

        /*
            se verifica daca postarea exista
        */
        const post = await findPostByID(postID);

        if (!post)
            return res.status(HTTPStatus.NOT_FOUND).json({ message: "Nu exista o postare cu acest ID!" });

        /*
            se extrage utilizatorul care a adaugat postarea
        */
        const author = await findUserByID(post.userID);
    
        /*
            se sterge postarea
        */
        const result = await deletePost(postID);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la stergerea postarii."});

        /*
            se trimite o notificare catre persoana care a dat report-ul
        */
        let notification = await addGenericNotification({
            recipientID: reporterID,
            text: `The post you reported and posted by ${author.username} has been deleted!`
        });

        if (!notification)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la crearea notificarii."});

        /*
            se trimite catre frotend notificarea prin socket
        */
        sendNotificationToUser(reporterID, {
            type: 'generic',
            notificationID: notification.id,
            text: `The post you reported and posted by ${author.username} has been deleted!`,
            createdAt: notification.createdAt
        });

        /*
            se trimite o notificare catre persoana care adaugat postarea
        */
        notification = await addGenericNotification({
            recipientID: author.id,
            text: `A post added by you has been deleted by an admin!`
        });

        if (!notification)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Eroare la crearea notificarii."});

        /*
            se trimite catre frotend notificarea prin socket
        */
        sendNotificationToUser(author.id, {
            type: 'generic',
            notificationID: notification.id,
            text: `A post added by you has been deleted by an admin!`,
            createdAt: notification.createdAt
        });
        

        logSuccess(prefix, `Post deleted.`);

        return res.status(HTTPStatus.OK).json({message: `Post deleted with id ${postID}`});
    } catch (err) {
        logError(prefix, `Error while deleting post: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

module.exports = {
    getPostByID,
    getAllPosts,
    getRandomPost,
    updatePostByID,
    getPostsByHashtag,
    getPostsByUserID,
    deletePostByID,
    checkDeletePermission,
    getPostsByText,
    getNextFeedPost,
    resetFeed,
    deleteReportedPostByID,
    getPostsCountByUserID,
    addPost
};
