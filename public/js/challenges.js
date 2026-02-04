// Event: DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  getToken();
  eventListeners();
  loadPoints();
  initialLoad();
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
const challengeList = document.getElementById("challengeList");
const pointsBadge = document.getElementById("pointsBadge");

// Create challenge modal elements
const openCreateBtn = document.getElementById("openCreateBtn");
const createDesc = document.getElementById("createDesc");
const createPoints = document.getElementById("createPoints");
const createChallengeBtn = document.getElementById("createChallengeBtn");
const createMsg = document.getElementById("createMsg");

// Endpoints
const PATH_PROFILE_ME = "/api/profiles/me";
const PATH_CHALLENGES = "/api/challenges";
const PATH_COMPLETED_ME = "/api/challenges/completed/me";

// State
let currentPoints = null;
let completedMap = new Map();

// Float sync
const FLOAT_DURATION_MS = 3000;
const pageStartMs = performance.now();

// Add all the Event Listeners
function eventListeners() {
  // Flip (delegate)
  document.addEventListener("click", function (e) {
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("label")) return;
    const card = e.target.closest("[data-flip-card]");
    if (!card) return;
    card.classList.toggle("is-flipped");
  });

  // Complete challenge (delegate)
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-action='complete']");
    if (!btn) return;

    const challengeId = btn.getAttribute("data-id");
    const reward = Number(btn.getAttribute("data-reward")) || 0;

    clearCardError(challengeId);

    const input = document.getElementById("details-" + challengeId);
    const details = input ? input.value.trim() : "";

    completeChallenge(challengeId, details, reward);
  });

  // Edit open / cancel / save (delegate)
  document.addEventListener("click", function (e) {
    const btnEdit = e.target.closest("[data-action='edit']");
    const btnCancel = e.target.closest("[data-action='cancelEdit']");
    const btnSave = e.target.closest("[data-action='saveEdit']");

    if (btnEdit) {
      const id = btnEdit.getAttribute("data-id");
      clearCardError(id);
      toggleEditMode(id, true);
      return;
    }

    if (btnCancel) {
      const id = btnCancel.getAttribute("data-id");
      clearCardError(id);
      toggleEditMode(id, false);
      return;
    }

    if (btnSave) {
      const id = btnSave.getAttribute("data-id");
      clearCardError(id);

      const points = Number(btnSave.getAttribute("data-points")) || 0;
      const input = document.getElementById("editInput-" + id);
      const newDesc = input ? input.value.trim() : "";

      if (!newDesc) return showCardError(id, "Challenge name cannot be empty.");

      updateChallenge(id, newDesc, points);
      return;
    }
  });

  // Modal open
  if (openCreateBtn) openCreateBtn.addEventListener("click", openCreateModal);

  if (createChallengeBtn) createChallengeBtn.addEventListener("click", handleCreateSubmit);

  // Enter submits inside modal
  if (createDesc) createDesc.addEventListener("keydown", function (e) {
    if (e.key === "Enter") handleCreateSubmit();
  });
  if (createPoints) createPoints.addEventListener("keydown", function (e) {
    if (e.key === "Enter") handleCreateSubmit();
  });
}

// Error Handling
function showCreateError(text) {
  if (createMsg) {
    createMsg.textContent = text;
    createMsg.classList.remove("d-none");
    return;
  }
  if (msg) {
    msg.textContent = text;
    msg.classList.remove("d-none");
  }
}

function clearCreateError() {
  if (!createMsg) return;
  createMsg.classList.add("d-none");
  createMsg.textContent = "";
}

function showCardError(challengeId, text) {
  const el = document.getElementById("cardMsg-" + challengeId);
  if (!el) {
    if (msg) {
      msg.textContent = text;
      msg.classList.remove("d-none");
    }
    return;
  }
  el.textContent = text;
  el.classList.remove("d-none");
}

function clearCardError(challengeId) {
  const el = document.getElementById("cardMsg-" + challengeId);
  if (!el) return;
  el.classList.add("d-none");
  el.textContent = "";
}

// Points
function setPoints(points) {
  if (!pointsBadge) return;
  pointsBadge.textContent = "Points: " + points;
}

