# Happy Birthday Agent

An MVP birthday-message generator built from your product idea:

- React dashboard for prompt-driven message creation
- Express API for generating birthday wishes and scheduling delivery
- Prompt presets inspired by your "master prompts"
- MongoDB Atlas-ready persistence with Mongoose
- Real Gemini integration when `useLiveAi` is enabled
- Local template engine fallback when live AI is disabled
- Automatic schedule processing with `node-cron`
- Delivery through in-app mode or email
- Saved recipient profiles and delivery history

## Atlas setup

This project is configured for MongoDB Atlas style deployment instead of assuming a local MongoDB instance.

Use an Atlas SRV connection string in `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/happy-birthday-agent?retryWrites=true&w=majority&appName=Cluster0
```

## Atlas checklist

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. Add your app IP to the Atlas IP access list.
4. Copy the Atlas SRV connection string.
5. Replace `<db_user>`, `<db_password>`, and `<cluster>` in `backend/.env`.
6. If your password contains special characters, URL-encode it in the connection string.

## Frontend environment

The frontend reads its backend URL from `frontend/.env` or your hosting platform environment variables.

Use this in local development:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Use your deployed backend URL in production, for example:

```env
VITE_API_BASE_URL=https://your-backend-domain/api
```

A starter file is available at `frontend/.env.example`.

## Deployment note

The backend no longer silently falls back to `mongodb://127.0.0.1:27017/...`.
If `MONGODB_URI` is missing, startup now fails clearly so deployment config mistakes are easier to catch.

The scheduler runs inside the backend process, so the backend must be deployed on an always-on service.

## Product memory

The app remembers recipients and delivery activity:

- recipients are upserted by name + relationship
- favorite style and prompt type are saved automatically
- default email and delivery preference are remembered
- last message and last delivery timestamps are tracked
- every test send and scheduled send is logged in delivery history
