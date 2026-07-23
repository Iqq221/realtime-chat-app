# 💬 Full-Stack Realtime Chat Application

A modern, high-performance, real-time messaging application built with **React 19**, **Node.js**, **Express**, **Socket.IO**, **MongoDB**, and **Tailwind CSS v4**.

---

## 🌟 Key Features

- **⚡ Real-Time Messaging**: Instant bi-directional message delivery powered by Socket.IO rooms.
- **🟢 Online / Offline Status**: Live online indicators updated automatically across all connected clients.
- **✍️ Typing Indicators**: Real-time animated typing status when the other user is composing a message.
- **📷 Media & Image Uploads**: Share photos and images directly in chat with full-screen lightbox modal previews.
- **👤 Profile Customization**: Upload custom avatar photos, update display name, and set custom status/bio messages.
- **🔍 User Search & Discovery**: Live search bar to find people and start new 1-on-1 conversations easily.
- **🔒 JWT Authentication**: Secure authentication flow using JSON Web Tokens stored in HTTP cookies / Bearer headers.
- **🎨 Glassmorphic Dark UI**: High-grade UI with smooth transitions, custom scrollbars, and mobile-responsive drawer layouts.

---

## 🛠️ Tech Stack

### **Frontend (`/client`)**
- **React 19** with Vite 8
- **Tailwind CSS v4** + `@tailwindcss/vite`
- **Socket.IO Client** v4.8
- **React Router DOM** v7
- **Axios** (API requests)
- **Lucide React** (Modern UI Icons)
- **React Hot Toast** (Alert notifications)

### **Backend (`/server`)**
- **Node.js** + **Express.js**
- **Socket.IO** (WebSockets engine)
- **MongoDB** + **Mongoose** (Database)
- **JWT (JsonWebToken)** + **Bcrypt.js** (Auth & Security)
- **Multer** (File & Image Uploads)

---

## 📁 Project Structure

```
Realtime-Chat-App/
├── client/                   # Frontend React Application
│   ├── src/
│   │   ├── components/       # UI Components (Sidebar, ChatWindow, MessageInput, etc.)
│   │   ├── context/          # Global Contexts (AuthContext, SocketContext)
│   │   ├── pages/            # Page Views (Login, Register, Chat)
│   │   ├── services/         # Axios API & Socket.IO Services
│   │   ├── index.css         # Custom Tailwind directives & animations
│   │   └── App.jsx           # React Router & App Entrypoint
│   ├── package.json
│   └── vite.config.js
│
├── server/                   # Backend Express & Socket.IO API
│   ├── src/
│   │   ├── config/           # Database Connection (db.js)
│   │   ├── controllers/      # Route Controllers (auth, user, message, conversation)
│   │   ├── middleware/       # Auth guard & Multer Upload Middleware
│   │   ├── models/           # Mongoose Data Schemas (User, Message, Conversation)
│   │   ├── routes/           # REST API Route endpoints
│   │   └── socket/           # Real-time Socket.IO event handler
│   ├── uploads/              # Static media storage for user avatars & chat images
│   ├── .env.example          # Environment variables template
│   ├── server.js             # Express & Socket server startup file
│   └── package.json
│
├── .gitignore                # Git ignore rules for node_modules, .env, uploads
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

---

### 🔧 Installation & Setup

#### 1. Clone Repository
```bash
git clone https://github.com/your-username/Realtime-Chat-App.git
cd Realtime-Chat-App
```

#### 2. Configure Backend Environment
Navigate to the `server/` directory and create a `.env` file based on `.env.example`:
```bash
cd server
cp .env.example .env
```
Fill in your MongoDB connection string and JWT secret in `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chat-app
JWT_SECRET=your_super_secret_jwt_key
```

#### 3. Install Dependencies
Install server and client packages:
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

---

## 🏃 Running the Application

Start both the backend server and frontend development server in separate terminal windows:

### **Terminal 1: Backend Server**
```bash
cd server
npm run dev
```
> Server runs on `http://localhost:5000` 🚀

### **Terminal 2: Frontend Client**
```bash
cd client
npm run dev
```
> Client runs on `http://localhost:5173` 💻

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Log in user & issue JWT token | Public |
| `GET` | `/api/auth/me` | Fetch logged in user profile | Private |
| `GET` | `/api/auth/logout` | Log out user | Private |
| `GET` | `/api/users` | List users / search users | Private |
| `PUT` | `/api/users/profile` | Update profile photo, name & bio | Private |
| `GET` | `/api/conversations` | Get user's conversation list | Private |
| `POST` | `/api/conversations` | Get or create 1-on-1 conversation | Private |
| `GET` | `/api/messages/:id` | Fetch conversation messages | Private |
| `POST` | `/api/messages` | Send message (text/image) | Private |

---

## 🛡️ Git & Security Guidelines

> [!CAUTION]
> Never commit `.env` files or real database credentials to Git!

Ensure your `.gitignore` file includes:
```gitignore
node_modules/
.env
server/.env
server/uploads/*
!server/uploads/.gitkeep
dist/
```

---

## 📝 License
This project is open-source under the [ISC License](LICENSE).
