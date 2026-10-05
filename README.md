# ClientFlow

A modern full-stack client and task management platform built with React, TypeScript, Node.js, Express, and MongoDB.

ClientFlow provides a secure workspace where users can manage clients, organize tasks, track progress, update their account information, and monitor activity through a responsive dashboard.

## Live Demo

**Frontend:**  
https://clientflow-puce-eight.vercel.app

**API:**  
https://clientflow-api-28ff.onrender.com

> The backend is hosted on Render's free tier. The first request may take a short time while the service wakes up.

---

## Features

### Authentication & Security

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected frontend routes
- Protected API endpoints
- Role-based authorization
- Admin-only routes
- Persistent user sessions
- Secure password change flow

### Dashboard

- Real-time client and task statistics
- Active client overview
- Task completion progress
- Upcoming tasks
- Recent clients
- Responsive mobile dashboard

### Client Management

- Create clients
- View client details
- Edit client information
- Delete clients
- Search clients
- Filter clients by status
- User-specific data isolation

### Task Management

- Create, edit and delete tasks
- Todo, In Progress and Completed workflows
- Priority levels
- Due dates
- Client-task relationships
- Quick task status updates
- Search and priority filters
- Responsive Kanban-style interface

### Profile & Security

- Update name and email address
- Change password securely
- Current password verification
- Duplicate email protection
- Account role information

### Admin Panel

- Role-protected admin dashboard
- Platform statistics
- Registered user overview
- User search
- Role filtering
- Responsive user management interface

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token
- bcrypt.js

### Deployment

- Vercel — Frontend
- Render — REST API
- MongoDB Atlas — Database

---

## Architecture

```text
React + TypeScript
        |
        | REST API / JWT
        v
Node.js + Express
        |
        | Mongoose
        v
   MongoDB Atlas
```

ClientFlow uses a separated frontend/backend architecture.

The React application communicates with the Express REST API through Axios. Protected requests include a JWT access token, while authorization and resource ownership are validated by the backend.

---

## Authorization

ClientFlow implements both authentication and authorization.

Each client and task belongs to a specific user. Backend queries verify resource ownership, preventing users from accessing or modifying another user's data.

Administrative endpoints require both authentication and the `admin` role.

```text
Public
├── Register
└── Login

Authenticated User
├── Dashboard
├── Clients
├── Tasks
└── Profile

Administrator
└── Admin Panel
```

---

## API Overview

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/password
```

### Clients

```http
GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id
```

### Tasks

```http
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Admin

```http
GET /api/admin/stats
GET /api/admin/users
```

---

## Screenshots

### Dashboard

![ClientFlow Dashboard](client/public/screenshots/dashboard.png)

### Client Management

![ClientFlow Clients](client/public/screenshots/clients.png)

### Task Management

![ClientFlow Tasks](client/public/screenshots/tasks.png)

### Profile & Security

![ClientFlow Profile](client/public/screenshots/profile.png)

### Admin Panel

![ClientFlow Admin Panel](client/public/screenshots/admin.png)

---

## Local Development

Clone the repository:

```bash
git clone https://github.com/yildizulal/clientflow.git
cd clientflow
```

### Backend

```bash
cd server
npm install
```

Create a `.env` file using `.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the API:

```bash
npm run dev
```

### Frontend

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

---

## Production

The application is deployed using a separated production architecture:

```text
Vercel
  ↓
React / TypeScript
  ↓ HTTPS
Render
  ↓
Node.js / Express REST API
  ↓
MongoDB Atlas
```

Production CORS configuration restricts API access to approved frontend origins.

---

## Project Structure

```text
clientflow/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── public/
│   └── vercel.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
└── README.md
```

---

## Author

**Zülal Yıldız**

Full-Stack Developer

GitHub: https://github.com/yildizulal
