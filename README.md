# FlagFall

FlagFall is a beginner-friendly React cybersecurity treasure hunt game for students learning CTF basics.

Players search for flags instead of coins, submit each flag, earn points, and pass levels.

## Features

- React-based game flow inspired by a CTF challenge card
- Express and MongoDB backend for users, login, progress, challenges, hints, and leaderboard
- Eye-gaze guide whose pupils follow the cursor
- Treasure map with 5 flag checkpoints
- Live score, rank, solved count, and vault progress
- Browser-saved progress with local storage
- Hints for beginner-friendly learning

## Project Structure

- `index.html` - Vite entry page
- `src/main.jsx` - React app bootstrap
- `src/App.jsx` - game levels, scoring, eye gaze, and treasure map logic
- `src/styles.css` - visual design and responsive layout
- `server/index.cjs` - Express, MongoDB, JWT auth, progress, challenges, and leaderboard API
- `public/robots.txt` - beginner CTF robots clue
- `.env.example` - backend environment variable template
- `package.json` - React/Vite scripts and dependencies

## How to Play

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Then open:

```text
http://localhost:5173
```

## Backend API

Start MongoDB locally, copy `.env.example` to `.env`, update `JWT_SECRET`, then run:

```bash
npm run server
```

The API runs on:

```text
http://localhost:5000
```

Useful routes:

- `POST /api/register`
- `POST /api/login`
- `GET /api/challenges`
- `GET /api/challenge/:level`
- `POST /api/submit-flag`
- `GET /api/hint/:level`
- `GET /api/leaderboard`
- `GET /api/me`

Each level includes:

- A story
- A clue
- A flag input box
- A hint button
- Points after a correct submission

## Starter Levels

- Source code inspection
- Base64 decoding
- Robots clue discovery
- Caesar cipher
- DOM/data attribute inspection

## Notes

This is a front-end learning prototype. The flags are intentionally discoverable in the React source because the goal is teaching CTF basics. For a real competition, move flag validation to a backend server.
