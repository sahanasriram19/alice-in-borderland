// Event: DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  getToken();
  eventListeners();
  loadMyProfile(function (err) {

    if (err) {
      if (msg) {
        msg.textContent = err;
        msg.classList.remove("d-none");
      }
      return;
    }

    loadLevels(function (err2) {
      if (err2) {
        if (msg) {
          msg.textContent = err2;
          msg.classList.remove("d-none");
        }
        return;
      }

      if (!characters.length) {
        if (msg) {
          msg.textContent = "No characters found.";
          msg.classList.remove("d-none");
        }
        return;
      }

      const defaultChar = findDefaultCharacter();
      renderList();
      renderPanel(defaultChar);
    });
  });
});

// Get and validate token
function getToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
  }
}

// DOM Elements
const msg = document.getElementById("msg");
const listEl = document.getElementById("characterList");

const charNameEl = document.getElementById("charName");
const charTierEl = document.getElementById("charTier");
const charDescEl = document.getElementById("charDesc");
const reqPointsEl = document.getElementById("reqPoints");
const myPointsEl = document.getElementById("myPoints");
const myCharacterEl = document.getElementById("myCharacter");
const unlockBadgeEl = document.getElementById("unlockBadge");
const pointsNeedBadgeEl = document.getElementById("pointsNeedBadge");
const charImgEl = document.getElementById("charImg");

const statSurvival = document.getElementById("statSurvival");
const statStrategy = document.getElementById("statStrategy");
const statAgility = document.getElementById("statAgility");
const statLeadership = document.getElementById("statLeadership");
const statComposure = document.getElementById("statComposure");

// Endpoints
const PROFILE_ME_PATH = "/api/profiles/me";
const LEVELS_PATH = "/api/profiles/levels";

// Image template
const CHARACTER_IMG_BASE = "https://raw.githubusercontent.com/SahanaSP19/images/main/characters/";
const CHARACTER_IMG_EXT = ".png";

// State
let myPoints = 0;
let myCharacter = "-";
let activeName = null;
let characters = [];

// Add all the Event Listeners
function eventListeners() {
  
  document.addEventListener("click", function (e) {
    const item = e.target.closest(".char-list-item");
    if (!item) return;

    const name = item.getAttribute("data-name");
    if (!name) return;

    renderPanel(name);
  });
}

// Load Profile
function loadMyProfile(done) {
  const callback = function (status, payload) {

    if (status !== 200) {
      return done((payload && payload.message) || "Failed to load profile.");
    }

    const profile = (payload && payload.data && payload.data.profile) 
    || (payload && payload.profile) || null;

    if (!profile) return done("Profile missing in response.");
    myPoints = Number(profile.points) || 0;
    myCharacter = profile.character_name || "-";
    done(null);

  };

  fetchMethod(currentUrl + PROFILE_ME_PATH, callback, "GET", null, token);
}

// Load Character Levels
function loadLevels(done) {
  const callback = function (status, payload) {

    if (status !== 200) {
      return done((payload && payload.message) || "Failed to load profile levels.");
    }

    const rows = (payload && payload.data && payload.data.profileLevels) 
    || (payload && payload.profileLevels) || [];

    characters = normalizeAndSort(Array.isArray(rows) ? rows : []);
    done(null);
  };

  fetchMethod(currentUrl + LEVELS_PATH, callback, "GET", null, token);
}

function normalizeAndSort(rows) {
  const list = rows.map((r) => ({
    character_name: String(r.character_name || "-"),
    required_total_points: Number(r.required_total_points) || 0,
    description: String(r.description || "")
  }));

  list.sort((a, b) => a.required_total_points - b.required_total_points);
  return list;
}

// Rendering
function findDefaultCharacter() {
  const found = characters.find((c) => c.character_name === myCharacter);
  return found ? myCharacter : characters[0].character_name;
}

function findCharacter(name) {
  return characters.find((c) => c.character_name === name) || null;
}

function renderList() {
  if (!listEl) return;
  listEl.innerHTML = "";

  characters.forEach((c) => {
    const unlocked = myPoints >= Number(c.required_total_points);
    const isActive = activeName === c.character_name;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "char-list-item" + (isActive ? " active" : "");
    btn.setAttribute("data-name", c.character_name);

    const escapeHtml = function(str) {
      return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    btn.innerHTML = `
      <div class="char-list-row">
        <div class="char-list-name">${escapeHtml(c.character_name)}</div>
        <div class="char-list-pill ${unlocked ? "unlocked" : "locked"}">
          ${unlocked ? "Unlocked" : "Locked"}
        </div>
      </div>
      <div class="char-list-sub">
        Requires ${escapeHtml(String(c.required_total_points))} pts
      </div>
    `;

    listEl.appendChild(btn);
  });
}

function renderPanel(characterName) {
  const c = findCharacter(characterName);
  if (!c) return;

  activeName = characterName;
  renderList();

  const req = Number(c.required_total_points) || 0;
  const unlocked = myPoints >= req;
  const needed = Math.max(0, req - myPoints);

  if (charNameEl) charNameEl.textContent = c.character_name;
  if (charTierEl) charTierEl.textContent = "Tier unlock at " + req + " points";
  if (charDescEl) charDescEl.textContent = c.description || "";

  if (reqPointsEl) reqPointsEl.textContent = String(req);
  if (myPointsEl) myPointsEl.textContent = String(myPoints);
  if (myCharacterEl) myCharacterEl.textContent = String(myCharacter);

  if (unlockBadgeEl) {
    unlockBadgeEl.textContent = unlocked ? "Unlocked" : "Locked";
    unlockBadgeEl.classList.toggle("good", unlocked);
    unlockBadgeEl.classList.toggle("bad", !unlocked);
  }

  if (pointsNeedBadgeEl) {
    pointsNeedBadgeEl.textContent = unlocked ? "Ready" : needed + " pts needed";
    pointsNeedBadgeEl.classList.toggle("good", unlocked);
    pointsNeedBadgeEl.classList.toggle("bad", !unlocked);
  }

  if (charImgEl) charImgEl.src = buildCharacterImageUrl(c.character_name);

  const stats = statsFromRequirement(req);
  setBar(statSurvival, stats.survival);
  setBar(statStrategy, stats.strategy);
  setBar(statAgility, stats.agility);
  setBar(statLeadership, stats.leadership);
  setBar(statComposure, stats.composure);
}

// Utilities
function buildCharacterImageUrl(characterName) {
  if (!characterName) return "";
  return CHARACTER_IMG_BASE + characterName.toLowerCase() + CHARACTER_IMG_EXT;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function setBar(el, val) {
  if (!el) return;
  el.style.width = clamp(val, 0, 100) + "%";
}

function statsFromRequirement(req) {
  const tier =
    req >= 100 ? 6 :
    req >= 50 ? 5 :
    req >= 40 ? 4 :
    req >= 30 ? 3 :
    req >= 20 ? 2 :
    req >= 10 ? 1 : 0;

  return {
    survival: clamp(35 + tier * 10, 0, 100),
    strategy: clamp(30 + tier * 12, 0, 100),
    agility: clamp(25 + tier * 11, 0, 100),
    leadership: clamp(20 + tier * 10, 0, 100),
    composure: clamp(28 + tier * 11, 0, 100)
  };
}