# Server API documentation


## <ins>Register</ins> 


#### TODO -- • POST "/api/auth/register/"
    Input: JSON {   
                    username,
                    firstName,
                    lastName,
                    password,
                    email,
                    role: {Normal/Premium},
                    DOB,
                    gender
                }
    Output: nimic


Se primesc intr-un JSON toate informatiile despre user(username parola etc).

###### <ins>IMPORTANT</ins>
    • Este folosit doar pentru creare cont Normal si Premium.




#### • POST "/api/auth/register/business/"
    Input: JSON {
                    username,
                    firstName,
                    lastName,
                    password,
                    email,
                    role: {Business},
                    DOB: Date,
                    ETC
                }
    Output: nimic

Se primesc intr-un JSON toate informatiile despre user(username parola etc), dar
si informatii suplimentare specifice contului Business.

###### <ins>IMPORTANT</ins>
    • Este folosit doar pentru creare cont Business.



#### • POST "/api/auth/login/"
    Input: JSON {
                    username,
                    email,
                    password
                }
    Output: token in header si JSON
            {
                username,
                ID
            }

Este folosita pentru logarea pe baza de username si parola. Se returneaza tokenul pe
baza caruia utilizatorul poate dovedi cine este in cererile HTTP.



#### • GET "/api/auth/logout/"
    Input: token in header
    Output: nimic

Se face logout pe baza token-ului. Token-ul este sters din baza de date.



## <ins>User</ins> 


#### • GET "/api/user/"
    Input: token in header
    Output: JSON cu toate datele tuturor utilizatorilor

Se primesc intr-un JSON toate informatiile publice si private despre toti utilizatorii

###### <ins>IMPORTANT</ins>
    • Doar utilizatorii Admin au acces.
    • Nu se trimite niciodata hash-ul parolei.
    • Nu se trimite niciodata tokenul(in cazul in care un utilizator este autentificat).



#### • GET "/api/user/profile/:id"
    Input: token in header
    Output: JSON cu toate datele userului

Are ca actiune returnarea tuturor informatiilor din baza de date a utilizatorului cu ID-ul 
dat.

###### <ins>IMPORTANT</ins>
    • User Normal/Business/Premium: are acces la propriile date
    • User Admin: are acces la datele tuturor utilizatorilor



#### • GET "/api/user/profile/preview/:id"
    Input: token in header
    Output: JSON cu datele publice ale userului

Are ca actiune returnarea informatiilor din baza de date a utilizatorului cu ID-ul cerut.
Se returneaza username, firstname, lastname, profilePhotoID, role, description


#### • GET "/api/user/id/username/:username"
    Input: token in header
    Output: JSON
    {
        userID
    }

Se returneaza ID-ul utilizatorului cu username-ul din cale.




#### • PUT "/api/user/profile/:id"
    Input: token in header si JSON
    {

    }
    Output: nimic

Se actualizeaza datele din baza de date pt utilizatorul cu id-ul dat.

###### <ins>IMPORTANT</ins>
    • Doar proprietarul poate modifica contul.(Nu si adminul)
    • Email-ul nu poate fi schimbat.
    • Rolul nu poate fi schimbat.
    • Tokenul nu poate fi schimbat.




#### • DELETE "/api/user/profile/delete/:id"
    Input: token in header
    Output: JSON
    {
        message
    }

Se sterge utilizatorul cu id-ul primit in cale si se verifica accesul pe baza
cookie-ului furnizat in header.

###### <ins>IMPORTANT</ins>
    • Utilizatorul Admin poate sterge orice cont.
    • Utilizatorul Normal poate sterge doar propriul cont.








## <ins>Post</ins>



#### • GET "/api/post/:id/"
    Input: token in header
    Output: JSON {
                    id,
                    userID,
                    photoID,
                    description,
                    postedAt
                 }

Se primesc intr-un JSON informatiile despre postarea cu id-ul dat. Se pot
cere aceste informatii de orice utilizator atata timp cat e logat.




#### • GET "/api/post/hashtag/:hashtagID/"
    Input: token in header
    Output: JSON
        [{
            id,
            userID,
            photoID,
            description,
            postedAt
        }]

Se returneaza postarile care contin un anumit hashtag. Orice
user poate sa acceseze aceste informatii.



