    const STORAGE_KEY = "flagfall-progress-v1";

    const levels = [
      {
        id: "lvl-1",
        category: "Warmup",
        title: "The Gatekeeper",
        points: 100,
        story: "Every hunt begins with knowing the flag format. The first flag is visible because the goal is to learn how submissions work.",
        clue: "Submit this training flag: FLAG{welcome_hunter}",
        hint: "Copy the full flag, including FLAG and the curly braces.",
        flag: "FLAG{welcome_hunter}"
      },
      {
        id: "lvl-2",
        category: "Web",
        title: "Source Cave",
        points: 150,
        story: "A web page can hide clues in places normal players never look. Cyber learners inspect the page source like a map.",
        clue: "The clue is hidden in an HTML comment near the top of this page.",
        hint: "Right-click the page and choose View Page Source, or use browser developer tools. Search for 'Level 2'.",
        flag: "FLAG{view_source_voyager}"
      },
      {
        id: "lvl-3",
        category: "Crypto",
        title: "Caesar Bridge",
        points: 200,
        story: "An old cipher blocks the bridge. Shift each letter backward by 3 to reveal the flag.",
        clue: "IODJ{fdhvdu_folfn}",
        hint: "Caesar shift -3 means I becomes F, O becomes L, D becomes A, and J becomes G.",
        flag: "FLAG{caesar_click}"
      },
      {
        id: "lvl-4",
        category: "Encoding",
        title: "Base64 Lagoon",
        points: 250,
        story: "Not all strange text is encryption. Sometimes it is encoding, which means it can be reversed directly.",
        clue: "RkxBR3tiYXNlNjRfYnVjY2FuZWVyfQ==",
        hint: "Decode the clue with Base64. Browser console tip: atob('RkxBR3tiYXNlNjRfYnVjY2FuZWVyfQ==')",
        flag: "FLAG{base64_buccaneer}"
      },
      {
        id: "lvl-5",
        category: "DOM",
        title: "Inspector's Vault",
        points: 300,
        story: "The final flag is stored in the page structure. A CTF player checks attributes, elements, and the DOM.",
        clue: "Find the hidden data attribute named data-final-fragment.",
        hint: "Open developer tools, inspect the page, and search the Elements panel for data-final-fragment.",
        flag: "FLAG{dom_detective}"
      }
    ];

    let progress = loadProgress();

    function loadProgress() {
      const fallback = { solved: [] };
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return stored && Array.isArray(stored.solved) ? stored : fallback;
      } catch (error) {
        return fallback;
      }
    }

    function saveProgress() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }

    function normalizeFlag(value) {
      return value.trim();
    }

    function getScore() {
      return levels
        .filter(level => progress.solved.includes(level.id))
        .reduce((sum, level) => sum + level.points, 0);
    }

    function getRank(score) {
      if (score >= 1000) return "Flag Master";
      if (score >= 650) return "Cipher Scout";
      if (score >= 300) return "Web Ranger";
      if (score >= 100) return "First Capture";
      return "Rookie";
    }

    function renderLevels() {
      const grid = document.getElementById("levelGrid");
      grid.innerHTML = levels.map((level, index) => {
        const solved = progress.solved.includes(level.id);
        return `
          <article class="level-card ${solved ? "solved" : ""}" id="${level.id}">
            <div class="level-top">
              <div>
                <div class="level-tag">LEVEL ${index + 1} / ${level.category}</div>
                <h3>${level.title}</h3>
              </div>
              <div class="badge">${solved ? "PASSED" : `${level.points} pts`}</div>
            </div>
            <div class="level-body">
              <p>${level.story}</p>
              <div class="clue-box">${level.clue}</div>
              <p class="hint" id="${level.id}-hint">${level.hint}</p>
            </div>
            <div class="submit-row">
              <input class="flag-input" id="${level.id}-input" type="text" autocomplete="off" placeholder="FLAG{...}" ${solved ? "disabled" : ""}>
              <button class="mini-btn" type="button" data-hint="${level.id}">Hint</button>
              <button class="mini-btn submit-btn" type="button" data-submit="${level.id}" ${solved ? "disabled" : ""}>Submit</button>
            </div>
            <div class="level-feedback ${solved ? "good" : ""}" id="${level.id}-feedback">${solved ? "Captured. Nice work, hunter." : "Awaiting flag submission..."}</div>
          </article>
        `;
      }).join("");

      document.querySelectorAll("[data-submit]").forEach(button => {
        button.addEventListener("click", () => submitFlag(button.dataset.submit));
      });

      document.querySelectorAll("[data-hint]").forEach(button => {
        button.addEventListener("click", () => showHint(button.dataset.hint));
      });

      document.querySelectorAll(".flag-input").forEach(input => {
        input.addEventListener("keydown", event => {
          if (event.key === "Enter") {
            submitFlag(input.id.replace("-input", ""));
          }
        });
      });
    }

    function submitFlag(levelId) {
      const level = levels.find(item => item.id === levelId);
      const input = document.getElementById(`${levelId}-input`);
      const feedback = document.getElementById(`${levelId}-feedback`);
      const answer = normalizeFlag(input.value);

      if (progress.solved.includes(levelId)) {
        feedback.textContent = "This level is already passed.";
        feedback.className = "level-feedback good";
        return;
      }

      if (!answer) {
        feedback.textContent = "Type a flag before submitting.";
        feedback.className = "level-feedback bad";
        return;
      }

      if (answer === level.flag) {
        progress.solved.push(levelId);
        saveProgress();
        renderLevels();
        updateStats();
        addTerminalLine(`captured ${level.title}: +${level.points} points`, true);
        toast(`Flag captured: ${level.title} (+${level.points})`);
        return;
      }

      feedback.textContent = "Not quite. Check spelling, braces, and capitalization.";
      feedback.className = "level-feedback bad";
      toast("That flag did not match. Tiny typos are sneaky little goblins.");
    }

    function showHint(levelId) {
      document.getElementById(`${levelId}-hint`).classList.toggle("visible");
      addTerminalLine(`hint opened for ${levels.find(level => level.id === levelId).title}`, false);
    }

    function updateStats() {
      const score = getScore();
      const solved = progress.solved.length;
      const solvedText = `${solved}/${levels.length}`;
      const percent = Math.round((solved / levels.length) * 100);
      document.getElementById("score").textContent = score;
      document.getElementById("heroScore").textContent = score;
      document.getElementById("solved").textContent = solvedText;
      document.getElementById("heroSolved").textContent = solvedText;
      document.getElementById("rank").textContent = getRank(score);
      document.getElementById("treasurePercent").textContent = `${percent}%`;
      document.getElementById("treasureStatus").textContent = solved === levels.length
        ? "Vault unlocked: all flags captured."
        : `Vault sealed: capture ${levels.length - solved} more flag${levels.length - solved === 1 ? "" : "s"}.`;
      updateTreasureMap();
    }

    function updateTreasureMap() {
      document.querySelectorAll("[data-map-node]").forEach(node => {
        node.classList.toggle("is-solved", progress.solved.includes(node.dataset.mapNode));
      });
    }

    function initEyeGaze() {
      const pupils = document.querySelectorAll(".pupil");
      if (!pupils.length) return;

      window.addEventListener("pointermove", event => {
        pupils.forEach(pupil => {
          const eye = pupil.parentElement;
          const rect = eye.getBoundingClientRect();
          const eyeX = rect.left + rect.width / 2;
          const eyeY = rect.top + rect.height / 2;
          const angle = Math.atan2(event.clientY - eyeY, event.clientX - eyeX);
          const distance = Math.min(12, Math.hypot(event.clientX - eyeX, event.clientY - eyeY) / 12);
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;

          pupil.style.setProperty("--eye-x", `${x}px`);
          pupil.style.setProperty("--eye-y", `${y}px`);
        });
      });
    }

    function addTerminalLine(text, success) {
      const terminal = document.getElementById("terminalOutput");
      const line = document.createElement("div");
      line.className = success ? "success" : "";
      line.innerHTML = `<span class="prompt">student@flagfall:~$</span> ${text}`;
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    }

    function toast(message) {
      const toastEl = document.getElementById("toast");
      toastEl.textContent = message;
      toastEl.classList.add("show");
      window.clearTimeout(toastEl.hideTimer);
      toastEl.hideTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2700);
    }

    document.getElementById("resetGame").addEventListener("click", () => {
      progress = { solved: [] };
      saveProgress();
      renderLevels();
      updateStats();
      addTerminalLine("progress reset", false);
      toast("Progress reset. The island is fresh again.");
    });

    renderLevels();
    updateStats();
    initEyeGaze();
