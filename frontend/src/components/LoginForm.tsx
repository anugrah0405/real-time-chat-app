import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (username: string) => void;
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  const validateUsername = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Username is required';
    if (trimmed.length < 2) return 'Must be at least 2 characters';
    if (trimmed.length > 20) return 'Must be at most 20 characters';
    if (!/^[_A-Za-z0-9]+$/.test(trimmed)) return 'Only letters, numbers, and underscore are allowed';
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationMessage = validateUsername(username);
    if (validationMessage) {
      setTouched(true);
      setError(validationMessage);
      return;
    }
    onLogin(username.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 mx-auto w-full max-w-md">
      <div className=" p-6 mb-6 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-md mb-3 text-2xl">
            💬
          </div>
          <h2 className="text-2xl font-bold text-blue-800 leading-tight mb-1">Welcome</h2>
          <p className="text-sm">Pick a username to start chatting</p>
        </div>
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">@</span>
        <input
          type="text"
          value={username}
          onChange={(e) => {
            const val = e.target.value;
            setUsername(val);
            if (touched) {
              setError(validateUsername(val));
            }
          }}
          onBlur={() => {
            setTouched(true);
            setError(validateUsername(username));
          }}
          placeholder="e.g. alex"
          className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition ${error && touched ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
          aria-invalid={Boolean(error && touched)}
          aria-describedby={error && touched ? 'username-error' : undefined}
          required
        />
      </div>
      {error && touched ? (
        <p id="username-error" className="text-xs text-red-600 mt-2">{error}</p>
      ) : (
        <p className="text-xs text-gray-500 mt-2">Use 2–20 characters. Letters, numbers, and underscore only.</p>
      )}

      <button
        type="submit"
        className="mt-5 w-full bg-blue-600 text-white py-2.5 rounded-md shadow hover:shadow-md hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={Boolean(validateUsername(username))}
      >
        Join Chat
      </button>
      <p className="text-[11px] text-gray-400 mt-3 text-center">You can join or switch rooms after logging in.</p>
    </form>
  );
}

export default LoginForm;