#### • GET "/api/post/user/:userID/"
    Input: token in header
    Output: JSON
        [{
            id,
            userID,
            photoID,
            description,
            postedAt
        }]

Se returneaza postarile care sunt postate de un anumit user. Orice
user poate sa acceseze aceste informatii.


#### • POST "/api/post/all/"
    Input: token in header si JSON
    {
        start,
        stop
    }
    Output: JSON
    [
        {
            id,
            userID,
            photoID,
            description,
            postedAt
        }
    ]

Se returneaza toate postarile care au ID-ul intre start si stop.

###### <ins>IMPORTANT</ins>
    • Doar utilizatorii Admin au acces la aceste informatii.


#### • POST "/api/post/"
    Input: token in header si JSON
    {
        description,
        hashtags,
        photoID
    }
    Output: JSON
    {
        postID
    }

Se creaza o postare pe baza informatiilor furnizate in JSON. O poza nu poate sa fie
asociata cu 2 postari.


#### • GET "/api/post/home/"
    Input: token in header
    Output: JSON
    {
        userID,
        photoID,
        description,
        postedAt
    }

Se returneaza o postare cu un ID random, dar care este verificata daca poate fi
vizualizata de utilizator.(adica daca nu a vazut-o deja sau daca este propria postare)



#### • PUT "/api/post/:id"
    Input: token in header + JSON
        {
            description
        }
    Output: nimic

Se primesc intr-un JSON datele care trebuie sa fie modificate pentru postarea cu id-ul
din cale.

###### <ins>IMPORTANT</ins>
    • Doar pentru utilizatorul care a creat postarea ar treb sa returneze.



#### • DELETE "/api/post/:id"
    Input: token in header
    Output: nimic

Se sterge postarea data cu id-ul din cale.

###### <ins>IMPORTANT</ins>
    • Doar pentru proprietarul si administratorul pot sa stearga.



#### • DELETE "/api/post/permission/delete/:id"
    Input: token in header
    Output: JSON
    {
        permission
    }

Returneaza statutul OK pentru orice tip de raspuns dar in body se afla un boolean
in care se afla rezultatul operatiei.

###### <ins>IMPORTANT</ins>
    • Doar pentru proprietarul si administratorul pot sa stearga o postare.






## <ins>Comment</ins>


#### • POST "/api/comment/create"
    Input: token in header si JSON 
    {
        postID,
        text
    }
    Output: nimic

Se creaza un comentariu asociat postarii.



#### • GET "/api/comment/:postID"
    Input: token in header
    Output: JSON cu toate comentariile
    {
        userID,
        text,
        data creare
    }

Se returneaza toate comentariile de la postarea cu id-ul din cale.




#### • DELETE "/api/comment/:postID/:commentID"
    Input: token in header si JSON 
    {
        commentID
    }
    Output: nimic

Se sterge comenatriul cu ID-ul furnizat de la postarea cu id-ul din cale.

###### <ins>IMPORTANT</ins>
    • Proprietarul postarii poate sterge comentarii.
    • Proprietarul comentariului poate sa-l stearga.
    • Administratorul poate sa-l stearga.





#### • PUT "/api/comment/:postID"
    Input: token in header si JSON 
    {
        commentID,
        text
    }
    Output: nimic

Se modifica comentariul cu ID-ul furnizat de la postarea cu id-ul din cale.

###### <ins>IMPORTANT</ins>
    • Proprietarul comentariului poate sa-l modifice.
    • Administratorul poate sa-l modifice.




#### • DELETE "/api/comment/permission/delete/:postID/:commentID"
    Input: token in header
    Output: JSON
    {
        permission
    }

Returneaza statutul OK pentru orice tip de raspuns dar in body se afla un boolean
in care se afla rezultatul operatiei.

###### <ins>IMPORTANT</ins>
    • Proprietarul postarii poate sterge comentarii.
    • Proprietarul comentariului poate sa-l stearga.
    • Administratorul poate sa-l stearga.





## <ins>Like</ins>


#### • POST "/api/like/create/"
    Input: token in header si JSON 
    {
        postID
    }
    Output: nimic

Se creaza un like asociat postarii. Un user poate adauga un like o singura
data pentru o anumita postare.



