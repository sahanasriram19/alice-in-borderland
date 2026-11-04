/* Run initial setup functions once the page has fully loaded teehee*/
document.addEventListener("DOMContentLoaded", function () {
  getToken();
  eventListeners();
  loadPoints();
  initialLoad();
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

/* Main error message area shown at the top of the page */
const msg = document.getElementById("msg");

/* Container div where all challenge cards are rendered */
const challengeList = document.getElementById("challengeList");

/* Badge element in the header that displays the user's current points */
const pointsBadge = document.getElementById("pointsBadge");

/* Button that opens the create-challenge modal */
const openCreateBtn = document.getElementById("openCreateBtn");

/* Input fields and submit button inside the create-challenge modal */
const createDesc         = document.getElementById("createDesc");
const createPoints       = document.getElementById("createPoints");
const createChallengeBtn = document.getElementById("createChallengeBtn");

/* Error message element inside the create-challenge modal */
const createMsg = document.getElementById("createMsg");


/* API endpoint paths */

const PATH_PROFILE_ME   = "/api/profiles/me";
const PATH_CHALLENGES   = "/api/challenges";
const PATH_COMPLETED_ME = "/api/challenges/completed/me";


/* Application state */

/* Tracks the user's current point total — starts null until first server fetch */
let currentPoints = null;

/* Map of completed challenge IDs to their completion data, used for O(1) lookup */
let completedMap = new Map();


/* Animation timing  */

/* How long one float animation cycle takes in milliseconds */
const FLOAT_DURATION_MS = 3000;

/* Timestamp captured at page load, used to sync new cards into the float cycle */
const pageStartMs = performance.now();


/* Attach all event listeners using delegation so a single listener handles
   every card on the page rather than wiring up each card individually */
function eventListeners() {

  /* Flip a card when the user clicks anywhere on it that isn't a button, input, or label */
  document.addEventListener("click", function (e) {

    /* Ignore clicks on interactive elements so they don't accidentally flip the card */
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("label")) return;

    /* Walk up the DOM to find the nearest flip-card ancestor */
    const card = e.target.closest("[data-flip-card]");
    if (!card) return;

    /* Toggle the flipped state so the card rotates between front and back */
    card.classList.toggle("is-flipped");
  });

  /* Handle clicks on the Complete Challenge button on any card */
  document.addEventListener("click", function (e) {

    /* Find the complete button that was clicked, if any */
    const btn = e.target.closest("[data-action='complete']");
    if (!btn) return;

    /* Read the challenge ID and point reward stored on the button */
    const challengeId = btn.getAttribute("data-id");
    const reward      = Number(btn.getAttribute("data-reward")) || 0;

    /* Clear any previous error shown on this card before attempting again */
    clearCardError(challengeId);

    /* Read the proof text the user typed into the details input */
    const input   = document.getElementById("details-" + challengeId);
    const details = input ? input.value.trim() : "";

    /* Send the completion request to the server */
    completeChallenge(challengeId, details, reward);
  });

  /* Handle the edit, cancel, and save buttons for renaming a challenge */
  document.addEventListener("click", function (e) {

    /* Check which edit-related button was clicked */
    const btnEdit   = e.target.closest("[data-action='edit']");
    const btnCancel = e.target.closest("[data-action='cancelEdit']");
    const btnSave   = e.target.closest("[data-action='saveEdit']");

    /* Edit button — switch the card into edit mode */
    if (btnEdit) {
      const id = btnEdit.getAttribute("data-id");
      clearCardError(id);
      toggleEditMode(id, true);
      return;
    }

    /* Cancel button — discard changes and return to display mode */
    if (btnCancel) {
      const id = btnCancel.getAttribute("data-id");
      clearCardError(id);
      toggleEditMode(id, false);
      return;
    }

    /* Save button — validate the new name and send it to the server */
    if (btnSave) {
      const id      = btnSave.getAttribute("data-id");
      const points  = Number(btnSave.getAttribute("data-points")) || 0;
      const input   = document.getElementById("editInput-" + id);
      const newDesc = input ? input.value.trim() : "";

      clearCardError(id);

      /* Prevent saving an empty challenge name */
      if (!newDesc) return showCardError(id, "Challenge name cannot be empty.");

      updateChallenge(id, newDesc, points);
      return;
    }
  });

  /* Wire up the button that opens the create-challenge modal */
  if (openCreateBtn)      openCreateBtn.addEventListener("click", openCreateModal);

  /* Wire up the submit button inside the modal */
  if (createChallengeBtn) createChallengeBtn.addEventListener("click", handleCreateSubmit);

  /* Allow pressing Enter in the description field to submit the modal form */
  if (createDesc) {
    createDesc.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleCreateSubmit();
    });
  }

  /* Allow pressing Enter in the points field to submit the modal form */
  if (createPoints) {
    createPoints.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleCreateSubmit();
    });
  }
}


