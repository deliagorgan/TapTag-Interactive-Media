const { findUserByID,
        findAllUsers,
        updateUser,
        deleteImageFromCloud,
        findUserIDByUsername,
        findUsersByPartialUsername,
        deleteUser,
        addUser,
        findPostsByUserID, 
        findImageByID,
        findAllNonAdminUsers,
        deletePost} = require('../../database/operations');
const HTTPStatus = require("../constants/HTTPStatus.js");
const { canAccessAllData,
        canAccessData,
        canUpdateData,
        extractModifiableFields } = require('../access_logic/userPermission.js');
const { logError, logSuccess } = require('../utils/logConsole.js');
const { isValid } = require('../utils/utils.js');
const { UserRoles } = require('../constants/userRole.js');
const bcrypt = require('bcrypt');

const prefix = "LOG(userController.js): ";


/*
    functie care adauga un utilizator admin
    doar un alt admin poate adauga alt admin
*/
async function addAdminUser(req, res) {
    try {
        /*
            se extrag campurile
        */
        const { username, password, email } = req.body;

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.HASH_NUMBER, 10));

        /*
            se verifica token-ul din header si se extrage id-ul userului asociat
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se verifica daca utilizatorul curent este admin
        */
        const user = await findUserByID(userID);

        if (user.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Doar utilizatorii admin pot adauga un alt cont!" });


        /*
            se creaza utilizatorul
        */
        const result = await addUser({
            username: username,
            firstName: 'Admin',
            lastName: 'Admin',
            email: email,
            password: hashedPassword,
            profilePhotoID: null,
            role: UserRoles.ADMIN,
            description: 'Administrator account',
            DOB: new Date('1970-01-01'),
            gender: 'OTHER'
        });

        if (!result)
            logError(prefix, `Nu s-a putut crea utilizatorul admin!`);


        /*
            se seteaza adresa de email ca fiind verificata
        */
        await updateUser(result.id, {emailVerified: 1});

        return res.status(HTTPStatus.OK).json({message: 'Utilizatorul s-a adaugat cu succes'});

    } catch(err) {
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
        logError(prefix, `Error while adding a new admin user: ${err}`);
    }
}


