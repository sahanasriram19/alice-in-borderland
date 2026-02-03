document.addEventListener("DOMContentLoaded", function () {
  var token = localStorage.getItem("token");

  // DOM Elements
  var msg = AppHelpers.byId("msg"); 
  var challengeList = AppHelpers.byId("challengeList");
  var pointsBadge = AppHelpers.byId("pointsBadge"); 

  // Create challenge modal elements
  var openCreateBtn = AppHelpers.byId("openCreateBtn"); 
  var createDesc = AppHelpers.byId("createDesc"); 
  var createPoints = AppHelpers.byId("createPoints"); 
  var createChallengeBtn = AppHelpers.byId("createChallengeBtn"); 
  var createMsg = AppHelpers.byId("createMsg"); 

  // Endpoints
  var PATH_PROFILE_ME = "/api/profiles/me";
  var PATH_CHALLENGES = "/api/challenges"; 
  var PATH_COMPLETED_ME = "/api/challenges/completed/me"; 

  // State
  var currentPoints = null; 
  var completedMap = new Map(); 

  // Float sync
  var FLOAT_DURATION_MS = 3000; 
  var pageStartMs = performance.now(); 

  init(); 

  // Initialization
  function init() {
    if (typeof AppHelpers === "undefined") {
      console.error("AppHelpers not loaded. Include AppHelpers.js BEFORE challenges.js"); 
      return;
    }

    if (typeof AppModals === "undefined") {
      console.error("AppModals not loaded. Include AppModals.js BEFORE challenges.js"); 
      return;
    }

    if (typeof currentUrl === "undefined") {
      AppHelpers.showPageError
      (msg, "currentUrl is not defined. Include getCurrentURL.js before challenges.js"); 
      return;
    }

    if (!token) {
      AppHelpers.showPageError
      (msg, "No token found. Please login first."); 
      return;
    }

    AppHelpers.clearPageError(msg);
    wireEvents(); 
    loadPoints(); 
    initialLoad(); 
  }

  // Event Wiring
  function wireEvents() {
    // Flip (delegate) // ...
    document.addEventListener("click", function (e) {

      if (e.target.closest("button") || e.target.closest("input") ||
       e.target.closest("label")) return;
      var card = e.target.closest("[data-flip-card]");
      if (!card) return;
      card.classList.toggle("is-flipped"); 
    });

    // Complete challenge (delegate) // ...
    document.addEventListener("click", function (e) {

      var btn = e.target.closest("[data-action='complete']");
      if (!btn) return;

      var challengeId = btn.getAttribute("data-id");
      var reward = Number(btn.getAttribute("data-reward")) || 0;

      clearCardError(challengeId); 

      var input = AppHelpers.byId("details-" + challengeId);
      var details = input ? input.value.trim() : "";

      completeChallenge(challengeId, details, reward); 
    });

    // Edit open / cancel / save (delegate) 
    document.addEventListener("click", function (e) {

      var btnEdit = e.target.closest("[data-action='edit']");
      var btnCancel = e.target.closest("[data-action='cancelEdit']");
      var btnSave = e.target.closest("[data-action='saveEdit']");

      if (btnEdit) {
        var id = btnEdit.getAttribute("data-id");
        clearCardError(id);
        toggleEditMode(id, true);
        return;
      }

      if (btnCancel) {
        var id = btnCancel.getAttribute("data-id");
        clearCardError(id);
        toggleEditMode(id, false);
        return;
      }

      if (btnSave) {
        var id = btnSave.getAttribute("data-id");
        clearCardError(id);

        var points = Number(btnSave.getAttribute("data-points")) || 0;
        var input = AppHelpers.byId("editInput-" + id);
        var newDesc = input ? input.value.trim() : "";

        if (!newDesc) return showCardError(id, "Challenge name cannot be empty.");

        updateChallenge(id, newDesc, points);
        return;
      }
    });

    // Modal open // ...
    if (openCreateBtn) openCreateBtn.addEventListener("click", openCreateModal); 

    if (createChallengeBtn) createChallengeBtn.addEventListener("click", handleCreateSubmit); 

    // Enter submits inside modal // ...
    if (createDesc) createDesc.addEventListener("keydown", function (e) {

      if (e.key === "Enter") handleCreateSubmit();
    });
    if (createPoints) createPoints.addEventListener("keydown", function (e) {

      if (e.key === "Enter") handleCreateSubmit();
    });
  }

  // Error Handling
  function showCreateError(text) { if (createMsg) 
    return AppHelpers.showPageError(createMsg, text); AppHelpers.showPageError(msg, text); } 

  function clearCreateError() { if (!createMsg) 
    return; AppHelpers.clearPageError(createMsg); } 

  function showCardError(challengeId, text) { var el = AppHelpers.byId("cardMsg-" + challengeId); if (!el) 
    return AppHelpers.showPageError(msg, text); 
    AppHelpers.showPageError(el, text); } 

  function clearCardError(challengeId) { var el = AppHelpers.byId("cardMsg-" + challengeId); if (!el) 
    return; AppHelpers.clearPageError(el); } 


  // Points
  function setPoints(points) { if (!pointsBadge) return; pointsBadge.textContent = "Points: " + points; } 

  function animatePoints(from, to) { 

    if (!pointsBadge) return;
    var start = Number(from), end = Number(to);

    if (!isFinite(start) || !isFinite(end) || start === end) { setPoints(end); return; }
    var duration = 900, startTime = performance.now();

    function tick(now) { var t = Math.min(1, (now - startTime) / duration); var val = 
      Math.round(start + (end - start) * t);

    setPoints(val); if (t < 1) requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
  }
  function loadPoints() {
    const callback = function (status, payload) {

      if (status !== 200) return;

      var profile = (payload && payload.data && payload.data.profile) 
      || (payload && payload.profile) || null;

      if (!profile) return;
      var nextPoints = Number(profile.points) || 0;

      if (currentPoints === null) { currentPoints = nextPoints; setPoints(nextPoints); }
      else { animatePoints(currentPoints, nextPoints); currentPoints = nextPoints; }
    };
    fetchMethod(currentUrl + PATH_PROFILE_ME, callback, "GET", null, token);
  }

  // Initial Load
  function initialLoad() { 

    AppHelpers.clearPageError(msg);

    fetchAllChallenges(function (err, allChallenges) {

      if (err) return AppHelpers.showPageError(msg, err.message);

      fetchCompletedChallenges(function (err2, completedRows) {

        if (err2) return AppHelpers.showPageError(msg, err2.message);
        completedMap = new Map();
        (completedRows || []).forEach(function (row) { completedMap.set(Number(row.challenge_id), row); });

        renderChallenges(allChallenges);
      });
    });
  }

  function fetchAllChallenges(done) { 

    const callback = function (status, payload) {

      if (status !== 200) return done(new Error((payload && payload.message) 
        || "Failed to load challenges."));

      var list = (payload && payload.data && payload.data.challenge) 
      || (payload && payload.challenge) || [];

      done(null, Array.isArray(list) ? list : []);
    };
    fetchMethod(currentUrl + PATH_CHALLENGES, callback, "GET", null, token);
  }

  function fetchCompletedChallenges(done) { 

    const callback = function (status, payload) {

      if (status !== 200) return done(new Error((payload && payload.message) 
        || "Failed to load completed challenges."));

      var list = (payload && payload.data && payload.data.completedChallenges) 
      || (payload && payload.completedChallenges) || [];
      done(null, Array.isArray(list) ? list : []);
    };
    fetchMethod(currentUrl + PATH_COMPLETED_ME, callback, "GET", null, token);
  }

  // Rendering
  function renderChallenges(allChallenges) { // ...
    
    
    if (!challengeList) return; challengeList.innerHTML = "";
    
    if (!allChallenges || allChallenges.length === 0) {
      challengeList.innerHTML = '<div class="col-12"><div class="card"><div class="card-body"><p class="m-0">No challenges available.</p></div></div></div>';
      return;
    }
    
    
    
    allChallenges.forEach(function (c) { challengeList.appendChild(buildChallengeCol(c)); });
  }

  function buildChallengeCol(c) { // ...
    var completion = completedMap.get(Number(c.id));
    
    var isCompleted = Boolean(completion);

    var col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";
    
    
    
    
    col.setAttribute("data-challenge-id", String(c.id));

    col.innerHTML =
    
    '<div class="flip-card" data-flip-card>' +
      '  <div class="flip-inner">' +
    
      '    <div class="flip-face flip-front"></div>' +
      '    <div class="flip-face flip-back">' +
    
      '      <div id="cardMsg-' + c.id + '" class="alert alert-danger d-none mb-2"></div>' +
      '      <div id="displayWrap-' + c.id + '">' +
      '        <h5 class="mb-2" id="descText-' + c.id + '">' + AppHelpers.escapeHtml(c.description) + "</h5>" +
      '        <p class="mb-3">Reward: <strong>' + AppHelpers.escapeHtml(c.points) + "</strong> points</p>" +
      '        <button class="btn btn-outline-dark w-100 mb-3" data-action="edit" data-id="' + c.id + '">Edit Challenge Name</button>' +
    
    
      "      </div>" +
      '      <div class="d-none" id="editWrap-' + c.id + '">' +
      '        <label class="form-label mb-1" for="editInput-' + c.id + '">New Name</label>' +
      '        <input class="form-control mb-2" id="editInput-' + c.id + '" value="' + AppHelpers.escapeHtml(c.description) + '" />' +
      '        <div class="d-flex gap-2 mb-3">' +
      '          <button class="btn btn-outline-dark w-50" data-action="cancelEdit" data-id="' + c.id + '">Cancel</button>' +
      '          <button class="btn w-50" data-action="saveEdit" data-id="' + c.id + '" data-points="' + AppHelpers.escapeHtml(c.points) + '">Save</button>' +
      "        </div>" +
      "      </div>" +
      (isCompleted
        ? '      <div class="mt-auto">' +
          '        <div class="small text-muted mb-2">Your proof: ' + AppHelpers.escapeHtml(completion.details || "—") + "</div>" +
          '        <div class="badge w-100 py-2 text-center">Completed</div>' +
          "      </div>"
        : '      <div class="mt-auto">' +
          '        <label class="form-label mb-1" for="details-' + c.id + '">Proof / Details</label>' +
          '        <input class="form-control mb-3" id="details-' + c.id + '" type="text" />' +
          '        <button class="btn w-100" data-action="complete" data-id="' + c.id + '" data-reward="' + AppHelpers.escapeHtml(c.points) + '">Complete Challenge</button>' +
          "      </div>") +
      "    </div>" +
      "  </div>" +
      "</div>";

    return col;
  }

  function toggleEditMode(id, isEditing) { 

    var displayWrap = AppHelpers.byId("displayWrap-" + id);
    var editWrap = AppHelpers.byId("editWrap-" + id);

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

    var elapsed = (performance.now() - pageStartMs) % FLOAT_DURATION_MS;
    targetEl.style.animationDelay = (-elapsed / 1000) + "s";
  }


  // Challenge Actions
  function completeChallenge(challengeId, details, rewardPoints) { 
    const callback = function (status, payload) {

      if (status !== 201) return showCardError(challengeId, (payload && payload.message) 
      || "Failed to complete challenge.");
      clearCardError(challengeId);

      AppHelpers.clearPageError(msg);

      if (currentPoints !== null) {
        var next = Number(currentPoints) + (Number(rewardPoints) || 0);

        animatePoints(currentPoints, next);
        currentPoints = next;
      }

      markCardCompleted(challengeId, details);
      loadPoints();
    };
    fetchMethod(currentUrl + PATH_CHALLENGES + "/" + challengeId + "/", callback, "POST", 
      { details: details || "" }, token);
  }

  function markCardCompleted(challengeId, details) { 

    completedMap.set(Number(challengeId), 
    { challenge_id: Number(challengeId), details: details || "—" });

    var backFace = document.querySelector("[data-challenge-id='" + challengeId + "'] .flip-face.flip-back");
    if (!backFace) return;

    var mtAuto = backFace.querySelector(".mt-auto"); if (mtAuto) mtAuto.remove();
    var done = document.createElement("div"); done.className = "mt-auto";

    done.innerHTML = '<div class="small text-muted mb-2">Your proof: ' 
    + AppHelpers.escapeHtml(details || "—") + 
    '</div><div class="badge w-100 py-2 text-center">Completed</div>';

    backFace.appendChild(done);
  }

  function updateChallenge(challengeId, newDesc, points) { 
    const callback = function (status, payload) {

      if (status !== 200) return showCardError(challengeId, (payload && payload.message) 
        || "Failed to update challenge.");

      clearCardError(challengeId); AppHelpers.clearPageError(msg);
      var descEl = AppHelpers.byId("descText-" + challengeId); 

      if (descEl) descEl.textContent = newDesc;
      var inputEl = AppHelpers.byId("editInput-" + challengeId); 

      if (inputEl) inputEl.value = newDesc;
      toggleEditMode(challengeId, false);

    };
    fetchMethod(currentUrl + PATH_CHALLENGES + "/" + challengeId, callback, "PUT",
       { description: newDesc, points: points }, token);
  }

  function createChallenge(description, points, done) { 

    const callback = function (status, payload) { done(status, payload); };

    fetchMethod(currentUrl + PATH_CHALLENGES, callback, "POST", 
      { description: description, points: points }, token);
  }

  // Modal Open / Close
  function openCreateModal() { clearCreateError(); if (createDesc) createDesc.value = ""; 
    if (createPoints) createPoints.value = "";
     AppModals.open("createChallengeModal"); } 

  function closeCreateModal() { AppModals.close("createChallengeModal"); }

  function handleCreateSubmit() { 
    clearCreateError();

    var desc = createDesc ? createDesc.value.trim() : "";
    var pts = createPoints ? Number(createPoints.value) : NaN;

    if (!desc) return showCreateError("Challenge name cannot be empty.");

    if (!isFinite(pts) || pts <= 0) 
      return showCreateError("Points must be a number greater than 0.");

    if (createChallengeBtn) { createChallengeBtn.disabled = true; 
      createChallengeBtn.textContent = "Creating..."; }

    var done = function (status, payload) {

      if (createChallengeBtn) { createChallengeBtn.disabled = false;
         createChallengeBtn.textContent = "Create Challenge"; }

      if (status !== 201 && status !== 200) 
        return showCreateError((payload && payload.message) || "Failed to create challenge.");
      closeCreateModal();

      var created = (payload && payload.data && (payload.data.challenge 
        || payload.data)) || (payload && payload.challenge) || payload;

      if (!created || typeof created !== "object" || !created.id) { initialLoad(); return; }
      if (!challengeList) return;

      var col = buildChallengeCol(created);

      syncFloatPhase(col.querySelector(".flip-card") || col);

      challengeList.appendChild(col);
    };

    createChallenge(desc, pts, done);
  }
});