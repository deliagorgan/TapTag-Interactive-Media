import axios from "axios";

const API = process.env.REACT_APP_BACKEND_BASE_URL;

/*
    functie care returneaza true daca utilizatorul respectiv poate sterge postarea
*/
export async function canDeletePost(postID) {
    try {

        const result = await axios.delete(
            `${API}/api/post/permission/delete/${postID}/`,
            {
            }
        );

        return result.data.permission;

    } catch(err) {
        return false;
    }
}


/*
    functie care returneaza true daca utilizatorul respectiv poate sterge comentariul
*/
export async function canDeleteComment(postID, commentID) {
    try {

        const result = await axios.delete(
            `${API}/api/comment/permission/delete/${postID}/${commentID}/`,
            {
            }
        );

        return result.data.permission;

    } catch(err) {
        return false;
    }
}
