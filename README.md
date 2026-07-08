# MindWell — A Simple Mental Wellness Journal

A private journaling app where **data privacy is the #1 feature, not an afterthought.**

## Features
- Guided daily prompts for journaling
- Journal entries encrypted at rest (AES-256)
- Mood & energy logging with Chart.js visualizations (line + pie)
- 4-7-8 guided breathing tool with Framer Motion animation
- Dark mode
- Freemium model: basic journaling free, advanced analytics premium
- GDPR-style data export (JSON and PDF)

## Tech Stack
- **Frontend:** React (Vite), Framer Motion, Chart.js, React Router, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Security:** AES-256-CBC (Node's built-in `crypto` module) for journal content, bcrypt for passwords, JWT for sessions

## Security Note (Encryption Strategy)

The critical requirement of this project: **if someone opens the database directly, they should not be able to read journal entries.**

We use **AES-256-CBC** encryption (via Node's native `crypto` module) on the `content` field of the `JournalEntry` Mongoose model:

1. When a user submits an entry, the backend generates a random 16-byte IV (initialization vector) and encrypts the plaintext with a 256-bit key stored only in the server's `.env` file (`ENCRYPTION_KEY`), never in the codebase or database.
2. The stored value in MongoDB is `iv:ciphertext` — both hex-encoded — so identical journal text never produces identical ciphertext twice (thanks to the random IV).
3. Decryption only happens server-side, at the moment the authenticated owner of an entry requests to read it (`GET /api/journal`, or an export). The key never reaches the frontend.
4. Passwords are handled separately with **bcrypt** (one-way hashing, salted) — they are never decrypted, only compared.

If you inspect the `journalentries` collection directly in MongoDB Compass or Atlas, the `content` field will look like unreadable hex gibberish, e.g.:
```
"content": "a1b2c3d4e5f6...:9f8e7d6c5b4a3210..."
```

### Generating your own encryption key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Put the output in `backend/.env` as `ENCRYPTION_KEY`. **Never commit this file.**

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI, JWT_SECRET, ENCRYPTION_KEY
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if not using localhost:5000
npm run dev
```

## Deployment
- Backend → Render (or Railway)
- Frontend → Vercel
- Database → MongoDB Atlas

Remember to set the same environment variables (`MONGO_URI`, `JWT_SECRET`, `ENCRYPTION_KEY`, `CLIENT_URL`) in your Render dashboard, and `VITE_API_URL` pointing to your deployed backend URL in Vercel.

## Project Structure
```
mindwell/
├── backend/    # Express API, MongoDB models, encryption logic
└── frontend/   # React app (Vite)
```
