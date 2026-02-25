
const num = 1;

const numberOfOldPosts = 7;

const futurePosts = {};
const pastPosts = {};
const states = {};
const servedOldCount = {};


const FeedState = {
    NewPostsFromFollowing: 1,
    OldPostsFromFollowing: 2,
    RandomPosts: 3
};

const prefix = 'LOG(feedLogic.js): ';

/*
    functie care transforma din numar in string starea data
*/
function getStateString(state) {
    switch(state) {
        case FeedState.NewPostsFromFollowing:
            return 'Getting unseen posts from followed users';
        case FeedState.OldPostsFromFollowing:
            return 'Getting seen posts from followed users';
        case FeedState.RandomPosts:
            return 'Random unseen posts from random users';
        default:
            return 'idk';
    }
}


/**
    Advance forward in the feed.
    Buffers posts if needed, then returns the next one.
 */
async function nextFeedPost(userID) {
    const {logError, logSuccess} = require('./logConsole');

    try {
        // Initialize and preload if this is the very first call
        if (!Array.isArray(futurePosts[userID])) {
            futurePosts[userID] = [];
            pastPosts[userID] = [];
            states[userID] = FeedState.NewPostsFromFollowing;
            servedOldCount[userID] = 0;
        }

        logSuccess(prefix, `Before getting a new batch: ${getStateString(states[userID])}!`);

        // If we've drained the buffer fetch another batch
        if (futurePosts[userID].length === 0) {
            await _fetchNextBatch(userID);
        }

        logSuccess(prefix, `After getting a new batch: ${getStateString(states[userID])}!`);

        // Pull the next post off the front
        const post = futurePosts[userID].shift() || null;

        if (post) {
            pastPosts[userID].unshift(post);
        }
        return post;
    } catch (err) {
        logError(prefix, `Eroare la cautarea urmatoarei postari: ${err}`);
        return null;
    }

}

/*
    functie care returneaza urmatorul grup de postari in functie de starea care este
*/
async function _fetchNextBatch(userID) {
    const {logError} = require('./logConsole');
    const {
        findUnseenPostsFromFollowing,
        findSeenPostsFromFollowing,
        findRandomUnseenPost } = require('../../database/operations');

    let batch = [];

    // TOTO check: Eroare la extragerea urmatoarelor 1 postari: Error: WHERE parameter "id" has invalid "undefined" value
    try {
        switch (states[userID]) {
            case FeedState.NewPostsFromFollowing:
              batch = await findUnseenPostsFromFollowing(userID, num);
              if (batch.length < num) {
                  states[userID] = FeedState.OldPostsFromFollowing;

                  if (batch.length === 0) {
                    await _fetchNextBatch(userID);
                  }
              }
              break;
        
            case FeedState.OldPostsFromFollowing:
              const already = servedOldCount[userID] || 0;
              const remaining = Math.min(num, numberOfOldPosts - already);
      
              if (remaining > 0) {
                  batch = await findSeenPostsFromFollowing(userID, remaining, already);
                  servedOldCount[userID] = already + batch.length;
              }
      
              if (servedOldCount[userID] >= numberOfOldPosts || batch.length < remaining) {
                  states[userID] = FeedState.RandomPosts;
              }

              if (batch.length === 0) {
                    await _fetchNextBatch(userID);
              }

              break;
        
            case FeedState.RandomPosts:
              batch = await findRandomUnseenPost(userID, num);
              break;
          }
        
          if (batch.length) {
                const seenIds = new Set([
                    ...pastPosts[userID].map(p => p.id),
                    ...futurePosts[userID].map(p => p.id)
                ]);
        
                // filter out anything with a duplicate ID
                const uniqueBatch = batch.filter(post => !seenIds.has(post.id));

                if (uniqueBatch.length === 0) {
                    if (states[userID] === FeedState.NewPostsFromFollowing) {
                        states[userID] = FeedState.OldPostsFromFollowing;
                        await _fetchNextBatch(userID);
                    } else if (states[userID] === FeedState.OldPostsFromFollowing) {
                        states[userID] = FeedState.RandomPosts;
                        await _fetchNextBatch(userID);
                    }
                }

                // push only the "new" items
                futurePosts[userID].push(...uniqueBatch);
          }
    } catch(err) {
        logError(prefix, `Eroare la extragerea urmatoarelor ${num} postari: ${err}`);
        return null;
    }
}

/*
    functie care goleste feed-ul pentru userul dat
*/
async function deleteFeedHistory(userID) {
    const {logSuccess} = require('./logConsole');

    futurePosts[userID] = [];
    pastPosts[userID] = [];
    states[userID] = FeedState.NewPostsFromFollowing;
    servedOldCount[userID] = 0;

    logSuccess(prefix, `The history has been deleted!`);
}

module.exports = {
    nextFeedPost,
    deleteFeedHistory
};
