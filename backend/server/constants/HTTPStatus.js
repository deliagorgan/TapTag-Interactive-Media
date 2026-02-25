/*
    statusul HTTP posibil pe care il returneaza backend-ul
*/

const HTTPStatus = Object.freeze({
    OK: 200,
    BAD_REQUEST: 400, // cererea nu respecta structura API-ului
    UNAUTHORIZED: 401, // credentiale invalide
    NOT_FOUND: 404, // informatia ceruta nu exista/nu are acces
    INTERNAL_SERVER_ERROR: 500 // eroare de backend pt datale primite de le frontend
});


module.exports = HTTPStatus;
  