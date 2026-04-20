# AI Chat App

A lightweight AI-powered chat application built with React and Node.js. Users can enter prompts, receive AI-generated responses, and manage conversations through a clean and intuitive interface.

## Features

* Prompt input with send functionality
* AI-generated responses via backend API
* Draft chat flow (chat created only after first message)
* Sidebar with conversation history
* Switch between previous chats
* Clear chat functionality
* Chat persistence using localStorage
* Loading and error states
* Clean, minimal dark UI

## Tech Stack

Frontend:

* React (Vite)
* CSS

Backend:

* Node.js
* Express
* OpenAI API

## Project Structure

```
frontend-assessment-spotnana/
  client/     # React frontend
  server/     # Express backend
```

## Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/chaitanyagandhi/frontend-assessment-spotnana.git
cd frontend-assessment-spotnana
```

### 2. Install dependencies

Frontend:

```
cd client
npm install
```

Backend:

```
cd ../server
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server` folder:

```
PORT=5001
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run the application

Start backend:

```
cd server
npm run dev
```

Start frontend (in a new terminal):

```
cd client
npm run dev
```

### 5. Open the app

Visit:

```
http://localhost:5173
```

## Notes

* The OpenAI API key is securely stored in the backend and never exposed to the frontend.
* Chat history is stored locally in the browser using localStorage.
* The app uses a draft chat flow to avoid empty conversations in the sidebar.

## Future Improvements

* Deploy frontend and backend
* Add authentication
* Store chats in a database
* Improve response formatting and code block rendering
