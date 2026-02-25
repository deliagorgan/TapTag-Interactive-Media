const { sequelize, Post, Hashtag, User, ViewedPost, Follower, PostCategory, ViewedRegion } = require('../models');
const { logError, logSuccess } = require('../../server/utils');
const { Sequelize, Op } = require('sequelize');

const prefix = "LOG(postOperations.js): ";

/*
    functie care adauga o noua postare
*/
async function addPost(post, hashtagIDs) {
    try {
        const newPost = await Post.create({
            userID: post.userID,
            photoID: post.photoID,
            description: post.description
        });

        logSuccess(prefix, hashtagIDs);

        await newPost.addHashtags(hashtagIDs);

        if (!newPost)
            return null;

        logSuccess(prefix, `Post added with ID: ${newPost.id}`);
        return newPost;
    } catch (err) {
        logError(prefix,`'Error adding post: ${err}.`);
        return null;
    }
}

/*
    functie care cauta postare dupa id
    returneaza si userul care a adaugat-o
*/
async function findPostByID(id) {
    try {

        return await Post.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'profilePhotoID']
                }
            ]
        });

    } catch (err) {
        logError(prefix, `Error while searching for post: ${err}.`);
        return null;
    }
}


/*
    functie care cauta postare dupa id-ul pozei folosite
*/
async function findPostByPhotoID(photoID) {
    try {

        return await Post.findOne({
            where: {photoID: photoID}
        });

    } catch (err) {
        logError(prefix, `Error while searching for post: ${err}.`);
        return null;
    }
}


/*
    functie care intoarce o poastare random
    TODO: sa caute in baza de date si sa aleaga doar acele postari pe care
    le poate vedea utilixatorul
*/
async function findRandomPost(userID) {
    try {
        let randomPost = null;

        const minMaxIds = await Post.findOne({
            attributes: [
                [Sequelize.fn('MIN', Sequelize.col('id')), 'minId'],
                [Sequelize.fn('MAX', Sequelize.col('id')), 'maxId'],
            ],
            raw: true,
        });

        const { minId, maxId } = minMaxIds;

        /*
            se verifica daca exista postari in baza de date
        */
        if (minId === null || maxId === null) {
            logError(prefix, "Nu exista postari in baza de date.");
            return null;
        }

        /*
            se genereaza un ID random
        */
        const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;

        /*
            TODO se verifica daca postarea poate fi vizualizata daca nu se reia pasul anterior
        */

        /*
            se extrage postarea cu ID-ul ales
        */
        randomPost = await Post.findOne({
            where: {
                id: randomId,
            },
        });

        return randomPost;
    } catch (err) {
        logError(prefix, `Error while finding random post: ${err}.`);
        return null;
    }
}


/*
    functie care extrage postarile nevizionate adaugate de persoanele urmarite
*/
async function findUnseenPostsFromFollowing(userID, limit) {
    /*
        se extrag utilizatorii pe care ii urmareste
    */
    const follows = await Follower.findAll({
        where: { userID },
        attributes: ['followedUserID', 'followedAt']
    });

    if (follows.length === 0)
        return [];

    const followMap = follows.reduce((map, f) => {
        map[f.followedUserID] = f.followedAt;
        return map;
        }, {});

    /*
        se extrag postarile pe care utilizatorul le a vazut
    */
    const viewed = await ViewedPost.findAll({
        where: { userID },
        attributes: ['postID']
    });
    const viewedIds = viewed.map(v => v.postID);

    const candidates = await Post.findAll({
        where: {
          userID:   { [Op.in]: follows.map(f => f.followedUserID) },
          id:       viewedIds.length ? { [Op.notIn]: viewedIds } : undefined
        },
        order: [['postedAt', 'DESC']],
        limit
      });

    return candidates.filter(post =>
        post.postedAt > followMap[post.userID]
    );

      /*
    return Post.findAll({
        where: {
            [Op.and]: [
                { userID: { [Op.in]: followingIds } },
                { userID: { [Op.ne]: userID } },
                ...(viewedIds.length ? [{ id: { [Op.notIn]: viewedIds } }] : [])
            ]
        },
        order: [['postedAt', 'DESC']],
        limit
    });*/
}


/*
    functie care extrage postarile vizionate de la utilizatorii pe care ii urmareste
*/
async function findSeenPostsFromFollowing(userID, limit, offset = 0) {
    try {
        // a) Which users are followed?
        const follows = await Follower.findAll({
            where: { userID },
            userID: { [Op.ne]: userID },
            attributes: ['followedUserID']
        });
        const followingIds = follows.map(f => f.followedUserID);
        if (followingIds.length === 0) return [];
        
        // b) Which posts have been viewed?
        const viewed = await ViewedPost.findAll({
            where: { userID },
            attributes: ['postID']
        });
        const viewedIds = viewed.map(v => v.postID);
        if (viewedIds.length === 0) return [];
        

        return Post.findAll({
            where: {
                [Op.and]: [
                    { userID: { [Op.in]: followingIds } },
                    { userID: { [Op.ne]: userID } },
                    { id: { [Op.in]: viewedIds } }
                ]
            },
            order: [['postedAt', 'DESC']],
            limit,
            offset
        });
    } catch(err) {
        logError(prefix, `Eroare la extragerea postarilor vechi ale persoanelor urmarite ${err}!`);
        return null;
    }
}


