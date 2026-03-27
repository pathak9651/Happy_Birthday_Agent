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
- Saved recipient profiles and delivery history

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
- Saved recipient profiles panel
- Delivery history panel

### Backend

- `POST /api/generate` to generate and save a birthday message
- `POST /api/send-test` to generate and send a test delivery immediately
- `GET /api/messages` to fetch recent messages
- `POST /api/schedules` to create a scheduled birthday job
- `GET /api/schedules` to fetch scheduled birthday jobs
- `GET /api/recipients` to fetch saved recipient profiles
- `GET /api/delivery-history` to fetch delivery activity
- MongoDB persistence with Mongoose
- Gemini API integration through the official Google GenAI SDK
- Cron-based schedule processing every minute
- Email delivery with Nodemailer

## Product memory

The app now remembers recipients and delivery activity:

- recipients are upserted by name + relationship
- favorite style and prompt type are saved automatically
- default email and delivery preference are remembered
- last message and last delivery timestamps are tracked
- every test send and scheduled send is logged in delivery history