#### • GET "/api/like/:postID"
    Input: token in header
    Output: JSON cu toate like-urile
    {
        id,
        postID,
        author: {
            id,
            username,
            profilePhotoID
        }
    }

Se returneaza toate like-urile de la postarea cu id-ul din cale.




#### • DELETE "/api/like/:postID"
    Input: token in header si JSON 
    {
        likeID
    }
    Output: nimic

Se sterge like-ul cu ID-ul furnizat de la postarea cu ID-ul din cale.

###### <ins>IMPORTANT</ins>
    • Doar proprietarul like-ului poate sa-l stearga.







## <ins>Image</ins>


#### • POST "/api/image/create/"
    Input: token in header si JSON 
    {
        data(base64),
        metadata:
        [
            {
                type,
                points:
                [
                    {
                        x,
                        y
                    }
                ]
            }
        ]
    }
    Output: JSON
    {
        imageID
    }

Se creaza o imagine si se adauga in cloud.

###### <ins>IMPORTANT</ins>
    • Orice user poate sa creeze o imagine.
    • Inputul este string-ul "" concatenat cu imaginea cofificata base64 


#### • GET "/api/image/:imageID"
    Input: token in header
    Output: JSON
    {
        data(base64),
        metadata:
        [
            {
                type,
                points:
                [
                    {
                        x,
                        y
                    }
                ]
            }
        ]
    }

Se returneaza imaginea cu ID-ul din cale.



#### • DELETE "/api/image/:imageID"
    Input: token in header
    Output: nimic

Se sterge imginea cu ID-ul din header.





## <ins>Follow</ins>


#### • POST "/api/follow/"
    Input: token in header si JSON 
    {
        userID
    }
    Output: nimic

Se urmareste user-ul furnizat in body de catre user-ul care este logat.





#### • GET "/api/follow/followers/:userID"
    Input: token in header
    Output: JSON
    [{
        id,
        followedUserID,
        follower: {
            id,
            username,
            profilePhotoID
        }
    }]

Se returneaza toti userii care il urmaresc pe user-ul care are id-ul in cale.





#### • GET "/api/follow/following/userID"
    Input: token in header
    Output: JSON
    {
        id,
        userID,
        followed: {
            id,
            username,
            profilePhotoID
        }
    }

Se returneaza toti userii pe care ii urmareste user-ul care are ID-ul in cale.





#### • DELETE "/api/follow/following/:userID"
    Input: token in header si JSON
    {
        userID
    }
    Output: nimic

Se sterge relatia de urmarire dintre user-ul care a trimis pachetul si user-ul
cu ID-ul din ruta.






#### • DELETE "/api/follow/userID"
    Input: token in header si JSON
    {
        userID
    }
    Output: nimic

Se sterge relatia de urmarire dintre user-ul
cu ID-ul din ruta si user-ul care a trimis pachetul.



## <ins>Hashtag</ins>



#### • DELETE "/api/hashtag/"
    Input: token in header si JSON
    {
        name
    }
    Output: nimic

Se sterge hashtag-ul alaturi de toate postarile
care il contin.

###### <ins>IMPORTANT</ins>
    • Doar utilizatorii ADMIN pot sterge hashtag-urile.
    • Pe langa postari se sterg si din cloud imaginile asociate postarilor.



#### • GET "/api/hashtag/:postID"
    Input: token in header
    Output: JSON
    [{
        id,
        name
    }]

Se returneaza toate hashtag-urile asociate unei postari.




## <ins>Email Verification</ins>


#### • DELETE "/api/validate/email/:token"
    Input: token in cale
    Output: nimic

Se verifica daca token-ul primit conincide cu cel trimis de catre backend pe adresa
de email a utilizatorului.



## <ins>Statistics</ins>

#### • GET "/api/viewedPost/post/:postID"
    Input: token in cale
    Output: JSON
    [{
        userID,
        viewedAt
    }]

Returneaza toate vizualizarile pentru o anumita postare.



## <ins>Change password</ins>


#### • POST "/api/change/password/send/email"
    Input: JSON
    {
        email
    }
    Output: nimic

Se trimite un email cu un link pentru a schimba parola utilizatorului.


#### • POST "/api/change/password/:token"
    Input: JSON
    {
        password
    }
    Output: nimic

Se schimba parola utilizatorului cu userID-ul codificat in token.


