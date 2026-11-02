/* Run initial setup once the page has fully loaded */
document.addEventListener("DOMContentLoaded", function () {
  getToken();
  eventListeners();

  /* Load the user's profile first, then load character levels once profile is ready */
  loadMyProfile(function (err) {

    /* Show an error and stop if the profile fetch failed */
    if (err) {
      if (msg) {
        msg.textContent = err;
        msg.classList.remove("d-none");
      }
      return;
    }

    /* With the profile loaded, fetch all character tier data */
    loadLevels(function (err2) {

      /* Show an error and stop if the levels fetch failed */
      if (err2) {
        if (msg) {
          msg.textContent = err2;
          msg.classList.remove("d-none");
        }
        return;
      }

      /* If the API returned no characters at all, show a message and stop */
      if (!characters.length) {
        if (msg) {
          msg.textContent = "No characters found.";
          msg.classList.remove("d-none");
        }
        return;
      }

      /* All data is ready — decide which character to show first */
      const defaultChar = findDefaultCharacter();

      /* Render the sidebar list and the detail panel for the default character */
      renderList();
      renderPanel(defaultChar);
    });
  });
});


/* Check localStorage for an auth token and redirect to login if none is found */
function getToken() {

  const token = localStorage.getItem("token");

  /* If no token exists the user is not logged in, send them back to the login page */
  if (!token) {
    window.location.href = "index.html";
  }
}


/* DOM references */

/* Main page-level error message element */
const msg = document.getElementById("msg");

/* Sidebar container where the character list buttons are rendered */
const listEl = document.getElementById("characterList");

/* Detail panel elements that display information about the selected character */
const charNameEl        = document.getElementById("charName");
const charTierEl        = document.getElementById("charTier");
const charDescEl        = document.getElementById("charDesc");
const reqPointsEl       = document.getElementById("reqPoints");
const myPointsEl        = document.getElementById("myPoints");
const myCharacterEl     = document.getElementById("myCharacter");
const unlockBadgeEl     = document.getElementById("unlockBadge");
const pointsNeedBadgeEl = document.getElementById("pointsNeedBadge");
const charImgEl         = document.getElementById("charImg");

/* Stat bar progress elements for the five character attributes */
const statSurvival   = document.getElementById("statSurvival");
const statStrategy   = document.getElementById("statStrategy");
const statAgility    = document.getElementById("statAgility");
const statLeadership = document.getElementById("statLeadership");
const statComposure  = document.getElementById("statComposure");


/* API endpoint paths */

const PROFILE_ME_PATH = "/api/profiles/me";
const LEVELS_PATH     = "/api/profiles/levels";


/* Image URL config */

/* GitHub raw base URL and file extension used to build character image URLs */
const CHARACTER_IMG_BASE = "https://raw.githubusercontent.com/SahanaSP19/images/main/characters/";
const CHARACTER_IMG_EXT  = ".png";


/* Application state */

/* User's current point total, loaded from the server */
let myPoints = 0;

/* Name of the character the user currently has equipped */
let myCharacter = "-";

/* Name of the character currently highlighted in the sidebar */
let activeName = null;

/* All available characters with their tier requirements and descriptions */
let characters = [];


/* Listen for clicks on sidebar character buttons and show the selected character */
function eventListeners() {

  /* Use event delegation so one listener handles all character buttons */
  document.addEventListener("click", function (e) {

    /* Walk up the DOM to find a character list item that was clicked */
    const item = e.target.closest(".char-list-item");
    if (!item) return;

    /* Read the character name stored on the button and render its detail panel */
    const name = item.getAttribute("data-name");
    if (!name) return;

    renderPanel(name);
  });
}


/* Fetch the current user's profile and store their points and equipped character */
function loadMyProfile(done) {

  const callback = function (status, payload) {

    /* Return an error through the callback if the request failed */
    if (status !== 200) {
      return done((payload && payload.message) || "Failed to load profile.");
    }

    /* Support multiple possible response shapes from the API */
    const profile = (payload && payload.data && payload.data.profile)
      || (payload && payload.profile)
      || null;

    if (!profile) return done("Profile missing in response.");

    /* Store profile values into module-level state for use during rendering */
    myPoints    = Number(profile.points) || 0;
    myCharacter = profile.character_name || "-";

    done(null);
  };

  fetchMethod(currentUrl + PROFILE_ME_PATH, callback, "GET", null, token);
}


/* Fetch all character tier data from the API and store it sorted by point requirement */
function loadLevels(done) {

  const callback = function (status, payload) {

    /* Return an error through the callback if the request failed */
    if (status !== 200) {
      return done((payload && payload.message) || "Failed to load profile levels.");
    }

    /* Support multiple possible response shapes from the API */
    const rows = (payload && payload.data && payload.data.profileLevels)
      || (payload && payload.profileLevels)
      || [];

    /* Normalise the data shape and sort by points required ascending */
    characters = normalizeAndSort(Array.isArray(rows) ? rows : []);

    done(null);
  };

  fetchMethod(currentUrl + LEVELS_PATH, callback, "GET", null, token);
}


/* Normalise raw API rows into a consistent shape and sort them lowest to highest */
function normalizeAndSort(rows) {

  /* Map each row to a predictable object with safe type conversions */
  const list = rows.map((r) => ({
    character_name:        String(r.character_name || "-"),
    required_total_points: Number(r.required_total_points) || 0,
    description:           String(r.description || "")
  }));

  /* Sort ascending so the easiest-to-unlock character appears first in the list */
  list.sort((a, b) => a.required_total_points - b.required_total_points);

  return list;
}


