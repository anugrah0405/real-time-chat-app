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
    <div className="flex h-screen bg-gray-50">
      <aside className="w-72 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Users</h2>
            <p className="text-xs text-gray-500">{users.filter(u => u.online).length} online</p>
          </div>
        </div>
        <ul className="space-y-2 overflow-auto pr-2">
          {users.map((user) => (
            <li key={user.username} className="flex items-center justify-between text-sm bg-gray-50 hover:bg-gray-100 rounded-md px-3 py-2">
              <span className="truncate">{user.username}</span>
              <span className={`ml-2 inline-flex items-center text-xs ${user.online ? 'text-green-600' : 'text-gray-400'}`}>
                <span className={`w-2 h-2 rounded-full mr-1 ${user.online ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                {user.online ? 'online' : 'offline'}
              </span>
            </li>
          ))}
        </ul>
        {!room && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter room name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
              onKeyDown={(e) => e.key === 'Enter' && onJoinRoom((e.target as HTMLInputElement).value)}
            />
            <button
              onClick={() => onJoinRoom('general')}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 active:bg-blue-800 transition"
            >
              Join General Room
            </button>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="mt-auto p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center w-full"
          title="Logout"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="font-semibold">{room ? `# ${room}` : 'Choose or create a room'}</div>
          <div className="text-sm text-gray-500">Signed in as <span className="font-medium text-gray-700">{username}</span></div>
        </header>
        <div className={`flex-1 overflow-y-auto p-4 space-y-3${typingUsers.size > 0 ? ' pb-12' : ''}`}>
          {messages.map((msg, index) => {
            const isSelf = msg.username === username;
            return (
              <div key={index} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[72%] rounded-2xl px-4 py-2 shadow-sm ${isSelf ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>
                  <div className={`text-xs mb-0.5 ${isSelf ? 'text-blue-100' : 'text-gray-500'}`}>{msg.username}</div>
                  <div className="whitespace-pre-wrap break-words">{msg.message}</div>
                </div>
              </div>
            );
          })}
          <div ref={messageEndRef} />
        </div>
        {typingUsers.size > 0 && (
          <div className="px-4 pb-1 bg-gray-50 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 shadow-sm">
              <span className="truncate max-w-[50vw]">{Array.from(typingUsers).join(', ')}</span>
              <span>{typingUsers.size === 1 ? 'is typing' : 'are typing'}</span>
              <span className="flex items-center gap-1 ml-1">
                <span className="typing-dot inline-block w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                <span className="typing-dot inline-block w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                <span className="typing-dot inline-block w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
              </span>
            </div>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder={room ? 'Type a message…' : 'Join a room to start chatting'}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            disabled={!room}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!room || !inputMessage.trim()}
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

export default ChatRoom;