# FlagFall

FlagFall is a beginner-friendly cybersecurity treasure hunt game for students learning CTF basics.

Players search for flags instead of coins, submit each flag, earn points, and pass levels.

## Features

- Eye-gaze guide whose pupils follow the cursor
- Treasure map with 5 flag checkpoints
- Live score, rank, solved count, and vault progress
- Browser-saved progress with local storage
- Hints for beginner-friendly learning

## Project Structure

- `index.html` - main game page
- `css/styles.css` - visual design and responsive layout
- `js/game.js` - challenge data, scoring, hints, and progress logic
- `package.json` - optional scripts for local serving and JS validation

## How to Play

Open `index.html` in a browser and click **Start Hunting**.

You can also run a local server:

```bash
npm start
```

Then open:

```text
http://localhost:5173
```

Each level includes:

- A story
- A clue
- A flag input box
- A hint button
- Points after a correct submission

## Starter Levels

- Warmup flag format
- HTML source inspection
- Caesar cipher
- Base64 decoding
- DOM inspection

## Notes

This is a front-end learning prototype. The flags are intentionally discoverable in the page because the goal is teaching CTF basics. For a real competition, move flag validation to a backend server.