function animatePoints(from, to) {
  if (!pointsBadge) return;
  const start = Number(from), end = Number(to);

  if (!isFinite(start) || !isFinite(end) || start === end) {
    setPoints(end);
    return;
  }
  const duration = 900, startTime = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const val = Math.round(start + (end - start) * t);

    setPoints(val);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function loadPoints() {
  const callback = function (status, payload) {
    if (status !== 200) return;

    const profile = (payload && payload.data && payload.data.profile) || (payload && payload.profile) || null;

    if (!profile) return;
    const nextPoints = Number(profile.points) || 0;

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

// Initial Load
function initialLoad() {
  if (msg) {
    msg.classList.add("d-none");
    msg.textContent = "";
  }

  fetchAllChallenges(function (err, allChallenges) {
    if (err) {
      if (msg) {
        msg.textContent = err.message;
        msg.classList.remove("d-none");
      }
      return;
    }

    fetchCompletedChallenges(function (err2, completedRows) {
      if (err2) {
        if (msg) {
          msg.textContent = err2.message;
          msg.classList.remove("d-none");
        }
        return;
      }
      completedMap = new Map();
      (completedRows || []).forEach(function (row) {
        completedMap.set(Number(row.challenge_id), row);
      });

      renderChallenges(allChallenges);
    });
  });
}

function fetchAllChallenges(done) {
  const callback = function (status, payload) {
    if (status !== 200) return done(new Error((payload && payload.message) || "Failed to load challenges."));

    const list = (payload && payload.data && payload.data.challenge) || (payload && payload.challenge) || [];

    done(null, Array.isArray(list) ? list : []);
  };
  fetchMethod(currentUrl + PATH_CHALLENGES, callback, "GET", null, token);
}

function fetchCompletedChallenges(done) {
  const callback = function (status, payload) {
    if (status !== 200) return done(new Error((payload && payload.message) || "Failed to load completed challenges."));

    const list = (payload && payload.data && payload.data.completedChallenges) || (payload && payload.completedChallenges) || [];
    done(null, Array.isArray(list) ? list : []);
  };
  fetchMethod(currentUrl + PATH_COMPLETED_ME, callback, "GET", null, token);
}

// Rendering
function renderChallenges(allChallenges) {
  if (!challengeList) return;
  challengeList.innerHTML = "";

  if (!allChallenges || allChallenges.length === 0) {
    challengeList.innerHTML = '<div class="col-12"><div class="card"><div class="card-body"><p class="m-0">No challenges available.</p></div></div></div>';
    return;
  }

  allChallenges.forEach(function (c) {
    challengeList.appendChild(buildChallengeCol(c));
  });
}

function buildChallengeCol(c) {
  const completion = completedMap.get(Number(c.id));

  const isCompleted = Boolean(completion);

  const col = document.createElement("div");
  col.className = "col-12 col-md-6 col-lg-4";

  col.setAttribute("data-challenge-id", String(c.id));

  // Escape HTML for security
  const escapeHtml = function(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  col.innerHTML =
    '<div class="flip-card" data-flip-card>' +
    '  <div class="flip-inner">' +
    '    <div class="flip-face flip-front"></div>' +
    '    <div class="flip-face flip-back">' +
    '      <div id="cardMsg-' + c.id + '" class="alert alert-danger d-none mb-2"></div>' +
    '      <div id="displayWrap-' + c.id + '">' +
    '        <h5 class="mb-2" id="descText-' + c.id + '">' + escapeHtml(c.description) + "</h5>" +
    '        <p class="mb-3">Reward: <strong>' + escapeHtml(c.points) + "</strong> points</p>" +
    '        <button class="btn btn-outline-dark w-100 mb-3" data-action="edit" data-id="' + c.id + '">Edit Challenge Name</button>' +
    "      </div>" +
    '      <div class="d-none" id="editWrap-' + c.id + '">' +
    '        <label class="form-label mb-1" for="editInput-' + c.id + '">New Name</label>' +
    '        <input class="form-control mb-2" id="editInput-' + c.id + '" value="' + escapeHtml(c.description) + '" />' +
    '        <div class="d-flex gap-2 mb-3">' +
    '          <button class="btn btn-outline-dark w-50" data-action="cancelEdit" data-id="' + c.id + '">Cancel</button>' +
    '          <button class="btn w-50" data-action="saveEdit" data-id="' + c.id + '" data-points="' + escapeHtml(c.points) + '">Save</button>' +
    "        </div>" +
    "      </div>" +
    (isCompleted
      ? '      <div class="mt-auto">' +
        '        <div class="small text-muted mb-2">Your proof: ' + escapeHtml(completion.details || "—") + "</div>" +
        '        <div class="badge w-100 py-2 text-center">Completed</div>' +
        "      </div>"
      : '      <div class="mt-auto">' +
        '        <label class="form-label mb-1" for="details-' + c.id + '">Proof / Details</label>' +
        '        <input class="form-control mb-3" id="details-' + c.id + '" type="text" />' +
        '        <button class="btn w-100" data-action="complete" data-id="' + c.id + '" data-reward="' + escapeHtml(c.points) + '">Complete Challenge</button>' +
        "      </div>") +
    "    </div>" +
    "  </div>" +
    "</div>";

  return col;
}

function toggleEditMode(id, isEditing) {
  const displayWrap = document.getElementById("displayWrap-" + id);
  const editWrap = document.getElementById("editWrap-" + id);

  if (isEditing) {
    if (displayWrap) displayWrap.classList.add("d-none");
    if (editWrap) editWrap.classList.remove("d-none");
  } else {
    if (editWrap) editWrap.classList.add("d-none");
    if (displayWrap) displayWrap.classList.remove("d-none");
  }
}

// Float Sync
function syncFloatPhase(targetEl) {
  if (!targetEl) return;

  const elapsed = (performance.now() - pageStartMs) % FLOAT_DURATION_MS;
  targetEl.style.animationDelay = (-elapsed / 1000) + "s";
}

// Challenge Actions
function completeChallenge(challengeId, details, rewardPoints) {
  const callback = function (status, payload) {
    if (status !== 201) return showCardError(challengeId, (payload && payload.message) || "Failed to complete challenge.");
    clearCardError(challengeId);

    if (msg) {
      msg.classList.add("d-none");
      msg.textContent = "";
    }

    if (currentPoints !== null) {
      const next = Number(currentPoints) + (Number(rewardPoints) || 0);

      animatePoints(currentPoints, next);
      currentPoints = next;
    }

    markCardCompleted(challengeId, details);
    loadPoints();
  };
  fetchMethod(currentUrl + PATH_CHALLENGES + "/" + challengeId + "/", callback, "POST", { details: details || "" }, token);
}

function markCardCompleted(challengeId, details) {
  completedMap.set(Number(challengeId), { challenge_id: Number(challengeId), details: details || "—" });

  const backFace = document.querySelector("[data-challenge-id='" + challengeId + "'] .flip-face.flip-back");
  if (!backFace) return;

  const mtAuto = backFace.querySelector(".mt-auto");
  if (mtAuto) mtAuto.remove();
  const done = document.createElement("div");
  done.className = "mt-auto";

  const escapeHtml = function(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  done.innerHTML = '<div class="small text-muted mb-2">Your proof: ' + escapeHtml(details || "—") + '</div><div class="badge w-100 py-2 text-center">Completed</div>';

  backFace.appendChild(done);
}

function updateChallenge(challengeId, newDesc, points) {
  const callback = function (status, payload) {
    if (status !== 200) return showCardError(challengeId, (payload && payload.message) || "Failed to update challenge.");

    clearCardError(challengeId);
    if (msg) {
      msg.classList.add("d-none");
      msg.textContent = "";
    }
    const descEl = document.getElementById("descText-" + challengeId);

    if (descEl) descEl.textContent = newDesc;
    const inputEl = document.getElementById("editInput-" + challengeId);

    if (inputEl) inputEl.value = newDesc;
    toggleEditMode(challengeId, false);
  };
  fetchMethod(currentUrl + PATH_CHALLENGES + "/" + challengeId, callback, "PUT", { description: newDesc, points: points }, token);
}

function createChallenge(description, points, done) {
  const callback = function (status, payload) {
    done(status, payload);
  };

  fetchMethod(currentUrl + PATH_CHALLENGES, callback, "POST", { description: description, points: points }, token);
}

// Modal Open / Close
function openCreateModal() {
  clearCreateError();
  if (createDesc) createDesc.value = "";
  if (createPoints) createPoints.value = "";
  
  // Use AppModals if available
  if (typeof AppModals !== "undefined" && AppModals.open) {
    AppModals.open("createChallengeModal");
  }
}

function closeCreateModal() {
  // Use AppModals if available
  if (typeof AppModals !== "undefined" && AppModals.close) {
    AppModals.close("createChallengeModal");
  }
}

function handleCreateSubmit() {
  clearCreateError();

  const desc = createDesc ? createDesc.value.trim() : "";
  const pts = createPoints ? Number(createPoints.value) : NaN;

  if (!desc) return showCreateError("Challenge name cannot be empty.");

  if (!isFinite(pts) || pts <= 0) return showCreateError("Points must be a number greater than 0.");

  if (createChallengeBtn) {
    createChallengeBtn.disabled = true;
    createChallengeBtn.textContent = "Creating...";
  }

  const done = function (status, payload) {
    if (createChallengeBtn) {
      createChallengeBtn.disabled = false;
      createChallengeBtn.textContent = "Create Challenge";
    }

    if (status !== 201 && status !== 200) return showCreateError((payload && payload.message) || "Failed to create challenge.");
    closeCreateModal();

    const created = (payload && payload.data && (payload.data.challenge || payload.data)) || (payload && payload.challenge) || payload;

    if (!created || typeof created !== "object" || !created.id) {
      initialLoad();
      return;
    }
    if (!challengeList) return;

    const col = buildChallengeCol(created);

    syncFloatPhase(col.querySelector(".flip-card") || col);

    challengeList.appendChild(col);
  };

  createChallenge(desc, pts, done);
}