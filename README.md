# Happy Birthday Agent

An MVP birthday-message generator built from your product idea:

- React dashboard for prompt-driven message creation
- Express API for generating and storing wishes
- Prompt presets inspired by your "master prompts"
- MongoDB-backed persistence for generated wishes
- Local template engine now, with clean hooks for OpenAI later

## What is included

### Frontend

- Person details form
- Style selector: funny, emotional, romantic, savage, formal, Bollywood, rap, voice
- Prompt preset selector
- Generated message preview
- Recent wish history

### Backend

- `POST /api/generate` to generate and save a birthday message
- `GET /api/messages` to fetch recent messages
- `GET /api/presets` to load prompt modes for the UI
- MongoDB persistence with Mongoose

## Project structure

```text
backend/   Express API
frontend/  React + Vite dashboard
docker-compose.yml  Local MongoDB service
```

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB:

```bash
docker compose up -d
```

3. Start the backend:

```bash
npm run dev:backend
```

4. In a second terminal, start the frontend:

```bash
npm run dev:frontend
```

5. Open `http://localhost:5173`

## Environment

Copy [backend/.env.example](/d:/Happy_Birthday_Agent/backend/.env.example) to `.env` inside [`backend`](/d:/Happy_Birthday_Agent/backend) and fill values as needed.

Required database variable:

- `MONGODB_URI=mongodb://127.0.0.1:27017/happy-birthday-agent`

## Database setup

The backend now expects MongoDB before it starts.

### Docker Compose

Use the included [docker-compose.yml](/d:/Happy_Birthday_Agent/docker-compose.yml):

```bash
docker compose up -d
```

To stop it:

```bash
docker compose down
```

To stop it and remove the MongoDB volume:

```bash
docker compose down -v
```

### Local MongoDB

If you prefer a local installation instead of Docker:

1. Install MongoDB Community Server if it is not already installed.
2. Start MongoDB locally.
3. Make sure `MONGODB_URI` points to your running instance.

## Next upgrades

### OpenAI integration

Replace the placeholder `useLiveAi` path in [`backend/src/services/messageGenerator.js`](/d:/Happy_Birthday_Agent/backend/src/services/messageGenerator.js) with a real OpenAI API call.

Suggested flow:

- Send the structured prompt from `buildPrompt`
- Save the model name and token usage with each generated message
- Add prompt versioning so you can improve outputs without breaking old history

### Database

The app already uses MongoDB through [`backend/src/db/message.model.js`](/d:/Happy_Birthday_Agent/backend/src/db/message.model.js) and [`backend/src/data/messageRepository.js`](/d:/Happy_Birthday_Agent/backend/src/data/messageRepository.js). You can extend it next with recipient profiles, schedules, and delivery logs.

### Scheduling and delivery

Add:

- `node-cron` for midnight scheduling
- Twilio for SMS or WhatsApp delivery
- NodeMailer for email sending
- ElevenLabs for voice narration

### Memory system

To avoid repetitive wishes later, store:

- recipient profile
- past generated messages
- favorite tone and prompt mode
- delivery channel

## Build strategy

This repo intentionally starts with the first practical slice:

1. Generate message
2. Show in UI
3. Save recent output
4. Expand to live AI, persistence, scheduler, and delivery
