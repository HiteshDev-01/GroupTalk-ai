import Socket from 'socket.io-client';

let socketInstance;

export const initializeSocket = (projectId) => {
    socketInstance = Socket(import.meta.env.VITE_API_URL, {
        auth: {
            token: localStorage.getItem("token"),
        },
        query: {
            projectId
        }
    });

    return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
    socketInstance.on(eventName, cb)
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data)
}