# Happy Birthday Agent

An MVP birthday-message generator built from your product idea:

- React dashboard for prompt-driven message creation
- Express API for generating and storing wishes
- Prompt presets inspired by your "master prompts"
- MongoDB-backed persistence for generated wishes
- Real Gemini integration when `useLiveAi` is enabled
- Local template engine fallback when live AI is disabled

## What is included

### Frontend

- Person details form
- Style selector: funny, emotional, romantic, savage, formal, Bollywood, rap, voice
- Prompt preset selector
- Generated message preview
- Recent wish history
- `Use Gemini live generation` toggle for real model output

### Backend

- `POST /api/generate` to generate and save a birthday message
- `GET /api/messages` to fetch recent messages
- `GET /api/presets` to load prompt modes for the UI
- MongoDB persistence with Mongoose
- Gemini API integration through the official Google GenAI SDK

## Project structure

```text
backend/   Express API
frontend/  React + Vite dashboard
```

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB locally.

3. Set your Gemini key in [backend/.env](/d:/Happy_Birthday_Agent/backend/.env):

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

4. Start the backend:

```bash
npm run dev:backend
```

5. In a second terminal, start the frontend:

```bash
npm run dev:frontend
```

6. Open `http://localhost:5173`

## Environment

Copy [backend/.env.example](/d:/Happy_Birthday_Agent/backend/.env.example) to `.env` inside [`backend`](/d:/Happy_Birthday_Agent/backend) and fill values as needed.

Required variables:

- `MONGODB_URI=mongodb://127.0.0.1:27017/happy-birthday-agent`
- `GEMINI_API_KEY=your_key_here`
- `GEMINI_MODEL=gemini-2.5-flash`

## Database setup

The backend expects MongoDB before it starts.

### Local MongoDB

1. Install MongoDB Community Server if it is not already installed.
2. Start MongoDB locally.
3. Make sure `MONGODB_URI` points to your running instance.

## Gemini setup

The app now uses the official Google GenAI SDK in [`backend/src/services/messageGenerator.js`](/d:/Happy_Birthday_Agent/backend/src/services/messageGenerator.js).

Behavior:

- If `useLiveAi` is off, the app uses the local template engine.
- If `useLiveAi` is on, the app sends the built prompt to Gemini.
- If `GEMINI_API_KEY` is missing, the API returns a clear error instead of silently failing.

## Next upgrades

### Smarter persistence

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
