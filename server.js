const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('User terhubung: ' + socket.id);

    // Ketika user masuk ke ruang obrolan (room)
    socket.on('join-room', (roomId, user) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', socket.id, user.name);

        // Fitur Kirim Pesan
        socket.on('chat-message', (data) => {
            io.to(roomId).emit('chat-message', data);
        });

        // Signaling untuk Video Call (PeerJS ID)
        socket.on('call-user', (data) => {
            socket.to(roomId).emit('incoming-call', data);
        });

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', socket.id);
        });
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server aktif di port ${PORT}`);
});