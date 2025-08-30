# Full-Stack Note-Taking Application 📝

A secure and modern full-stack note-taking application built with React (TypeScript) on the front-end and a Node.js (TypeScript) backend. It features robust user authentication using JWT, including email/OTP and Google OAuth flows.

### Live Demo

**[https://highway-delite-noteapp.vercel.app]**

## Features

* **Secure User Authentication**:
    * Sign up/Login with **Email and OTP**.
    * Sign up/Login with a **Google Account** (OAuth 2.0).
* **JWT-Based Authorization**: Secure API endpoints using JSON Web Tokens to protect user data.
* **CRUD Functionality**: Users can **Create**, **View**, and **Delete** their personal notes.
* **Robust Error Handling**: Displays clear, user-friendly error messages for invalid inputs, API failures, or incorrect OTPs.
* **Responsive Design**: A mobile-first design that provides a seamless experience on all devices.
* **Personalized Welcome Page**: Greets logged-in users and displays their information.

---

## Technology Stack

* **Frontend**: React.js (with TypeScript), Vite, Tailwind CSS
* **Backend**: Node.js, Express.js (with TypeScript)
* **Database**: MongoDB (with Mongoose)
* **Authentication**: JSON Web Token (JWT), Google OAuth 2.0, Nodemailer (for OTP)
* **Version Control**: Git & GitHub

---

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18.x or later)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [Git](https://git-scm.com/)
* [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)

### 1. Clone the Repository

```bash
git clone [https://github.com/](https://github.com/)[shivamxverma]/[Highway-delite-Noteapp].git
cd [Highway-delite-Noteapp]
```

### 2. Backend Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file in the /server directory and add the following variables
# (replace placeholder values with your actual credentials)
```

**`server/.env`**
```env
# Server Configuration
PORT=8080
CORS_ORIGIN=http://localhost:5173

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Google OAuth Credentials
# Get them from Google Cloud Console: [https://console.cloud.google.com/](https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_REDIRECT_URL=http://localhost:8080/api/v1/auth/google/callback

# Nodemailer (for OTP via Email)
# Use a service like Mailtrap or your own SMTP server
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM_EMAIL="Note App <no-reply@yourapp.com>"
```

```bash
# Start the backend development server
npm run dev
```
The server will be running at `http://localhost:8080`.

### 3. Frontend Setup

```bash
# Navigate to the client directory from the root folder
cd client

# Install dependencies
npm install

# Create a .env.local file in the /client directory and add the following
```

**`client/.env.local`**
```env
# The base URL of your backend API
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Your Google Client ID for the frontend login button
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
# Start the frontend development server
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## 📜 API Endpoints

A brief overview of the core API endpoints. All `/notes` routes are protected.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/users/generateotp` | Sends a one-time password to the user's email. |
| `POST` | `/api/v1/users/register` | Registers a new user with email and verified OTP. |
| `GET` | `/api/v1/auth/google` | Initiates the Google OAuth login flow. |
| `GET` | `/api/v1/auth/google/callback` | Callback URL for Google to redirect to after auth. |
| `GET` | `/api/v1/notes` | (Protected) Fetches all notes for the logged-in user. |
| `POST` | `/api/v1/notes` | (Protected) Creates a new note. |
| `DELETE` | `/api/v1/notes/:noteId` | (Protected) Deletes a specific note by its ID. |

---