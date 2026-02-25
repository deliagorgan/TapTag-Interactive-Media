const { PostCategory, Post } = require('../models/index.js');
const {logError, logSuccess} = require('../../server/utils');

const prefix = "LOG(postCategoryOperations.js): ";

/*
    functie care adauga o noua categorie pentru postarea data
*/
async function addPostCategory(postCategory) {
    try {
        const {category, postID} = postCategory;

        /*
            se adauga o noua categorie
        */
        const newCategory = await PostCategory.create({
            category: category,
            postID: postID
        });

        return newCategory;
    } catch (err) {
        logError(prefix, `Error adding a category toa to a post: ${err}`);
        return null;
    }
}


/*
    functie care returneaza toate categoriile pentru postarea data
*/
async function getAllPostCategoriesByPostID(postID) {
    try {

        const result = await PostCategory.findAll({
            where: { postID },
        });

        return result.length;

    } catch (err) {
        logError(prefix, `Error while searching for the categories for the given post: ${err}`);
        return null;
    }
}

async function removePostCategoriesByPostID(postID) {
    try {
        const result = await PostCategory.destroy({
            where: { postID }
        });

        return result;
    } catch (err) {
         logError(prefix, `Error while deleting categories for the given post: ${err}`);
        return null;
    }

}



module.exports = {
    addPostCategory,
    getAllPostCategoriesByPostID,
    removePostCategoriesByPostID
};
