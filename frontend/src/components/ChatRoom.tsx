import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { LogOut } from 'lucide-react';

interface User {
  username: string;
  online: boolean;
}

interface ChatRoomProps {
  username: string;
  room: string;
  onJoinRoom: (room: string) => void;
  onLogout: () => void;
  socket: Socket;
  users: User[];
}

function ChatRoom({ username, room, onJoinRoom, onLogout, socket, users }: ChatRoomProps) {
  const [messages, setMessages] = useState<Array<{ username: string; message: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messageEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('userJoined', ({ username, room }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { username: 'System', message: `${username} has joined ${room}` },
      ]);
    });

    socket.on('userLeft', ({ username, room }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { username: 'System', message: `${username} has left ${room}` },
      ]);
    });

    socket.on('userTyping', (typingUser) => {
      setTypingUsers((prevUsers) => new Set(prevUsers).add(typingUser));
    });

    socket.on('userStoppedTyping', (stoppedUser) => {
      setTypingUsers((prevUsers) => {
        const newUsers = new Set(prevUsers);
        newUsers.delete(stoppedUser);
        return newUsers;
      });
    });

    return () => {
      socket.off('message');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
    };
  }, [socket]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && room) {
      socket.emit('chatMessage', { room, message: inputMessage.trim() });
      setInputMessage('');
      handleStopTyping();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    handleTyping();
  };

  const handleTyping = () => {
    if (room) {
      socket.emit('typing', room);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(handleStopTyping, 1000);
    }
  };

  const handleStopTyping = () => {
    if (room) {
      socket.emit('stopTyping', room);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleLogout = () => {
    socket.emit('logout');
    onLogout();
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 bg-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <ul>
          {users.map((user) => (
            <li key={user.username} className={`mb-2 ${user.online ? 'text-green-500' : 'text-gray-500'}`}>
              {user.username} {user.online ? '(online)' : '(offline)'}
            </li>
          ))}
        </ul>
        {!room && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter room name"
              className="w-full p-2 border rounded mb-2"
              onKeyPress={(e) => e.key === 'Enter' && onJoinRoom(e.currentTarget.value)}
            />
            <button
              onClick={() => onJoinRoom('general')}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Join General Room
            </button>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center w-full"
          title="Logout"
        >
          <LogOut size={20} className="mr-2" />
          Logout
        </button>
      </div>
      <div className="w-3/4 flex flex-col">
        {room && (
          <div className="bg-blue-500 text-white p-2 text-center font-bold">
            Room: {room}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.username === username ? 'text-right' : ''}`}>
              <span className="font-bold">{msg.username}: </span>
              {msg.message}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
        {typingUsers.size > 0 && (
          <div className="text-sm text-gray-500 p-2">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        <form onSubmit={handleSendMessage} className="p-4 bg-gray-100 flex">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-grow p-2 border rounded-l"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;