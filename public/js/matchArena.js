/* Run initial setup once the page has fully loaded */
document.addEventListener("DOMContentLoaded", function () {
  getToken();
  checkPreflight();
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

/* Elements that display the two competing group names */
const myGroupEl    = document.getElementById("myGroupName");
const enemyGroupEl = document.getElementById("enemyGroupName");

/* Button the user clicks to start the match */
const beginBtn = document.getElementById("beginMatchBtn");

/* Popup element used to show match results and error messages */
const popupEl = document.getElementById("arenaMsg");


/* URL parameters and state */

/* Read the group_id the user joined from the URL query string */
const params    = new URLSearchParams(window.location.search);
const myGroupId = Number(params.get("group_id"));

/* Will hold the randomly selected opponent group object once groups load */
let enemyGroup = null;

/* Will hold the match ID returned by the server after match creation */
let matchId = null;


/* API endpoint paths */

const GROUPS_PATH  = "/api/groups";
const MATCHES_PATH = "/api/matches";

/* Returns the resolve endpoint for a specific match ID */
const RESOLVE_PATH = function (id) { return "/api/matches/" + id + "/resolve"; };


/* Verify that required globals and URL parameters exist before doing anything else */
function checkPreflight() {

  /* currentUrl must be defined by an external script included before this one */
  if (typeof currentUrl === "undefined") {
    showArenaMessage("currentUrl is not defined. Include getCurrentURL.js before matchArena.js", false);
    return;
  }

  /* A group_id in the URL is required to know which group this user joined */
  if (!myGroupId) {
    showArenaMessage("Missing group info.", false);
    return;
  }
}


/* Wire the Begin Match button to the match flow handler */
function eventListeners() {

  if (!beginBtn) return;

  beginBtn.addEventListener("click", onBeginMatch);
}


/* Disable the button, create the match, then immediately resolve it */
function onBeginMatch() {

  /* Put the button into a loading state while the request is in flight */
  setBeginButtonState(true);

  /* Step 1: create the match record on the server */
  createMatch(function (err, id) {

    /* Re-enable the button and show an error if match creation failed */
    if (err) {
      setBeginButtonState(false);
      showArenaMessage(err, false);
      return;
    }

    /* Store the match ID so the resolve call can reference it */
    matchId = id;

    /* Step 2: resolve the match to determine the winner */
    resolveMatch();
  });
}


/* Toggle the begin button between its normal and loading states */
function setBeginButtonState(loading) {

  if (!beginBtn) return;

  /* Disable the button and change its label while loading to prevent double-clicks */
  beginBtn.disabled    = loading;
  beginBtn.textContent = loading ? "Resolving match..." : "Begin Match";
}


/* Show a temporary popup message with a green glow for success or red for failure */
function showArenaMessage(text, success) {

  if (!popupEl) return;

  /* Set the message text and make the popup visible */
  popupEl.textContent = text;
  popupEl.classList.remove("d-none");

  /* Apply the appropriate glow colour based on the outcome */
  popupEl.style.boxShadow = success
    ? "0 0 20px rgba(80,255,120,0.6), 0 0 50px rgba(80,255,120,0.3)"
    : "0 0 20px rgba(255,80,80,0.6), 0 0 50px rgba(255,80,80,0.3)";

  /* Automatically hide the popup after 3.5 seconds */
  setTimeout(function () {
    popupEl.classList.add("d-none");
  }, 3500);
}


/* Fetch all groups, find the user's group and a random opponent, then display both names */
function loadGroups() {

  const callback = function (status, payload) {

    /* Show an error popup if the fetch failed */
    if (status !== 200) {
      showArenaMessage((payload && payload.message) || "Failed to load groups", false);
      return;
    }

    /* Extract the groups array from whichever response shape the API returned */
    let groups = (payload && payload.data && payload.data.groups)
      || (payload && payload.groups)
      || [];

    if (!Array.isArray(groups)) groups = [];

    /* Find the user's own group and pick a random opponent from the rest */
    const myGroup = findGroup(groups, myGroupId);
    enemyGroup    = pickEnemy(groups, myGroupId);

    /* If either group is missing we can't run a match */
    if (!myGroup || !enemyGroup) {
      showArenaMessage("Could not find opponent.", false);
      return;
    }

    /* Display both group names in the arena UI */
    renderGroupNames(myGroup, enemyGroup);
  };

  fetchMethod(currentUrl + GROUPS_PATH, callback, "GET", null, token);
}

/* Write both group names into their respective display elements */
function renderGroupNames(myGroup, enemy) {

  if (myGroupEl)    myGroupEl.textContent    = myGroup.name;
  if (enemyGroupEl) enemyGroupEl.textContent = enemy.name;
}


/* Search the groups array for the one whose id matches the given id */
function findGroup(groups, id) {

  for (let i = 0; i < groups.length; i++) {

    /* Compare as numbers to avoid type mismatch issues */
    if (Number(groups[i].id) === Number(id)) return groups[i];
  }

  /* Return null if no matching group was found */
  return null;
}


/* Pick a random group from the list, excluding the user's own group */
function pickEnemy(groups, myId) {

  /* Filter out the user's own group to get only valid opponents */
  const others = groups.filter(function (g) {
    return Number(g.id) !== Number(myId);
  });

  /* Return null if there are no other groups to fight */
  if (!others.length) return null;

  /* Select one at random from the remaining groups */
  return others[Math.floor(Math.random() * others.length)];
}


/* POST a new match to the server and return its ID via the callback */
function createMatch(done) {

  /* Build the match payload with both group IDs and the current season */
  const data = {
    group_a_id: myGroupId,
    group_b_id: enemyGroup.id,
    season_id:  1
  };

  const callback = function (status, payload) {

    /* Return an error through the callback if match creation failed */
    if (status !== 201) {
      return done((payload && payload.message) || "Failed to create match");
    }

    /* Extract the data object from the response */
    const dataObj = (payload && payload.data) || payload;

    /* Try several possible locations for the match ID in the response */
    const id =
      (dataObj && dataObj.match_id) ||
      (dataObj && dataObj.id) ||
      (dataObj && dataObj.result && dataObj.result.match_id) ||
      null;

    /* The match was created but we can't proceed without its ID */
    if (!id) return done("Match created but ID missing.");

    done(null, id);
  };

  fetchMethod(currentUrl + MATCHES_PATH, callback, "POST", data, token);
}


/* Call the resolve endpoint and show a win, draw, or loss message */
function resolveMatch() {

  const callback = function (status, payload) {

    /* Re-enable the begin button now that the request has completed */
    setBeginButtonState(false);

    /* Show an error popup if the resolution request failed */
    if (status !== 200) {
      showArenaMessage((payload && payload.message) || "Match resolution failed", false);
      return;
    }

    /* Dig out the result object from whichever response shape the API returned */
    const dataObj  = (payload && payload.data) || payload;
    const result   = dataObj && dataObj.result ? dataObj.result : dataObj;
    const winnerId = result ? result.winner_group_id : null;

    /* No winner ID means the user's group won */
    if (!winnerId) {
      showArenaMessage("Your group won the match. You win 5 tokens!", true);

    /* Winner ID matching the user's group means it's a draw */                    
    } else if (Number(winnerId) === Number(myGroupId)) {
      showArenaMessage("Its a draw! Both groups win 2 tokens", true);

    /* Any other winner ID means the user's group lost */
    } else {
      showArenaMessage("Your group lost the match.", false);
    }
  };

  fetchMethod(currentUrl + RESOLVE_PATH(matchId), callback, "POST", null, token);
}