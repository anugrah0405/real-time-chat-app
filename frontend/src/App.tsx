import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import LoginForm from './components/LoginForm';
import ChatRoom from './components/ChatRoom';

const SOCKET_SERVER_URL = (process.env.SOCKET_SERVER_URL as string) || 'http://localhost:5000';
const socket = io(SOCKET_SERVER_URL);

interface User {
  username: string;
  online: boolean;
}

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    socket.on('userList', (userList: User[]) => {
      setUsers(userList);
    });

    return () => {
      socket.off('userList');
    };
  }, []);

  const handleLogin = (user: string) => {
    setUsername(user);
    socket.emit('login', user);
  };

  const handleJoinRoom = (roomName: string) => {
    setRoom(roomName);
    socket.emit('joinRoom', roomName);
  };

  const handleLogout = () => {
    socket.emit('logout', username);
    setUsername('');
    setRoom('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-gradient-to-r from-blue-100 to-indigo-200 border border-blue-200 max-w-4xl w-full bg-white shadow-md rounded-lg overflow-hidden">
        {!username ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <ChatRoom
            username={username}
            room={room}
            onJoinRoom={handleJoinRoom}
            onLogout={handleLogout}
            socket={socket}
            users={users}
          />
        )}
      </div>
    </div>
  );
}

export default App;