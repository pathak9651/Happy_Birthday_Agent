# Happy Birthday Agent

An MVP birthday-message generator built from your product idea:

- React dashboard for prompt-driven message creation
- Express API for generating and storing wishes
- Prompt presets inspired by your "master prompts"
- MongoDB-backed persistence for generated wishes
- Real Gemini integration when `useLiveAi` is enabled
- Local template engine fallback when live AI is disabled
- Automatic schedule processing with `node-cron`
- Delivery through in-app storage or email

## What is included

### Frontend

- Person details form
- Style selector: funny, emotional, romantic, savage, formal, Bollywood, rap, voice
- Prompt preset selector
- Generated message preview
- Recent wish history
- `Use Gemini live generation` toggle for real model output
- Schedule form with in-app and email delivery options
- `Send test now` button for immediate email verification

### Backend

- `POST /api/generate` to generate and save a birthday message
- `POST /api/send-test` to generate and send a test delivery immediately
- `GET /api/messages` to fetch recent messages
- `POST /api/schedules` to create a scheduled birthday job
- `GET /api/schedules` to fetch scheduled birthday jobs
- MongoDB persistence with Mongoose
- Gemini API integration through the official Google GenAI SDK
- Cron-based schedule processing every minute
- Email delivery with Nodemailer

## Environment

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

## Scheduling and delivery

Delivery channels:

- `in_app` keeps the message stored only in MongoDB
- `email` sends via Nodemailer