/*
    functie care returneaza postarile random nevizionate
*/
async function findRandomUnseenPost(userID, limit) {
    try {
        const viewed = await ViewedPost.findAll({
            where: { userID },
            userID: { [Op.ne]: userID },
            attributes: ['postID']
        });
        const viewedIds = viewed.map(v => v.postID);


        return Post.findAll({
            where: {
                [Op.and]: [
                    { userID: { [Op.ne]: userID } },
                    ...(viewedIds.length ? [{ id: { [Op.notIn]: viewedIds } }] : [])
                ]
            },
            order: Sequelize.literal('RAND()'),
            limit
        });
    } catch(err) {
        logError(prefix, `Eroare la returnarea postarilor random nevizionate: ${err}`);
        return null;
    }
}

/*
    functie care returneaza postarile care au id-ul intre start si end
*/
async function findAllPosts() {
    try {

        const posts = await Post.findAll({});

        return posts;

    } catch (err) {
        logError(prefix, `Error while searching for post: ${err}.`);
        return null;
    }
}

/*
    functie care returneaza toate postarile postate de un
    anumit user
*/
async function findPostsByUserID(userID) {
    try {
        return await Post.findAll({
            where: {userID: userID},
            order: [['postedAt', 'DESC']]
        });

    } catch (err) {
        logError(prefix, `Error while searching for post: ${err}.`);
        return null;
    }
}


/*
    functie care returneaza numarul de postari postate de un
    anumit user
*/
async function findPostsCountByUserID(userID) {
    try {
        const count = await Post.count({
            where: { userID }
          });
        return count;

    } catch (err) {
        logError(prefix, `Error while searching for post count: ${err}.`);
        return null;
    }
}


/*
    functie care cauta postari dupa hashtagID
*/
async function findPostsByPostCategory(category) {
    try {
        return await Post.findAll({
            include: [{
                model: PostCategory,
                as: 'categories',
                where: { category: category }
            }]
        });

    } catch (err) {
        logError(prefix, `Error while searching for post by category: ${err}.`);
        return null;
    }
}


/*
    functie care cauta postari dupa hashtagID
*/
async function findPostByHashtagName(hashtagName) {
    try {
        return await Post.findAll({
            include: [{
                model: Hashtag,
                as: 'hashtags',
                where: { name: hashtagName },  // filtrare dupa hashtagID
                attributes: [] // nu se introduc informatiile despre hashtag(este acelasi)
            }]
        });

    } catch (err) {
        logError(prefix, `Error while searching for post: ${err}.`);
        return null;
    }
}


/*
    functie care modifica o postare
*/
async function updatePost(id, updateFields) {
    try {
        const result = await Post.update(updateFields, { where: { id } });
        logSuccess(prefix, `Updated ${result[0]} user(s).`);
        return true;
    } catch (err) {
        logError(prefix, `Error updating user: ${err}.`);
        return false;
    }
}


/*
    functie care sterge o postare
*/
async function deletePost(id) {
    // try {
    //     const result = await Post.destroy({ where: { id } });
    //     logSuccess(prefix, `Post deleted.`);
    //     return true;
    // } catch (err) {
    //     logError(prefix, `Error deleting post: ${err}.`);
    //     return false;
    // }
    const t = await sequelize.transaction()
  try {
    // 1. Șterge rândurile dependente din viewedregions
    await ViewedRegion.destroy({
      where: { postID: id },
      transaction: t
    })

    // (Opțional) Dacă ai și alte asocieri, șterge-le tot aici:
    // await OtherModel.destroy({ where: { postID: id }, transaction: t })

    // 2. Șterge postarea
    const deletedCount = await Post.destroy({
      where: { id },
      transaction: t
    })

    if (deletedCount === 0) {
      // nu s-a găsit postarea
      await t.rollback()
      logError(prefix, `Post with id=${id} not found.`)
      return false
    }

    // 3. Commit dacă totul e ok
    await t.commit()
    logSuccess(prefix, `Post (id=${id}) and its dependencies deleted.`)
    return true

  } catch (err) {
    // rollback la orice eroare
    await t.rollback()
    logError(prefix, `Error deleting post: ${err}`)
    return false
  }
}

module.exports = {
    addPost,
    updatePost,
    deletePost,
    findRandomPost,
    findAllPosts,
    findPostByPhotoID,
    findUnseenPostsFromFollowing,
    findSeenPostsFromFollowing,
    findPostsByPostCategory,
    findRandomUnseenPost,
    findPostsByUserID,
    findPostByHashtagName,
    findPostsCountByUserID,
    findPostByID
};
