// Event: DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  getToken();
  checkPreflight();
  eventListeners();
  loadGroups();
});

// Get and validate token
function getToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
  }
}

// DOM Elements
const myGroupEl = document.getElementById("myGroupName");
const enemyGroupEl = document.getElementById("enemyGroupName");
const beginBtn = document.getElementById("beginMatchBtn");
const popupEl = document.getElementById("arenaMsg");

// State
const params = new URLSearchParams(window.location.search);
const myGroupId = Number(params.get("group_id"));

let enemyGroup = null;
let matchId = null;

// API Paths
const GROUPS_PATH = "/api/groups";
const MATCHES_PATH = "/api/matches";
const RESOLVE_PATH = function (id) {
  return "/api/matches/" + id + "/resolve";
};

// Preflight Checks
function checkPreflight() {
  if (typeof currentUrl === "undefined") {
    showArenaMessage("currentUrl is not defined. Include getCurrentURL.js before matchArena.js", false);
    return;
  }

  if (!myGroupId) {
    showArenaMessage("Missing group info.", false);
    return;
  }
}

// Add all the Event Listeners
function eventListeners() {
  if (!beginBtn) return;

  beginBtn.addEventListener("click", onBeginMatch);
}

function onBeginMatch() {
  setBeginButtonState(true);

  createMatch(function (err, id) {
    if (err) {
      setBeginButtonState(false);
      showArenaMessage(err, false);
      return;
    }

    matchId = id;
    resolveMatch();
  });
}

function setBeginButtonState(loading) {
  if (!beginBtn) return;

  beginBtn.disabled = loading;
  beginBtn.textContent = loading ? "Resolving match..." : "Begin Match";
}

// UI
function showArenaMessage(text, success) {
  if (!popupEl) return;

  popupEl.textContent = text;
  popupEl.classList.remove("d-none");

  popupEl.style.boxShadow = success
    ? "0 0 20px rgba(80,255,120,0.6), 0 0 50px rgba(80,255,120,0.3)"
    : "0 0 20px rgba(255,80,80,0.6), 0 0 50px rgba(255,80,80,0.3)";

  setTimeout(function () {
    popupEl.classList.add("d-none");
  }, 3500);
}

// Data Loading
function loadGroups() {
  const callback = function(status, payload) {
    if (status !== 200) {
      showArenaMessage((payload && payload.message) || "Failed to load groups", false);
      return;
    }

    let groups = (payload && payload.data && payload.data.groups) || (payload && payload.groups) || [];

    if (!Array.isArray(groups)) groups = [];

    const myGroup = findGroup(groups, myGroupId);
    enemyGroup = pickEnemy(groups, myGroupId);

    if (!myGroup || !enemyGroup) {
      showArenaMessage("Could not find opponent.", false);
      return;
    }

    renderGroupNames(myGroup, enemyGroup);
  };

  fetchMethod(currentUrl + GROUPS_PATH, callback, "GET", null, token);
}

function renderGroupNames(myGroup, enemy) {
  if (myGroupEl) myGroupEl.textContent = myGroup.name;
  if (enemyGroupEl) enemyGroupEl.textContent = enemy.name;
}

// Helpers
function findGroup(groups, id) {
  for (let i = 0; i < groups.length; i++) {
    if (Number(groups[i].id) === Number(id)) return groups[i];
  }
  return null;
}

function pickEnemy(groups, myId) {
  const others = groups.filter(function (g) {
    return Number(g.id) !== Number(myId);
  });

  if (!others.length) return null;

  return others[Math.floor(Math.random() * others.length)];
}

// Match Flow
function createMatch(done) {
  const data = {
    group_a_id: myGroupId,
    group_b_id: enemyGroup.id,
    season_id: 1
  };

  const callback = function (status, payload) {
    if (status !== 201) {
      return done((payload && payload.message) || "Failed to create match");
    }

    const dataObj = (payload && payload.data) || payload;
    const id =
      (dataObj && dataObj.match_id) ||
      (dataObj && dataObj.id) ||
      (dataObj && dataObj.result && dataObj.result.match_id) ||
      null;

    if (!id) return done("Match created but ID missing.");

    done(null, id);
  };

  fetchMethod(currentUrl + MATCHES_PATH, callback, "POST", data, token);
}

function resolveMatch() {
  const callback = function(status, payload) {
    setBeginButtonState(false);

    if (status !== 200) {
      showArenaMessage((payload && payload.message) || "Match resolution failed", false);
      return;
    }

    const dataObj = (payload && payload.data) || payload;
    const result = dataObj && dataObj.result ? dataObj.result : dataObj;
    const winnerId = result ? result.winner_group_id : null;

    if (!winnerId) {
    showArenaMessage("Your group won the match. You win 5 tokens!", true);
    } else if (Number(winnerId) === Number(myGroupId)) {
      showArenaMessage("Its a draw! Both groups win 2 tokens", true);
    } else {
      showArenaMessage("Your group lost the match.", false);
    }
  };

  fetchMethod(currentUrl + RESOLVE_PATH(matchId), callback, "POST", null, token);
}