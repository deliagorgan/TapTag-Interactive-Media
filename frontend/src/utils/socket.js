
import { io } from 'socket.io-client';

let _socket = null;

const API = process.env.REACT_APP_BACKEND_BASE_URL;

/*
    functie care returneaza un socket daca deja exista daca nu
    creaza o noua conexiune cu backend-ul
*/
export function connect_socket() {
    if (_socket && _socket.connected) {
        return _socket;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }

    _socket = io(`${API}`, {
        auth: { token },
        transports: ['websocket'],
    });

    return _socket;
}

/*
    functie care inchide o conexiune cu backend-ul
*/
export function disconnect_socket() {
    if (_socket) {
        _socket.disconnect();
        _socket = null;
    }
}


export default connect_socket;
