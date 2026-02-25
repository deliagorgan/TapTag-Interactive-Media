const { Server } = require('socket.io');
const jwt = require('jsonwebtoken'); 

const prefix = "LOG(socketOperations): ";

let io = null;



/*
    Tipuri de notificari:
    1) LIKE la postarea mea
    2) FOLLOW
    3) COMENTARII la postarea mea
    4) POSTARE A UNEI PERSOANE URMARITE
*/


/*
    functie care initializeaza o conexiune cu frontend-ul pentru a putea
    trimite notificari
*/
function initSocket(server) {
    io = new Server(server, {
        cors: {
        origin: '*',
        methods: ['GET','POST', 'PUT', 'DELETE']
        }
    });
  
    io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Auth error: no token provided'));
      }
    
      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return next(new Error('Auth error: invalid token'));
      }
    
      try {
        const {findUserByToken} = require('../../database/operations');
  
        // Look up the user by the exact token string in the DB
        const user = await findUserByToken(token);
        if (!user) {
          return next(new Error('Auth error: token not found'));
        }
    
        // Attach whatever you need to the socket
        socket.userId = user.id;
        next();
      } catch (err) {
        console.error('Error in socket auth middleware:', err);
        next(new Error('Auth error'));
      }
  });
  
  io.on('connection', socket => {
        const {logSuccess} = require('./logConsole');

        const uid = socket.userId;
        socket.join(`user_${uid}`);

        logSuccess(prefix, `User ${uid} connected on socket ${socket.id}`);
    
        socket.on('disconnect', () => {
            logSuccess(prefix, `User ${uid} disconnected`);
        });
  });

  return io;
}

function getIo() {
    if (!io) throw new Error('Socket.IO not initialized! Call initSocket(server) first.');
    return io;
}
  

/*
    functie care trimite o notificare catre un user
*/
function sendNotificationToUser(userId, payload) {
    console.log(payload);
    getIo().to(`user_${userId}`).emit('notification', payload);
}

module.exports = {
    initSocket,
    getIo,
    sendNotificationToUser
  };