/* Return the name of the character to display by default when the page loads */
function findDefaultCharacter() {

  /* Try to find the character the user currently has equipped */
  const found = characters.find((c) => c.character_name === myCharacter);

  /* Use the equipped character if it exists in the list, otherwise use the first one */
  return found ? myCharacter : characters[0].character_name;
}

/* Find and return a character object by name, or null if not found */
function findCharacter(name) {

  return characters.find((c) => c.character_name === name) || null;
}


/* Rebuild the sidebar list, marking each character as unlocked or locked */
function renderList() {

  if (!listEl) return;

  /* Wipe the current list before re-rendering */
  listEl.innerHTML = "";

  /* Escape HTML special characters to prevent XSS from server-supplied names */
  const escapeHtml = function (str) {
    return String(str ?? "")
      .replace(/&/g,  "&amp;")
      .replace(/</g,  "&lt;")
      .replace(/>/g,  "&gt;")
      .replace(/"/g,  "&quot;")
      .replace(/'/g,  "&#039;");
  };

  characters.forEach((c) => {

    /* Determine whether the user has enough points to unlock this character */
    const unlocked = myPoints >= Number(c.required_total_points);

    /* Highlight the button if this character is the one currently shown in the panel */
    const isActive = activeName === c.character_name;

    /* Create a button element for this character */
    const btn     = document.createElement("button");
    btn.type      = "button";
    btn.className = "char-list-item" + (isActive ? " active" : "");
    btn.setAttribute("data-name", c.character_name);

    /* Build the button content showing the name, lock status, and point requirement */
    btn.innerHTML = `
      <div class="char-list-row">
        <div class="char-list-name">${escapeHtml(c.character_name)}</div>
        <div class="char-list-pill ${unlocked ? "unlocked" : "locked"}">
          ${unlocked ? "Unlocked" : "Locked"}
        </div>
      </div>
      <div class="char-list-sub">Requires ${escapeHtml(String(c.required_total_points))} pts</div>
    `;

    listEl.appendChild(btn);
  });
}


/* Update the detail panel to show information for the selected character */
function renderPanel(characterName) {

  /* Look up the character object by name */
  const c = findCharacter(characterName);
  if (!c) return;

  /* Update the active name and re-render the list to move the highlight */
  activeName = characterName;
  renderList();

  /* Calculate unlock status and how many more points are needed */
  const req      = Number(c.required_total_points) || 0;
  const unlocked = myPoints >= req;
  const needed   = Math.max(0, req - myPoints);

  /* Populate all the text fields in the detail panel */
  if (charNameEl)    charNameEl.textContent    = c.character_name;
  if (charTierEl)    charTierEl.textContent    = "Tier unlock at " + req + " points";
  if (charDescEl)    charDescEl.textContent    = c.description || "";
  if (reqPointsEl)   reqPointsEl.textContent   = String(req);
  if (myPointsEl)    myPointsEl.textContent    = String(myPoints);
  if (myCharacterEl) myCharacterEl.textContent = String(myCharacter);

  /* Update the unlock badge with the appropriate label and colour class */
  if (unlockBadgeEl) {
    unlockBadgeEl.textContent = unlocked ? "Unlocked" : "Locked";
    unlockBadgeEl.classList.toggle("good", unlocked);
    unlockBadgeEl.classList.toggle("bad",  !unlocked);
  }

  /* Update the points-needed badge to show either "Ready" or the remaining amount */
  if (pointsNeedBadgeEl) {
    pointsNeedBadgeEl.textContent = unlocked ? "Ready" : needed + " pts needed";
    pointsNeedBadgeEl.classList.toggle("good", unlocked);
    pointsNeedBadgeEl.classList.toggle("bad",  !unlocked);
  }

  /* Set the character portrait image */
  if (charImgEl) charImgEl.src = buildCharacterImageUrl(c.character_name);

  /* Calculate and apply the five stat bar widths based on this character's tier */
  const stats = statsFromRequirement(req);

  setBar(statSurvival,   stats.survival);
  setBar(statStrategy,   stats.strategy);
  setBar(statAgility,    stats.agility);
  setBar(statLeadership, stats.leadership);
  setBar(statComposure,  stats.composure);
}


/* Build the full image URL for a character using their lowercase name */
function buildCharacterImageUrl(characterName) {

  if (!characterName) return "";

  /* Construct: base URL + lowercase name + .png extension */
  return CHARACTER_IMG_BASE + characterName.toLowerCase() + CHARACTER_IMG_EXT;
}

/* Clamp a number so it cannot go below min or above max */
function clamp(n, min, max) {

  return Math.max(min, Math.min(max, n));
}

/* Set a stat progress bar's width as a percentage, clamped between 0 and 100 */
function setBar(el, val) {

  if (!el) return;

  el.style.width = clamp(val, 0, 100) + "%";
}


/* Calculate five stat values for a character based on their point requirement */
function statsFromRequirement(req) {

  /* Map the point requirement to a tier from 0 (starter) up to 6 (legendary) */
  const tier =
    req >= 100 ? 6 :
    req >= 50  ? 5 :
    req >= 40  ? 4 :
    req >= 30  ? 3 :
    req >= 20  ? 2 :
    req >= 10  ? 1 : 0;

  /* Each stat has its own base value and per-tier growth rate */
  return {
    survival:   clamp(35 + tier * 10, 0, 100),
    strategy:   clamp(30 + tier * 12, 0, 100),
    agility:    clamp(25 + tier * 11, 0, 100),
    leadership: clamp(20 + tier * 10, 0, 100),
    composure:  clamp(28 + tier * 11, 0, 100)
  };
}