/*
    functie care returneaza toate informatiile userilor
    se primeste un token care trebuie sa apartina unui user Admin
    nu se trimite hash-ul parolei
*/
async function getAllUserInfo(req, res) {
    try {
        /*
            se verifica token-ul din header si se extrage id-ul userului asociat
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            Se verifica daca utilizatorul are acces la aceste informatii
        */
        const result = await canAccessAllData(userID);

        if (!result)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Nu ai inclus token/Tokenul nu este valid!"});

        /*
            nu se extrage parola
        */
        const users = await findAllUsers();

        return res.status(HTTPStatus.OK).json(users);

    } catch(err) {
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza toate informatiile userilor care nu sunt admini
    se primeste un token care trebuie sa apartina unui user admin
    nu se trimite hash-ul parolei
*/
async function getAllNonAdminUserInfo(req, res) {
    try {
        /*
            se verifica token-ul din header si se extrage id-ul userului asociat
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            Se verifica daca utilizatorul are acces la aceste informatii
        */
        const result = await canAccessAllData(userID);

        if (!result)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu ai inclus token/Tokenul nu este valid!"});

        /*
            nu se extrage parola
        */
        const users = await findAllNonAdminUsers();

        return res.status(HTTPStatus.OK).json(users);

    } catch(err) {
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care returneaza toate informatiile obiectul user cu id-ul dat
    in afara de parola si token
    doar admin si proprietarul contului au acces
*/
async function getUserInfoByID(req, res) {
    const id = req.params.id;


    try {
        /*
            se extrage token-ul din header si se verifica daca exista
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se extrag informatiile din baza de date pentru id-ul furnizat
        */
        const requestedUserInformation = await findUserByID(id);

        if (!requestedUserInformation)
            return res.status(HTTPStatus.NOT_FOUND).json({message: "Utilizatorul nu exista!"});
    
        /*
            se verifica daca utilizatorul are acces la aceste informatii
        */
        const result = await canAccessData(userID, requestedUserInformation);

        if (!result)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Nu ai acces la date"});

        /*
            se returneaza user-ul
        */
        const user = await findUserByID(id);

        if (!user)
            return res.status(HTTPStatus.NOT_FOUND).json({messafe: "Nu exista utilizatorul."});

        return res.status(HTTPStatus.OK).json({
            username: user.username, 
            firstName: user.firstName,
            lastName: user.lastName,
            profilePhotoID: user.profilePhotoID,
            role: user.role,
            email: user.email,
            description: user.description
        });
    } catch(err) {

        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care returneaza informatiile publice ale obiectul user cu id-ul dat
    orice user poate cere informatiile atata timp cat e logat
    nu se returneaza token, parola, email etc
*/
async function getUserPublicInfoByID(req, res) {
    try {
        const id = req.params.id;

        /*
            se extrage token-ul din header si se verifica daca exista
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se extrag informatiile din baza de date pentru id-ul furnizat
        */
        const user = await findUserByID(id);

        if (!user)
            return res.status(HTTPStatus.NOT_FOUND).json({message: "Utilizatorul nu exista!"});

        /*
            se returneaza doar campurile care sunt publice
        */
        return res.status(HTTPStatus.OK).json({ username: user.username, 
                                                profilePhotoID: user.profilePhotoID,
                                                role: user.role,
                                                description: user.description });

    } catch(err) {
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza informatiile publice pentru toti utilizatorii cu username-ul care incepe cu string-ul dat in cale
    orice user poate cere informatiile atata timp cat e logat
    nu se returneaza token, parola, email etc
    nu se returneaza utilizatorii admin
*/
async function getUsersPublicInfoByPartialUsername(req, res) {
    try {
        const username = req.params.username;

        /*
            se extrage token-ul din header si se verifica daca exista
        */
        const userID = await isValid(req);

        if (!userID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se extrag informatiile din baza de date pentru username-ul furnizat
        */
        const users = await findUsersByPartialUsername(username);

        /*
            se returneaza doar campurile care sunt publice
        */
        const publicUsers = users.map(u => ({
            username: u.username,
            profilePhotoID: u.profilePhotoID,
            role: u.role,
            description: u.description
        }));

        /*
            se elimina utilizatorii admin
        */
        const nonAdminUsers = publicUsers.filter(u => u.role !== UserRoles.ADMIN);

        return res.status(HTTPStatus.OK).json(nonAdminUsers);

    } catch(err) {
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care returneaza id ul user-ului primit in cale pe  baza
    username-ului acestuia
*/
async function getUserIDByUsername(req, res) {
    try {
        const username = req.params.username;
        
        /*
            se extrage token-ul din header si se verifica daca exista
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Token invalid!" });

        /*
            se extrag informatiile din baza de date pentru id-ul furnizat
        */
        const userID = await findUserIDByUsername(username);

        if (!userID)
            return res.status(HTTPStatus.NOT_FOUND).json({message: "Utilizatorul nu exista!"});

        /*
            se returneaza ID-ul
        */
        return res.status(HTTPStatus.OK).json({userID});

    } catch(err) {
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


/*
    functie care modifica datele contului cu id-ul transmise
    se primeste un JSON care contine doar campurile care trebuie sa fie modificate
    doar proprietarul poate modifica informatiile

    email-ul nu poate fi schimbat
    token-ul nu poate fi schimbat
    rolul nu poate fi schimbat
*/
async function updateUserInfoByID(req, res) {
    try {
        const id = req.params.id;

        /*
            se verifica daca token-ul exista si este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token invalid!"});

        /*
            se extrag informatiile despre utilizator
        */
        const user = await findUserByID(id);

        if (!user)
            return res.status(HTTPStatus.NOT_FOUND).json({message: "Utilizatorul nu exista!"});

        /*
            se verifica daca utilizatorul poate modifica datele
        */
        let result = await canUpdateData(currentUserID, user);
    
        if (!result)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Utilizatorul nu poate fi modificat"});

        /*
            se filtreaza din body doar campurile care pot fi modificate
        */
        const fieldsToChange = await extractModifiableFields(req.body);

        /*
            se modifica user-ul
        */
        result = await updateUser(id, fieldsToChange);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: 'Nu a putut fi modificat user-ul.'});

        return res.status(HTTPStatus.OK).json(user);
    } catch(err) {
        logError(prefix, `Eroare la modificarea datelor: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}

/*
    functie care sterge un utilizator din sistem. pentru un utilizator sters
    o sa se stearga toate postarile/imaginile, toate comentariile, toate like-urile si poza de profil

    utilizatorul Admin poate sa stearga conturi
    proprietarul poate sa stearga propriul cont
*/
async function deleteUserByID(req, res) {
    try {
        const id = req.params.id;
        const {password} = req.body;

        /*
            se verifica daca token-ul este valid
        */
        const currentUserID = await isValid(req);

        if (!currentUserID)
            return res.status(HTTPStatus.UNAUTHORIZED).json({message: "Token invalid!"});

        /*
            se extrage utilizatorul care trebuie sters
        */
        const user = await findUserByID(id);

        if (!user)
            return res.status(HTTPStatus.NOT_FOUND).json({message: "Utilizatorul nu exista."});

        /*
            se verifica daca poate sa stearga contul
        */
        const currentUser = await findUserByID(currentUserID);

        if (currentUserID != id && currentUser.role !== UserRoles.ADMIN)
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Utilizatorul nu poate sterge contul."});

        logSuccess(prefix, 'intra');

        /*
            se verifica daca parola este corecta
        */
        if (currentUserID == id && !(await bcrypt.compare(password, user.password)))
            return res.status(HTTPStatus.BAD_REQUEST).json({message: "Parola gresita!"});

        /*
            se sterg imginile din cloud
        */
        const posts = await findPostsByUserID(id);

        for (let post of posts) {
            /*
                se extrage url-ul pentru fiecare imagine
            */
            const image = await findImageByID(post.photoID);

            if (!image)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: `Nu s-a putut gasi imaginea cu id-ul dat.`});

            /*
                se sterge postarea
            */
            let result = await deletePost(post.id);

            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: `Nu s-a putut sterge postarea.`});

            /*
                se sterge imaginea
            */
            result = await deleteImageFromCloud(image.imagePath);

            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: `Nu s-a putut sterge postarea cu URL-ul: ${image.imagePath}`});
        }

        /*
            se sterge poza de profil daca exista
        */
        const profileImage = await findImageByID(user.profilePhotoID);

        console.log(profileImage);

        if (profileImage) {
            console.log(profileImage.imagePath);
            const result = await deleteImageFromCloud(profileImage.imagePath);

            if (!result)
                return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut sterge poza de profil."});
        }

        /*
            se sterge contul
        */
        const result = await deleteUser(id);

        logSuccess(prefix, result);

        if (!result)
            return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: "Nu s-a putut sterge utilizatorul."});

        return res.status(HTTPStatus.OK).json({message: "Utilizatorul a fost sters!"});

    } catch(err) {
        logError(prefix, `Eroare la stergerea unui utilizator: ${err}`);
        return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({message: err.message});
    }
}


module.exports = {
    addAdminUser,
    getAllUserInfo,
    getUserInfoByID,
    getUserPublicInfoByID,
    getUserIDByUsername,
    getUsersPublicInfoByPartialUsername,
    getAllNonAdminUserInfo,
    updateUserInfoByID,
    deleteUserByID,
};
