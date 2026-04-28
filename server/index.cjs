const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

loadLocalEnv();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/flagfall";
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

if (process.env.NODE_ENV === "production" && JWT_SECRET === "dev-only-secret") {
  throw new Error("JWT_SECRET must be set in production");
}

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  score: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lives: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now }
});

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  completedLevels: { type: [Number], default: [] },
  hintsUsed: { type: Number, default: 0 },
  timeLeft: { type: Number, default: 300 }
});

const challengeSchema = new mongoose.Schema({
  level: { type: Number, unique: true, required: true },
  title: { type: String, required: true },
  area: { type: String, required: true },
  clue: { type: String, required: true },
  flag: { type: String, required: true },
  reward: { type: Number, required: true },
  hint: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);
const Progress = mongoose.model("Progress", progressSchema);
const Challenge = mongoose.model("Challenge", challengeSchema);

const starterChallenges = [
  {
    level: 1,
    title: "Source Code Hunt",
    area: "Hidden Cave",
    clue: "Inspect the app source to find the hidden flag.",
    flag: "FLAG{source_master}",
    reward: 100,
    hint: "Search this project for source_master."
  },
  {
    level: 2,
    title: "Decode Mission",
    area: "Cipher Bridge",
    clue: "Decode: RkxBR3tiYXNlNjRfZGVjb2RlZH0=",
    flag: "FLAG{base64_decoded}",
    reward: 150,
    hint: "This is Base64. Decoding it reveals the flag."
  },
  {
    level: 3,
    title: "Robots Entry",
    area: "Robot Gate",
    clue: "robots.txt reveals the treasure.",
    flag: "FLAG{robots_found}",
    reward: 200,
    hint: "Visit /robots.txt in the frontend."
  },
  {
    level: 4,
    title: "Caesar Ruins",
    area: "Ancient Ruins",
    clue: "Shift this message backward by 3: IODJ{fdhvdu_uxlqv}",
    flag: "FLAG{caesar_ruins}",
    reward: 250,
    hint: "Caesar -3 changes I to F, O to L, D to A, and J to G."
  },
  {
    level: 5,
    title: "Final Vault",
    area: "Treasure Vault",
    clue: "The last flag is hidden in a data attribute on the page.",
    flag: "FLAG{vault_unlocked}",
    reward: 300,
    hint: "Open devtools and search Elements for data-final-flag."
  }
];

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  });
}

function signToken(user) {
  return jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ msg: "Invalid token" });
  }
}

async function seedChallenges() {
  await Promise.all(
    starterChallenges.map(challenge =>
      Challenge.updateOne(
        { level: challenge.level },
        { $setOnInsert: challenge },
        { upsert: true }
      )
    )
  );
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "flagfall-api" });
});

app.post("/api/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Username, email, and password are required" });
    }

    const existing = await User.findOne({ $or: [{ username }, { email: email.toLowerCase() }] });
    if (existing) return res.status(409).json({ msg: "Username or email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash });
    await Progress.create({ userId: user._id, completedLevels: [] });

    const token = signToken(user);
    res.status(201).json({
      msg: "Registered",
      token,
      user: { username: user.username, score: user.score, level: user.level, lives: user.lives }
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) return res.status(400).json({ msg: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: "Wrong password" });

    const token = signToken(user);
    res.json({
      token,
      user: { username: user.username, score: user.score, level: user.level, lives: user.lives }
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/challenges", auth, async (req, res, next) => {
  try {
    const challenges = await Challenge.find().sort({ level: 1 }).select("-flag -__v");
    res.json(challenges);
  } catch (error) {
    next(error);
  }
});

app.get("/api/challenge/:level", auth, async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({ level: Number(req.params.level) }).select("-flag -__v");
    if (!challenge) return res.status(404).json({ msg: "Challenge not found" });
    res.json(challenge);
  } catch (error) {
    next(error);
  }
});

app.post("/api/submit-flag", auth, async (req, res, next) => {
  try {
    const level = Number(req.body.level);
    const flag = String(req.body.flag || "").trim();
    const challenge = await Challenge.findOne({ level });

    if (!challenge) return res.status(404).json({ msg: "Challenge not found" });

    const user = await User.findById(req.user.id);
    const progress = await Progress.findOne({ userId: req.user.id });

    if (!user || !progress) return res.status(404).json({ msg: "User progress not found" });

    if (flag === challenge.flag) {
      const alreadyCompleted = progress.completedLevels.includes(level);
      if (!alreadyCompleted) {
        progress.completedLevels.push(level);
        user.score += challenge.reward;
      }

      user.level = Math.max(user.level, level + 1);
      await user.save();
      await progress.save();

      return res.json({
        correct: true,
        score: user.score,
        nextLevel: user.level,
        completedLevels: progress.completedLevels,
        reward: alreadyCompleted ? 0 : challenge.reward
      });
    }

    user.lives = Math.max(0, user.lives - 1);
    await user.save();
    res.json({ correct: false, lives: user.lives });
  } catch (error) {
    next(error);
  }
});

app.get("/api/hint/:level", auth, async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({ level: Number(req.params.level) });
    if (!challenge) return res.status(404).json({ msg: "Challenge not found" });

    const progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) return res.status(404).json({ msg: "User progress not found" });

    progress.hintsUsed += 1;
    await progress.save();
    res.json({ hint: challenge.hint, hintsUsed: progress.hintsUsed });
  } catch (error) {
    next(error);
  }
});

app.get("/api/leaderboard", async (req, res, next) => {
  try {
    const users = await User.find().sort({ score: -1 }).limit(10).select("username score level -_id");
    res.json(users);
  } catch (error) {
    next(error);
  }
});

app.get("/api/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    const progress = await Progress.findOne({ userId: req.user.id }).select("-__v");
    res.json({ user, progress });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ msg: "Server error" });
});

async function start() {
  await mongoose.connect(MONGO_URI);
  await seedChallenges();
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

start().catch(error => {
  console.error("Failed to start server", error);
  process.exit(1);
});
