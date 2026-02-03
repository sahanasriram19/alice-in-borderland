document.addEventListener("DOMContentLoaded", function () {

  // DOM Elements
  var myGroupEl = AppHelpers.byId("myGroupName");
  var enemyGroupEl = AppHelpers.byId("enemyGroupName");
  var beginBtn = AppHelpers.byId("beginMatchBtn");
  var popupEl = AppHelpers.byId("arenaMsg");

  // State
  var token = localStorage.getItem("token");
  var params = new URLSearchParams(window.location.search);
  var myGroupId = Number(params.get("group_id"));

  var enemyGroup = null;
  var matchId = null;

  // API Paths
  var GROUPS_PATH = "/api/groups";
  var MATCHES_PATH = "/api/matches";
  var RESOLVE_PATH = function (id) {
    return "/api/matches/" + id + "/resolve";
  };

  // Init
  init();

  function init() {
    if (!preflightChecks()) return;

    bindEvents();
    loadGroups();
  }

  function preflightChecks() {
    if (typeof currentUrl === "undefined") {
      showArenaMessage(
        "currentUrl is not defined. Include getCurrentURL.js before matchArena.js",
        false
      );
      return false;
    }

    if (!token) {
      showArenaMessage("No token found. Please login first.", false);
      return false;
    }

    if (!myGroupId) {
      showArenaMessage("Missing group info.", false);
      return false;
    }

    return true;
  }

  // Events
  function bindEvents() {
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
    AppHelpers.apiGet(GROUPS_PATH, token, onGroupsLoaded);
  }

  function onGroupsLoaded(status, payload) {
    if (status !== 200) {
      showArenaMessage(
        (payload && payload.message) || "Failed to load groups",
        false
      );
      return;
    }

    var groups =
      AppHelpers.pick(payload, ["groups"], null) ||
      AppHelpers.unwrapData(payload) ||
      [];

    if (!Array.isArray(groups)) groups = [];

    var myGroup = findGroup(groups, myGroupId);
    enemyGroup = pickEnemy(groups, myGroupId);

    if (!myGroup || !enemyGroup) {
      showArenaMessage("Could not find opponent.", false);
      return;
    }

    renderGroupNames(myGroup, enemyGroup);
  }

  function renderGroupNames(myGroup, enemy) {
    if (myGroupEl) myGroupEl.textContent = myGroup.name;
    if (enemyGroupEl) enemyGroupEl.textContent = enemy.name;
  }

  // Helpers
  function findGroup(groups, id) {
    for (var i = 0; i < groups.length; i++) {
      if (Number(groups[i].id) === Number(id)) return groups[i];
    }
    return null;
  }

  function pickEnemy(groups, myId) {
    var others = groups.filter(function (g) {
      return Number(g.id) !== Number(myId);
    });

    if (!others.length) return null;

    return others[Math.floor(Math.random() * others.length)];
  }

  // Match Flow
  function createMatch(done) {
    AppHelpers.apiPost(
      MATCHES_PATH,
      {
        group_a_id: myGroupId,
        group_b_id: enemyGroup.id,
        season_id: 1
      },
      token,
      function (status, payload) {
        if (status !== 201) {
          return done(
            (payload && payload.message) || "Failed to create match"
          );
        }

        var dataObj = AppHelpers.unwrapData(payload);
        var id =
          (dataObj && dataObj.match_id) ||
          (dataObj && dataObj.id) ||
          (dataObj && dataObj.result && dataObj.result.match_id) ||
          null;

        if (!id) return done("Match created but ID missing.");

        done(null, id);
      }
    );
  }

  function resolveMatch() {
    AppHelpers.apiPost(
      RESOLVE_PATH(matchId),
      null,
      token,
      onMatchResolved
    );
  }

  function onMatchResolved(status, payload) {
    setBeginButtonState(false);

    if (status !== 200) {
      showArenaMessage(
        (payload && payload.message) || "Match resolution failed",
        false
      );
      return;
    }

    var dataObj = AppHelpers.unwrapData(payload);
    var result = dataObj && dataObj.result ? dataObj.result : dataObj;
    var winnerId = result ? result.winner_group_id : null;

    if (!winnerId) {
      showArenaMessage("Match ended in a draw.", true);
    } else if (Number(winnerId) === Number(myGroupId)) {
      showArenaMessage("Your group won the match. You win 5 tokens!", true);
    } else {
      showArenaMessage("Your group lost the match.", false);
    }
  }
});