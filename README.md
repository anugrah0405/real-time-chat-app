# Real-Time Chat Application

This is a real-time chat application built with React for the frontend and Node.js with Express and Socket.IO for the backend. It features user authentication, real-time messaging, chat rooms, and user online/offline status indicators.

---

## Features

- Real-time messaging using Socket.IO
- User authentication
- Multiple chat rooms
- User online/offline status
- Typing indicators
- Responsive design using Tailwind CSS

---

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

---

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/anugrah0405/real-time-chat-app
    cd real-time-chat-app
    ```

2. Install the dependencies for the frontend:

    ```bash
    cd frontend
    npm install
    ```    

3. Install the dependencies for the backend:
    ```bash
    cd ../backend
    npm install
    ```

---

## Usage

To run the application locally:

1. Start the backend server:
    ```bash
    cd backend
    node server.js
    ```
    The server will start on `http://localhost:5000`.

2. In a new terminal, start the frontend development server:
    ```bash
    cd frontend
    npm start
    ```
    The frontend will be available at `http://localhost:3000`.

3. Open your browser and navigate to `http://localhost:3000` in multiple tabs to use the application.

---

## Project Structure

```
real-time-chat-app/
├── backend/
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── node_modules
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatRoom.tsx
│   │   │   └── LoginForm.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── index.tsx
│   ├── babel.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── webpack.config.js
└── README.md
```

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
