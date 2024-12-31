const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5000;

const router = require('./router');
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) { return callback(error); }

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined` });

        socket.join(user.room);
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        if (!user) {
            return callback("User not found");
        }
        if (user.room) {
           const messagewithTime={
            text:message.text,
            user:user.name,
            id:socket.id,
            time:new Date().toISOString(),
           }
        
        io.to(user.room).emit('message', messagewithTime);
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        }
        callback(); // Call the callback to acknowledge the message sent
    });
    
    
    
    socket.on('disconnect', () => {
        console.log("User has left");
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left the room.` });
        }
    });
});

app.use(router);

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
