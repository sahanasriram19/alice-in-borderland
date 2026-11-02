/* Run initial setup once the page has fully loaded */
document.addEventListener("DOMContentLoaded", function () {
  getToken();
  eventListeners();
  loadGroups();
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

/* Main error message element shown at the top of the page */
const msgEl = document.getElementById("msg");

/* Container where all group cards are rendered */
const groupListEl = document.getElementById("groupList");


/* API endpoint paths */

const GROUPS_PATH = "/api/groups";

/* Builds the join endpoint URL for a specific group ID */
const JOIN_PATH = (id) => `/api/groups/${id}/join`;


/* Maps group names to Font Awesome icon classes for visual identity on each card.
   Any group name not found in this map will fall back to the generic users icon */
const iconMap = {
  "Team Sunrise":        "fa-sun",
  "Team Momentum":       "fa-bolt",
  "The Beach Squad":     "fa-umbrella-beach",
  "Spade Runners":       "fa-person-running",
  "Heart Keepers":       "fa-heart",
  "Diamond Minds":       "fa-gem",
  "Club Crew":           "fa-clover",
  "Wolf Pack":           "fa-users",
  "Silent Steps":        "fa-shoe-prints",
  "Iron Resolve":        "fa-dumbbell",
  "Zen Circle":          "fa-spa",
  "Borderland Veterans": "fa-medal"
};


/* Attach a single delegated click listener that handles all Join Group buttons */
function eventListeners() {

  document.addEventListener("click", onJoinClick);
}


/* Handle clicks on any Join Group button across the page */
function onJoinClick(e) {

  /* Use event delegation to find the clicked join button, if any */
  const btn = e.target.closest("[data-action='join']");
  if (!btn) return;

  /* Read the group ID stored on the button */
  const groupId = btn.getAttribute("data-id");

  /* Clear any previous error message before attempting to join */
  if (msgEl) {
    msgEl.classList.add("d-none");
    msgEl.textContent = "";
  }

  /* Send the join request to the server */
  joinGroup(groupId, function (status, payload) {

    /* On success, redirect to the match arena with the group ID in the URL */
    if (status === 200) {
      window.location.href = `matchArena.html?group_id=${groupId}`;
      return;
    }

    /* On failure, display the error message from the server */
    if (msgEl) {
      msgEl.textContent = (payload && payload.message) || "Failed to join group.";
      msgEl.classList.remove("d-none");
    }
  });
}


/* Fetch all available groups from the API and render them as cards */
function loadGroups() {

  const callback = function (status, payload) {

    /* Show an error and stop if the fetch failed */
    if (status !== 200) {
      if (msgEl) {
        msgEl.textContent = (payload && payload.message) || "Failed to load groups.";
        msgEl.classList.remove("d-none");
      }
      return;
    }

    /* Extract the groups array from whichever response shape the API returned */
    let groups = (payload && payload.data && payload.data.groups)
      || (payload && payload.groups)
      || [];

    /* Ensure groups is always an array even if the API returns something unexpected */
    if (!Array.isArray(groups)) groups = [];

    renderGroups(groups);
  };

  fetchMethod(currentUrl + GROUPS_PATH, callback, "GET", null, token);
}


/* POST to the join endpoint for a specific group and return the response to the caller */
function joinGroup(groupId, done) {

  fetchMethod(currentUrl + JOIN_PATH(groupId), done, "POST", null, token);
}


/* Clear the group list and render a card for each group, or show an empty state */
function renderGroups(groups) {

  if (!groupListEl) return;

  /* Wipe any existing cards before re-rendering */
  groupListEl.innerHTML = "";

  /* Show the empty state message if there are no groups to display */
  if (!groups.length) {
    renderEmptyState();
    return;
  }

  /* Render a card for each group */
  groups.forEach(renderGroupCard);
}

/* Render a message when there are no groups available */
function renderEmptyState() {

  groupListEl.innerHTML = `
    <div class="col-12">
      <div class="group-card text-center">
        <h5 class="mb-2">No groups found</h5>
        <p class="group-desc mb-0">Seed the CommunityGroup table.</p>
      </div>
    </div>
  `;
}


/* Build and append a card for a single group */
function renderGroupCard(group) {

  /* Calculate the member count and whether the group is full */
  const memberCount = Number(group.member_count) || 0;
  const isFull      = memberCount >= 5;

  /* Look up the icon for this group name, defaulting to the generic users icon */
  const iconClass = iconMap[group.name] || "fa-users";

  /* Create the Bootstrap column wrapper for this card */
  const col     = document.createElement("div");
  col.className = "col-12 col-md-4";

  /* Escape HTML special characters to prevent XSS from server-supplied group data */
  const escapeHtml = function (str) {
    return String(str ?? "")
      .replace(/&/g,  "&amp;")
      .replace(/</g,  "&lt;")
      .replace(/>/g,  "&gt;")
      .replace(/"/g,  "&quot;")
      .replace(/'/g,  "&#039;");
  };

  /* Build the card HTML with the icon, name, description, member count, and join button */
  col.innerHTML = `
    <div class="group-card text-center h-100">

      <!-- Font Awesome icon chosen from the iconMap -->
      <div class="group-icon">
        <i class="fa-solid ${iconClass}"></i>
      </div>

      <h5 class="mb-2">${escapeHtml(group.name)}</h5>

      <p class="group-desc small mb-3">${escapeHtml(group.description || "")}</p>

      <div class="group-members mb-3">Members: ${memberCount} / 5</div>

      <!-- Full groups show a disabled grey button; groups with space show an active join button -->
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