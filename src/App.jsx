import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const STORAGE_KEY = "flagfall-react-progress-v1";

const levels = [
  {
    id: 1,
    title: "Source Code Hunt",
    area: "Hidden Cave",
    clue: "Inspect the app source to find the hidden flag.",
    hint: "Search this project for source_master.",
    flag: "FLAG{source_master}",
    reward: 100
  },
  {
    id: 2,
    title: "Decode Mission",
    area: "Cipher Bridge",
    clue: "Decode: RkxBR3tiYXNlNjRfZGVjb2RlZH0=",
    hint: "This is Base64. Decoding it reveals the flag.",
    flag: "FLAG{base64_decoded}",
    reward: 150
  },
  {
    id: 3,
    title: "Robots Entry",
    area: "Robot Gate",
    clue: "robots.txt reveals the treasure.",
    hint: "In a real website, try visiting /robots.txt. For this classroom version, read the challenge data.",
    flag: "FLAG{robots_found}",
    reward: 200
  },
  {
    id: 4,
    title: "Caesar Ruins",
    area: "Ancient Ruins",
    clue: "Shift this message backward by 3: IODJ{fdhvdu_uxlqv}",
    hint: "Caesar -3 changes I to F, O to L, D to A, and J to G.",
    flag: "FLAG{caesar_ruins}",
    reward: 250
  },
  {
    id: 5,
    title: "Final Vault",
    area: "Treasure Vault",
    clue: "The last flag is hidden in a data attribute on the page.",
    hint: "Open devtools and search Elements for data-final-flag.",
    flag: "FLAG{vault_unlocked}",
    reward: 300
  }
];

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.completed)) return saved;
  } catch (error) {
    return { completed: [], score: 0 };
  }

  return { completed: [], score: 0 };
}

function EyeGuide() {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handlePointerMove(event) {
      const guide = document.querySelector(".eye-guide");
      if (!guide) return;

      const rect = guide.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      const distance = Math.min(12, Math.hypot(event.clientX - centerX, event.clientY - centerY) / 14);

      setEyeOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
    }

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div className="eye-guide" aria-label="Eye gaze guide">
      <div className="guide-chip">guide.exe</div>
      <div className="eye-row" aria-hidden="true">
        <div className="eye">
          <span className="pupil" style={{ transform: `translate(calc(-50% + ${eyeOffset.x}px), calc(-50% + ${eyeOffset.y}px))` }} />
        </div>
        <div className="eye">
          <span className="pupil" style={{ transform: `translate(calc(-50% + ${eyeOffset.x}px), calc(-50% + ${eyeOffset.y}px))` }} />
        </div>
      </div>
      <div className="guide-mouth" />
    </div>
  );
}

function TreasureMap({ completed }) {
  return (
    <aside className="map-card" aria-label="Treasure map">
      <div className="map-top">
        <span>// treasure_map.ctf</span>
        <span>{completed.length}/5 captured</span>
      </div>
      <EyeGuide />
      <svg className="map-route" viewBox="0 0 440 320" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 35 64 C 128 18, 158 126, 232 102 S 390 72, 366 160 C 340 258, 202 180, 122 252 C 82 292, 252 318, 402 276" />
      </svg>
      {levels.map((level, index) => (
        <div
          className={`map-node node-${level.id} ${completed.includes(level.id) ? "done" : ""}`}
          key={level.id}
          title={level.title}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
      ))}
      <div className="vault-mark">X</div>
    </aside>
  );
}

