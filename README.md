# Happy Birthday Agent

An MVP birthday-message generator built from your product idea:

- React dashboard for prompt-driven message creation
- Express API for generating and storing wishes
- Prompt presets inspired by your "master prompts"
- MongoDB-backed persistence for generated wishes
- Real Gemini integration when `useLiveAi` is enabled
- Local template engine fallback when live AI is disabled
- Automatic schedule processing with `node-cron`
- Delivery through Email and Twilio channels

## What is included

### Frontend

- Person details form
- Style selector: funny, emotional, romantic, savage, formal, Bollywood, rap, voice
- Prompt preset selector
- Generated message preview
- Recent wish history
- `Use Gemini live generation` toggle for real model output
- Schedule form with in-app, email, SMS, and WhatsApp delivery options

### Backend

- `POST /api/generate` to generate and save a birthday message
- `GET /api/messages` to fetch recent messages
- `POST /api/schedules` to create a scheduled birthday job
- `GET /api/schedules` to fetch scheduled birthday jobs
- MongoDB persistence with Mongoose
- Gemini API integration through the official Google GenAI SDK
- Cron-based schedule processing every minute
- Email delivery with Nodemailer
- SMS and WhatsApp delivery with Twilio

## Project structure

```text
backend/   Express API + MongoDB + scheduler + delivery
frontend/  React + Vite dashboard
```

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB locally.

3. Fill [backend/.env](/d:/Happy_Birthday_Agent/backend/.env) with your Gemini key and any delivery credentials you want to use.

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

Core variables:

- `MONGODB_URI=mongodb://127.0.0.1:27017/happy-birthday-agent`
- `GEMINI_API_KEY=your_key_here`
- `GEMINI_MODEL=gemini-2.5-flash`

Email variables:

- `SMTP_HOST=`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=`
- `SMTP_PASS=`
- `SMTP_FROM=`

Twilio variables:

- `TWILIO_ACCOUNT_SID=`
- `TWILIO_AUTH_TOKEN=`
- `TWILIO_PHONE_NUMBER=`
- `TWILIO_WHATSAPP_NUMBER=`

## Scheduling and delivery

The scheduler starts automatically with the backend and checks for due jobs every minute.

Delivery channels:

- `in_app` keeps the message stored only in MongoDB
- `email` sends via Nodemailer
- `sms` sends through Twilio SMS
- `whatsapp` sends through Twilio WhatsApp

If the selected delivery channel is missing required credentials or destination info, the scheduled job is marked as `failed` and the error is saved on the schedule.
