# IntellMeet - AI-Powered Enterprise Meeting Platform

IntellMeet is a production-grade full-stack MERN application designed seamlessly to integrate intelligent video conferencing, team communication, and Kanban-style project management. It heavily features OpenAI integration for meeting intelligence (Transcription, Summarization, and Action Items).

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Zustand, TanStack Query
- **Backend**: Node.js, Express, MongoDB, Mongoose, Redis
- **Real-Time**: Socket.io, WebRTC (Multi-participant video)
- **AI Processing**: OpenAI API (Whisper & GPT-4o)
- **Infrastructure**: Docker Multi-stage containers, Cloudinary (Assets/Recordings)

## System Architecture

The monorepo structure contains:
- `my-react-app`: The React Vite highly-optimized client frontend
- `server`: The robust Node.js/Express backend API and WebSocket server
- `docker-compose.yml`: For containerized database, redis, and service deployments

### Key Features Fully Specified
1. **Meeting Lobby & Live Rooms**: Built-in camera/mic checks, up to 50 active WebRTC participant grids, screen sharing, recording.
2. **AI Post-Meeting Intelligence**: Automatic meeting recording transcription (Whisper) and GPT-4o Action Item generation.
3. **Task Kanban Board**: Live drag-and-drop workspace derived from AI action items.
4. **Team Chat Navigation**: Real-time Socket.io team channels, direct messages, inline attachments.

## Getting Started

### Prerequisites
- Node.js >= 20.x
- Docker & Docker Compose
- MongoDB (Running locally or hosted)
- External API Keys (OpenAI, Cloudinary)

### Installation
1. Setup the Backend:
```bash
cd server
npm install
npm run dev
```

2. Setup the Frontend:
```bash
cd my-react-app
npm install
npm run dev
```

3. Docker Quickstart:
```bash
docker-compose up --build
```
