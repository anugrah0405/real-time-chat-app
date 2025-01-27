import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const users = new Map();
const chatRooms = new Map();

// Helper function to emit updated user list to all clients
const emitUpdatedUserList = () => {
  const userList = Array.from(users.entries()).map(([username, data]) => ({
    username,
    online: data.online
  }));
  io.emit('userList', userList);
};

// User authentication
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (users.has(username)) {
    res.status(400).json({ error: 'Username already taken' });
  } else {
    users.set(username, { online: true });
    res.json({ username });
    emitUpdatedUserList();
  }
});

io.on('connection', (socket) => {
  let user;

  socket.on('login', (username) => {
    user = username;
    if (!users.has(username)) {
      users.set(username, { online: true });
    } else {
      users.get(username).online = true;
    }
    users.get(username).socketId = socket.id;
    emitUpdatedUserList();
  });

  socket.on('joinRoom', (room) => {
    if (user) {
      socket.join(room);
      if (!chatRooms.has(room)) {
        chatRooms.set(room, new Set());
      }
      chatRooms.get(room).add(user);
      io.to(room).emit('userJoined', { username: user, room });
    }
  });

  socket.on('leaveRoom', (room) => {
    if (user && chatRooms.has(room)) {
      socket.leave(room);
      chatRooms.get(room).delete(user);
      io.to(room).emit('userLeft', { username: user, room });
    }
  });

  socket.on('chatMessage', ({ room, message }) => {
    if (user) {
      io.to(room).emit('message', { username: user, message });
    }
  });

  socket.on('typing', (room) => {
    if (user) {
      socket.to(room).emit('userTyping', user);
    }
  });

  socket.on('stopTyping', (room) => {
    if (user) {
      socket.to(room).emit('userStoppedTyping', user);
    }
  });

  socket.on('logout', (username) => {
    if (users.has(username)) {
      users.get(username).online = false;
      emitUpdatedUserList();
    }
  });

  socket.on('disconnect', () => {
    if (user) {
      const userObj = users.get(user);
      if (userObj) {
        userObj.online = false;
        emitUpdatedUserList();
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log('Server is ready to accept connections');