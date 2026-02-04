// Event: DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  getToken();
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
const msgEl = document.getElementById("msg");
const groupListEl = document.getElementById("groupList");

// API Paths
const GROUPS_PATH = "/api/groups";
const JOIN_PATH = (id) => `/api/groups/${id}/join`;

// Group Icons
const iconMap = {
  "Team Sunrise": "fa-sun",
  "Team Momentum": "fa-bolt",
  "The Beach Squad": "fa-umbrella-beach",
  "Spade Runners": "fa-person-running",
  "Heart Keepers": "fa-heart",
  "Diamond Minds": "fa-gem",
  "Club Crew": "fa-clover",
  "Wolf Pack": "fa-users",
  "Silent Steps": "fa-shoe-prints",
  "Iron Resolve": "fa-dumbbell",
  "Zen Circle": "fa-spa",
  "Borderland Veterans": "fa-medal"
};

// Add all the Event Listeners
function eventListeners() {
  document.addEventListener("click", onJoinClick);
}

function onJoinClick(e) {
  const btn = e.target.closest("[data-action='join']");
  if (!btn) return;

  const groupId = btn.getAttribute("data-id");
  
  if (msgEl) {
    msgEl.classList.add("d-none");
    msgEl.textContent = "";
  }

  joinGroup(groupId, function (status, payload) {
    if (status === 200) {
      window.location.href = `matchArena.html?group_id=${groupId}`;
      return;
    }

    if (msgEl) {
      msgEl.textContent = (payload && payload.message) || "Failed to join group.";
      msgEl.classList.remove("d-none");
    }
  });
}

// Data Loading
function loadGroups() {
  const callback = function (status, payload) {
    if (status !== 200) {
      if (msgEl) {
        msgEl.textContent = (payload && payload.message) || "Failed to load groups.";
        msgEl.classList.remove("d-none");
      }
      return;
    }

    let groups = (payload && payload.data && payload.data.groups) || (payload && payload.groups) || [];

    if (!Array.isArray(groups)) groups = [];

    renderGroups(groups);
  };

  fetchMethod(currentUrl + GROUPS_PATH, callback, "GET", null, token);
}

function joinGroup(groupId, done) {
  fetchMethod(currentUrl + JOIN_PATH(groupId), done, "POST", null, token);
}

// Rendering
function renderGroups(groups) {
  if (!groupListEl) return;

  groupListEl.innerHTML = "";

  if (!groups.length) {
    renderEmptyState();
    return;
  }

  groups.forEach(renderGroupCard);
}

function renderEmptyState() {
  groupListEl.innerHTML = `
    <div class="col-12">
      <div class="group-card text-center">
        <h5 class="mb-2">No groups found</h5>
        <p class="group-desc mb-0">
          Seed the CommunityGroup table.
        </p>
      </div>
    </div>
  `;
}

function renderGroupCard(group) {
  const memberCount = Number(group.member_count) || 0;
  const isFull = memberCount >= 5;
  const iconClass = iconMap[group.name] || "fa-users";

  const col = document.createElement("div");
  col.className = "col-12 col-md-4";

  const escapeHtml = function(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  col.innerHTML = `
    <div class="group-card text-center h-100">
      <div class="group-icon">
        <i class="fa-solid ${iconClass}"></i>
      </div>

      <h5 class="mb-2">
        ${escapeHtml(group.name)}
      </h5>

      <p class="group-desc small mb-3">
        ${escapeHtml(group.description || "")}
      </p>

      <div class="group-members mb-3">
        Members: ${memberCount} / 5
      </div>

      <button
        class="btn w-100 ${isFull ? "btn-secondary" : "btn-primary"}"
        data-action="join"
        data-id="${group.id}"
        ${isFull ? "disabled" : ""}
      >
        ${isFull ? "Group Full" : "Join Group"}
      </button>
    </div>
  `;

  groupListEl.appendChild(col);
}