/* Show an error message inside the create-challenge modal */
function showCreateError(text) {

  /* Prefer the modal-specific error element if it exists */
  if (createMsg) {
    createMsg.textContent = text;
    createMsg.classList.remove("d-none");
    return;
  }

  /* Fall back to the main page error element if the modal one is missing */
  if (msg) {
    msg.textContent = text;
    msg.classList.remove("d-none");
  }
}

/* Hide and clear the error message inside the create-challenge modal */
function clearCreateError() {

  if (!createMsg) return;

  createMsg.classList.add("d-none");
  createMsg.textContent = "";
}


/* Show an error message on a specific challenge card */
function showCardError(challengeId, text) {

  /* Look for the error element that belongs to this card */
  const el = document.getElementById("cardMsg-" + challengeId);

  /* If the card element doesn't exist, fall back to the main page error area */
  if (!el) {
    if (msg) {
      msg.textContent = text;
      msg.classList.remove("d-none");
    }
    return;
  }

  /* Display the error on the card */
  el.textContent = text;
  el.classList.remove("d-none");
}

/* Hide and clear the error message on a specific challenge card */
function clearCardError(challengeId) {

  const el = document.getElementById("cardMsg-" + challengeId);
  if (!el) return;

  el.classList.add("d-none");
  el.textContent = "";
}


/* Set the points badge to a specific value with no animation */
function setPoints(points) {

  if (!pointsBadge) return;

  pointsBadge.textContent = "Points: " + points;
}