function ChallengeCard({
  current,
  input,
  setInput,
  submitFlag,
  message,
  showHint,
  setShowHint,
  completed,
  score
}) {
  const progressPercent = Math.round((completed.length / levels.length) * 100);

  return (
    <motion.section
      className="challenge-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="card-head">
        <div>
          <p className="kicker">FlagFall Mission</p>
          <h1>Capture the flag treasure</h1>
        </div>
        <div className="score-box">
          <span>Score</span>
          <strong>{score}</strong>
        </div>
      </div>

      <div className="progress-panel">
        <div>
          <span>Level {current.id} / {levels.length}</span>
          <strong>{current.title}</strong>
        </div>
        <div>
          <span>Area</span>
          <strong>{current.area}</strong>
        </div>
        <div>
          <span>Vault</span>
          <strong>{progressPercent}%</strong>
        </div>
      </div>

      <div className="clue-box">
        <span className="label">Clue</span>
        <p>{current.clue}</p>
      </div>

      {showHint && (
        <motion.div className="hint-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Hint: {current.hint}
        </motion.div>
      )}

      <div className="submit-area">
        <input
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") submitFlag();
          }}
          placeholder="Enter flag e.g. FLAG{...}"
          aria-label="Flag input"
        />
        <button type="button" className="ghost-button" onClick={() => setShowHint(value => !value)}>
          {showHint ? "Hide Hint" : "Show Hint"}
        </button>
        <button type="button" className="primary-button" onClick={submitFlag}>
          Submit Flag
        </button>
      </div>

      {message && <p className={`message ${message.type}`}>{message.text}</p>}
    </motion.section>
  );
}

export default function FlagFallGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [progress, setProgress] = useState(loadProgress);

  const current = levels[levelIndex];
  const completed = progress.completed;
  const score = progress.score;
  const allDone = completed.length === levels.length;

  const rank = useMemo(() => {
    if (score >= 1000) return "Treasure Hacker";
    if (score >= 600) return "Cipher Scout";
    if (score >= 250) return "Flag Hunter";
    return "Rookie";
  }, [score]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  function submitFlag() {
    const answer = input.trim();

    if (!answer) {
      setMessage({ type: "error", text: "Enter a flag before submitting." });
      return;
    }

    if (answer !== current.flag) {
      setMessage({ type: "error", text: "Wrong flag. Try again and check spelling carefully." });
      return;
    }

    const alreadyCompleted = completed.includes(current.id);
    const nextCompleted = alreadyCompleted ? completed : [...completed, current.id];
    const nextScore = alreadyCompleted ? score : score + current.reward;

    setProgress({ completed: nextCompleted, score: nextScore });
    setInput("");
    setShowHint(false);
    setMessage({ type: "success", text: `Correct flag. ${current.title} cleared for +${alreadyCompleted ? 0 : current.reward} points.` });

    if (levelIndex < levels.length - 1) {
      window.setTimeout(() => {
        setLevelIndex(index => Math.min(index + 1, levels.length - 1));
        setMessage(null);
      }, 900);
    }
  }

  function resetGame() {
    const freshProgress = { completed: [], score: 0 };
    setProgress(freshProgress);
    setLevelIndex(0);
    setInput("");
    setMessage(null);
    setShowHint(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshProgress));
  }

  if (allDone) {
    return (
      <main className="app-shell" data-final-flag="FLAG{vault_unlocked}">
        <motion.section className="complete-card" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}>
          <p className="kicker">Mission Complete</p>
          <h1>Treasure vault unlocked</h1>
          <p>You captured every flag and finished the beginner CTF hunt.</p>
          <div className="final-score">
            <span>Final Score</span>
            <strong>{score}</strong>
          </div>
          <button type="button" className="primary-button" onClick={resetGame}>
            Play Again
          </button>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="app-shell" data-final-flag="FLAG{vault_unlocked}">
      <div className="hero-grid">
        <section className="intro-panel">
          <p className="kicker">Cybersecurity Treasure Hunt</p>
          <h1>
            Find flags,
            <span> not coins.</span>
          </h1>
          <p>
            FlagFall helps cybersecurity students learn CTF basics by moving through a treasure map,
            solving clues, submitting flags, earning points, and unlocking the final vault.
          </p>
          <div className="stats-row">
            <div>
              <span>Rank</span>
              <strong>{rank}</strong>
            </div>
            <div>
              <span>Captured</span>
              <strong>{completed.length}/{levels.length}</strong>
            </div>
            <div>
              <span>Current Reward</span>
              <strong>{current.reward}</strong>
            </div>
          </div>
        </section>

        <TreasureMap completed={completed} />
      </div>

      <ChallengeCard
        current={current}
        input={input}
        setInput={setInput}
        submitFlag={submitFlag}
        message={message}
        showHint={showHint}
        setShowHint={setShowHint}
        completed={completed}
        score={score}
      />
    </main>
  );
}
