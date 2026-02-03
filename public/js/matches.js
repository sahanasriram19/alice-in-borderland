document.addEventListener("DOMContentLoaded", function () {

  // DOM Elements
  var msgEl = AppHelpers.byId("msg");
  var groupListEl = AppHelpers.byId("groupList");

  // State
  var token = localStorage.getItem("token");

  // API Paths
  var GROUPS_PATH = "/api/groups";
  var JOIN_PATH = function (id) {
    return "/api/groups/" + id + "/join";
  };

  // Group Icons
  var iconMap = {
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

  // Init
  init();

  function init() {
    AppHelpers.clearPageError(msgEl);

    if (!preflightChecks()) return;

    bindEvents();
    loadGroups();
  }

  function preflightChecks() {
    if (typeof currentUrl === "undefined") {
      AppHelpers.showPageError(
        msgEl,
        "currentUrl is not defined. Include getCurrentURL.js before groups.js"
      );
      return false;
    }

    if (!token) {
      AppHelpers.showPageError(msgEl, "No token found. Please login first.");
      return false;
    }

    return true;
  }

  // Events
  function bindEvents() {
    document.addEventListener("click", onJoinClick);
  }

  function onJoinClick(e) {
    var btn = e.target.closest("[data-action='join']");
    if (!btn) return;

    var groupId = btn.getAttribute("data-id");
    AppHelpers.clearPageError(msgEl);

    joinGroup(groupId, function (status, payload) {
      if (status === 200) {
        window.location.href =
          "matchArena.html?group_id=" + groupId;
        return;
      }

      AppHelpers.showPageError(
        msgEl,
        (payload && payload.message) || "Failed to join group."
      );
    });
  }


  // Data Loading
  function loadGroups() {
    AppHelpers.apiGet(GROUPS_PATH, token, onGroupsLoaded);
  }

  function onGroupsLoaded(status, payload) {
    if (status !== 200) {
      AppHelpers.showPageError(
        msgEl,
        (payload && payload.message) || "Failed to load groups."
      );
      return;
    }

    var groups =
      AppHelpers.pick(payload, ["groups"], null) ||
      AppHelpers.unwrapData(payload) ||
      [];

    if (!Array.isArray(groups)) groups = [];

    renderGroups(groups);
  }

  function joinGroup(groupId, done) {
    AppHelpers.apiPost(JOIN_PATH(groupId), null, token, done);
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
    var memberCount = Number(group.member_count) || 0;
    var isFull = memberCount >= 5;
    var iconClass = iconMap[group.name] || "fa-users";

    var col = document.createElement("div");
    col.className = "col-12 col-md-4";

    col.innerHTML = `
      <div class="group-card text-center h-100">
        <div class="group-icon">
          <i class="fa-solid ${iconClass}"></i>
        </div>

        <h5 class="mb-2">
          ${AppHelpers.escapeHtml(group.name)}
        </h5>

        <p class="group-desc small mb-3">
          ${AppHelpers.escapeHtml(group.description || "")}
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
});