/* Animate the points badge smoothly from one value to another over 900 ms */
function animatePoints(from, to) {

  if (!pointsBadge) return;

  const start = Number(from);
  const end   = Number(to);

  /* If the values are invalid or identical, just set the final value immediately */
  if (!isFinite(start) || !isFinite(end) || start === end) {
    setPoints(end);
    return;
  }

  const duration  = 900;
  const startTime = performance.now();

  /* Each animation frame calculates the interpolated value and updates the badge */
  function tick(now) {
    const t   = Math.min(1, (now - startTime) / duration);
    const val = Math.round(start + (end - start) * t);

    setPoints(val);

    /* Keep requesting frames until the animation is complete */
    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


/* Fetch the user's profile from the server and update the points badge */
function loadPoints() {

  const callback = function (status, payload) {

    if (status !== 200) return;

    /* Extract the profile object from whichever response shape the API returns */
    const profile = (payload && payload.data && payload.data.profile)
      || (payload && payload.profile)
      || null;

    if (!profile) return;

    const nextPoints = Number(profile.points) || 0;

    /* On first load display the value instantly; on subsequent loads animate the change */
    if (currentPoints === null) {
      currentPoints = nextPoints;
      setPoints(nextPoints);
    } else {
      animatePoints(currentPoints, nextPoints);
      currentPoints = nextPoints;
    }
  };

  fetchMethod(currentUrl + PATH_PROFILE_ME, callback, "GET", null, token);
}


/* Fetch all challenges and completion data, then render the full card list */
function initialLoad() {

  /* Clear any leftover error message from a previous load attempt */
  if (msg) {
    msg.classList.add("d-none");
    msg.textContent = "";
  }

  /* First fetch the full list of available challenges */
  fetchAllChallenges(function (err, allChallenges) {

    if (err) {
      if (msg) {
        msg.textContent = err.message;
        msg.classList.remove("d-none");
      }
      return;
    }

    /* Then fetch which challenges this user has already completed */
    fetchCompletedChallenges(function (err2, completedRows) {

      if (err2) {
        if (msg) {
          msg.textContent = err2.message;
          msg.classList.remove("d-none");
        }
        return;
      }

      /* Rebuild the completed map so card rendering can check completion in O(1) */
      completedMap = new Map();

      (completedRows || []).forEach(function (row) {
        completedMap.set(Number(row.challenge_id), row);
      });

      /* Both datasets are ready — render the cards */
      renderChallenges(allChallenges);
    });
  });
}


/* Fetch the full list of challenges from the API */
function fetchAllChallenges(done) {

  const callback = function (status, payload) {

    if (status !== 200) return done(new Error((payload && payload.message) || "Failed to load challenges."));

    /* Support multiple possible response shapes from the API */
    const list = (payload && payload.data && payload.data.challenge)
      || (payload && payload.challenge)
      || [];

    done(null, Array.isArray(list) ? list : []);
  };

  fetchMethod(currentUrl + PATH_CHALLENGES, callback, "GET", null, token);
}


/* Fetch the list of challenges the current user has completed */
function fetchCompletedChallenges(done) {

  const callback = function (status, payload) {

    if (status !== 200) return done(new Error((payload && payload.message) || "Failed to load completed challenges."));

    /* Support multiple possible response shapes from the API */
    const list = (payload && payload.data && payload.data.completedChallenges)
      || (payload && payload.completedChallenges)
      || [];

    done(null, Array.isArray(list) ? list : []);
  };

  fetchMethod(currentUrl + PATH_COMPLETED_ME, callback, "GET", null, token);
}


/* Clear the challenge list and render a card for every challenge */
function renderChallenges(allChallenges) {

  if (!challengeList) return;

  /* Wipe the existing content before re-rendering */
  challengeList.innerHTML = "";

  /* Show an empty state message if there are no challenges to display */
  if (!allChallenges || allChallenges.length === 0) {
    challengeList.innerHTML =
      '<div class="col-12"><div class="card"><div class="card-body"><p class="m-0">No challenges available.</p></div></div></div>';
    return;
  }

  /* Build and append a card column for each challenge */
  allChallenges.forEach(function (c) {
    challengeList.appendChild(buildChallengeCol(c));
  });
}


/* Build the complete flip-card HTML element for a single challenge */
function buildChallengeCol(c) {

  /* Check the completedMap to know whether to show the completion badge or the input */
  const completion  = completedMap.get(Number(c.id));
  const isCompleted = Boolean(completion);

  /* Create the Bootstrap column wrapper */
  const col = document.createElement("div");
  col.className = "col-12 col-md-6 col-lg-4";
  col.setAttribute("data-challenge-id", String(c.id));

  /* Escape HTML special characters to prevent XSS from user-supplied data */
  const escapeHtml = function (str) {
    return String(str ?? "")
      .replace(/&/g,  "&amp;")
      .replace(/</g,  "&lt;")
      .replace(/>/g,  "&gt;")
      .replace(/"/g,  "&quot;")
      .replace(/'/g,  "&#039;");
  };

  /* Build the flip card with a front face and an interactive back face */
  col.innerHTML =
    '<div class="flip-card" data-flip-card>' +
    '  <div class="flip-inner">' +

    /* Decorative front face — no interactive content */
    '    <div class="flip-face flip-front"></div>' +

    /* Back face contains all the card content */
    '    <div class="flip-face flip-back">' +

    /* Per-card error message area, hidden by default */
    '      <div id="cardMsg-'     + c.id + '" class="alert alert-danger d-none mb-2"></div>' +

    /* Display mode: shows the challenge name, reward, and edit button */
    '      <div id="displayWrap-' + c.id + '">' +
    '        <h5 class="mb-2" id="descText-' + c.id + '">' + escapeHtml(c.description) + '</h5>' +
    '        <p class="mb-3">Reward: <strong>' + escapeHtml(c.points) + '</strong> points</p>' +
    '        <button class="btn btn-outline-dark w-100 mb-3" data-action="edit" data-id="' + c.id + '">Edit Challenge Name</button>' +
    '      </div>' +

    /* Edit mode: shows a text input pre-filled with the current name, plus cancel/save */
    '      <div class="d-none" id="editWrap-' + c.id + '">' +
    '        <label class="form-label mb-1" for="editInput-' + c.id + '">New Name</label>' +
    '        <input class="form-control mb-2" id="editInput-' + c.id + '" value="' + escapeHtml(c.description) + '" />' +
    '        <div class="d-flex gap-2 mb-3">' +
    '          <button class="btn btn-outline-dark w-50" data-action="cancelEdit" data-id="' + c.id + '">Cancel</button>' +
    '          <button class="btn w-50" data-action="saveEdit" data-id="' + c.id + '" data-points="' + escapeHtml(c.points) + '">Save</button>' +
    '        </div>' +
    '      </div>' +

    /* Bottom section differs depending on whether the challenge is already done */
    (isCompleted

      /* Completed state: show the user's proof and a completed badge */
      ? '      <div class="mt-auto">' +
        '        <div class="small text-muted mb-2">Your proof: ' + escapeHtml(completion.details || "—") + '</div>' +
        '        <div class="badge w-100 py-2 text-center">Completed</div>' +
        '      </div>'

      /* Incomplete state: show a proof input and the complete button */
      : '      <div class="mt-auto">' +
        '        <label class="form-label mb-1" for="details-' + c.id + '">Proof / Details</label>' +
        '        <input class="form-control mb-3" id="details-' + c.id + '" type="text" />' +
        '        <button class="btn w-100" data-action="complete" data-id="' + c.id + '" data-reward="' + escapeHtml(c.points) + '">Complete Challenge</button>' +
        '      </div>') +

    '    </div>' +
    '  </div>' +
    '</div>';

  return col;
}


/* Switch a card between its normal display mode and edit mode */
function toggleEditMode(id, isEditing) {

  const displayWrap = document.getElementById("displayWrap-" + id);
  const editWrap    = document.getElementById("editWrap-"    + id);

  /* Show the edit input and hide the normal display */
  if (isEditing) {
    if (displayWrap) displayWrap.classList.add("d-none");
    if (editWrap)    editWrap.classList.remove("d-none");

  /* Hide the edit input and restore the normal display */
  } else {
    if (editWrap)    editWrap.classList.add("d-none");
    if (displayWrap) displayWrap.classList.remove("d-none");
  }
}


/* Set a negative animation-delay so a newly added card floats in sync with existing ones */
function syncFloatPhase(targetEl) {

  if (!targetEl) return;

  /* Calculate how far through the current float cycle we are */
  const elapsed = (performance.now() - pageStartMs) % FLOAT_DURATION_MS;

  /* Rewinding the delay by the elapsed time makes the new card join mid-cycle */
  targetEl.style.animationDelay = (-elapsed / 1000) + "s";
}


/* POST to the complete endpoint and update the UI on success */
function completeChallenge(challengeId, details, rewardPoints) {

  const callback = function (status, payload) {

    /* Show an error on the card if the server rejected the request */
    if (status !== 201) {
      return showCardError(challengeId, (payload && payload.message) || "Failed to complete challenge.");
    }

    /* Clear any error messages now that the request succeeded */
    clearCardError(challengeId);

    if (msg) {
      msg.classList.add("d-none");
      msg.textContent = "";
    }

    /* Optimistically add the reward to the local points total and animate the badge */
    if (currentPoints !== null) {
      const next = Number(currentPoints) + (Number(rewardPoints) || 0);
      animatePoints(currentPoints, next);
      currentPoints = next;
    }

    /* Swap the card UI to show the completed state */
    markCardCompleted(challengeId, details);

    /* Re-fetch from the server to make sure the displayed total is accurate */
    loadPoints();
  };

  fetchMethod(currentUrl + PATH_CHALLENGES + "/" + challengeId + "/", callback, "POST", { details: details || "" }, token);
}


/* Replace the bottom section of a card with the completed badge and proof text */
function markCardCompleted(challengeId, details) {

  /* Record the completion in the map so future renders know this challenge is done */
  completedMap.set(Number(challengeId), { challenge_id: Number(challengeId), details: details || "—" });

  /* Find the back face of the correct card in the DOM */
  const backFace = document.querySelector("[data-challenge-id='" + challengeId + "'] .flip-face.flip-back");
  if (!backFace) return;

  /* Remove the old input/button section */
  const mtAuto = backFace.querySelector(".mt-auto");
  if (mtAuto) mtAuto.remove();

  /* Escape HTML to keep the user's proof text safe to insert */
  const escapeHtml = function (str) {
    return String(str ?? "")
      .replace(/&/g,  "&amp;")
      .replace(/</g,  "&lt;")
      .replace(/>/g,  "&gt;")
      .replace(/"/g,  "&quot;")
      .replace(/'/g,  "&#039;");
  };

  /* Build and append the completed badge section */
  const done = document.createElement("div");
  done.className = "mt-auto";
  done.innerHTML =
    '<div class="small text-muted mb-2">Your proof: ' + escapeHtml(details || "—") + '</div>' +
    '<div class="badge w-100 py-2 text-center">Completed</div>';

  backFace.appendChild(done);
}


/* PUT the new challenge name to the server and update the card on success */
function updateChallenge(challengeId, newDesc, points) {

  const callback = function (status, payload) {

    /* Show an error on the card if the update failed */
    if (status !== 200) {
      return showCardError(challengeId, (payload && payload.message) || "Failed to update challenge.");
    }

    clearCardError(challengeId);

    if (msg) {
      msg.classList.add("d-none");
      msg.textContent = "";
    }

    /* Update the visible title text in display mode */
    const descEl  = document.getElementById("descText-"  + challengeId);
    if (descEl)  descEl.textContent = newDesc;

    /* Also update the edit input so it reflects the saved value if edited again */
    const inputEl = document.getElementById("editInput-" + challengeId);
    if (inputEl) inputEl.value = newDesc;

    /* Return the card to display mode */
    toggleEditMode(challengeId, false);
  };

  fetchMethod(currentUrl + PATH_CHALLENGES + "/" + challengeId, callback, "PUT", { description: newDesc, points: points }, token);
}


/* POST a new challenge to the API and forward the response to the caller */
function createChallenge(description, points, done) {

  const callback = function (status, payload) {
    done(status, payload);
  };

  fetchMethod(currentUrl + PATH_CHALLENGES, callback, "POST", { description: description, points: points }, token);
}


/* Reset the modal fields and open the create-challenge modal */
function openCreateModal() {

  /* Clear any error left over from a previous attempt */
  clearCreateError();

  /* Reset the input fields so the modal opens blank */
  if (createDesc)   createDesc.value   = "";
  if (createPoints) createPoints.value = "";

  /* Use the AppModals helper to show the Bootstrap modal */
  if (typeof AppModals !== "undefined" && AppModals.open) {
    AppModals.open("createChallengeModal");
  }
}

/* Close the create-challenge modal via the AppModals helper */
function closeCreateModal() {

  if (typeof AppModals !== "undefined" && AppModals.close) {
    AppModals.close("createChallengeModal");
  }
}


/* Validate the modal inputs, submit the create request, and add the new card */
function handleCreateSubmit() {

  clearCreateError();

  /* Read and validate the description field */
  const desc = createDesc   ? createDesc.value.trim()    : "";
  const pts  = createPoints ? Number(createPoints.value) : NaN;

  if (!desc)                      return showCreateError("Challenge name cannot be empty.");
  if (!isFinite(pts) || pts <= 0) return showCreateError("Points must be a number greater than 0.");

  /* Disable the button and show a loading label to prevent double-submission */
  if (createChallengeBtn) {
    createChallengeBtn.disabled    = true;
    createChallengeBtn.textContent = "Creating...";
  }

  const done = function (status, payload) {

    /* Re-enable the button regardless of success or failure */
    if (createChallengeBtn) {
      createChallengeBtn.disabled    = false;
      createChallengeBtn.textContent = "Create Challenge";
    }

    /* Show an error in the modal if the server rejected the request */
    if (status !== 201 && status !== 200) {
      return showCreateError((payload && payload.message) || "Failed to create challenge.");
    }

    closeCreateModal();

    /* Extract the created challenge object from whatever shape the API returned */
    const created = (payload && payload.data && (payload.data.challenge || payload.data))
      || (payload && payload.challenge)
      || payload;

    /* If we can't get a valid challenge object, fall back to reloading everything */
    if (!created || typeof created !== "object" || !created.id) {
      initialLoad();
      return;
    }

    if (!challengeList) return;

    /* Build the new card and sync its float animation phase with existing cards */
    const col = buildChallengeCol(created);
    syncFloatPhase(col.querySelector(".flip-card") || col);
    challengeList.appendChild(col);
  };

  createChallenge(desc, pts, done);
}