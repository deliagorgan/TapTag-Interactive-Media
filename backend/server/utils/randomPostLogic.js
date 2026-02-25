const num = 5;

const posts = {};
const states = {};

const prefix = 'LOG(randomPostLogic.js): ';

/*
    functie care adauga  

async function fetchNewFromFeed(userID) {
    const { findUnseenFromFollowing,
            findViewedFromFollowing,
            findRandomUnseen } = require('../../database/operations');
    let batch = [];
  
    switch (states[userID]) {
      case FeedState.New:
        // 1) fetch unseen from following
        batch = await findUnseenFromFollowing(userID, num);
        if (batch.length < num) {
          // move to next state if we didn't fill the batch
          states[userID] = FeedState.Old;
        }
        break;
  
      case FeedState.Old:
        // 2) fetch already viewed (up to 15 total) from following
        batch = await findViewedFromFollowing(userID, num);
        // after we've handed out 15 viewed posts once, move on
        if (batch.length < num) {
          states[userID] = FeedState.Random;
        }
        break;
  
      case FeedState.Random:
        // 3) fetch completely random unseen
        batch = await findRandomUnseen(userID, num);
        break;
    }
  
    // enqueue whatever we got
    if (Array.isArray(batch) && batch.length > 0) {
      posts[userID].push(...batch);
    }
  }*/

/*
    functie care returneaza postarea vazuta inaintea celei date
*/
async function previousPost(userID, postID) {
    const {logError} = require('./logConsole.js');

    try {
        /*
            se verifica daca lista nu a fost initializata pentru
            acest user
        */
        if (!Array.isArray(posts[userID])) {
            return null;
        }

        /*
            se verifica daca mai sunt postari generate din trecut
        */
        if (posts[userID].length === 0)
            return null;

        return posts[userID].shift();

    } catch(err) {
        logError(prefix, `Eroare la alegerea urmatoarelor ${num} postari: ${err}`);
        return null;
    }
}


/*
    functie care extrage urmatoarele num postari
    pe baza algoritmului de recomandare
*/
async function nextPost(input, isFeed = false) {
    const {logError} = require('./logConsole.js');

    const {userID} = input;

    try {
        /*
            se verifica daca lista nu a fost initializata pentru
            acest user
        */
        if (!Array.isArray(posts[userID])) {
            posts[userID] = []; 

            if (isFeed) {
                states[userID] = FeedState.NewPostsFromFollowing;
            }
        }

        /*
            se verifica daca mai sunt postari generate din trecut
        */
        if (posts[userID].length === 0)
            await fetchNew(input, fromFollowing);

        return posts[userID].shift();

    } catch(err) {
        logError(prefix, `Eroare la alegerea urmatoarelor ${num} postari: ${err}`);
        return null;
    }
}

async function fetchNew(input, isFeed) {
    const {logError, logSuccess} = require('./logConsole.js');

    const {userID, hashtags} = input;

    try {
        const {findRandomPost, } = require('../../database/operations');

        /*
            se primesc postari random pana apare una noua
            nevizualizata
        */
        for (let i = 0; i < num; i++) {
            /*
                TODO verifica daca imaginea este postata de utiliatorul curent
            */

            /*
                se verifica daca se doreste o postare random dintre persoanele urmarite sau nu
            */
            if (isFeed) {
                const newPost = await findRandomPost(userID);
                posts[userID].push(newPost); 
            } else {
                const newPost = await findRandomPost(userID);
                posts[userID].push(newPost);
            }
        }

    } catch(err) {
        logError(prefix, `Eroare la alegerea noilor postari: ${err}`);
        return null;
    }
}


async function deleteHistory(userID) {

    posts[userID] = [];
    states[userID] = null;

}



module.exports = {
    nextPost,
    previousPost
};