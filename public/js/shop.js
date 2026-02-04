// Event: DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  getToken();
  eventListeners();
  loadPoints();
  loadItems();
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
const itemList = document.getElementById("itemList");
const pointsBadge = document.getElementById("pointsBadge");

// State
let currentPoints = null;

// Endpoints
const SHOP_LIST_PATH = "/api/shop";
const SHOP_BUY_PATH = function (id) {
  return "/api/shop/" + id + "/buy";
};
const PROFILE_ME_PATH = "/api/profiles/me";

// Add all the Event Listeners
function eventListeners() {
  document.addEventListener("click", onBuyClick);
}

function onBuyClick(e) {
  const btn = e.target.closest("[data-action='buy']");
  if (!btn) return;

  const itemId = btn.getAttribute("data-id");
  const cost = Number(btn.getAttribute("data-cost")) || 0;

  clearCardError(itemId);
  if (msg) {
    msg.classList.add("d-none");
    msg.textContent = "";
  }

  // Optimistic preview
  if (currentPoints !== null) {
    animatePoints(currentPoints, Math.max(0, currentPoints - cost));
  }

  btn.disabled = true;

  buyItem(itemId, function (status, data) {
    btn.disabled = false;

    if (status !== 200 && status !== 201) {
      loadPoints(); // restore truth
      return showCardError(itemId, (data && data.message) || "Purchase failed.");
    }

    clearCardError(itemId);
    loadPoints();
  });
}

// UI Helpers
function setPoints(points) {
  if (!pointsBadge) return;
  pointsBadge.textContent = "Points: " + points;
}

function animatePoints(from, to) {
  if (!pointsBadge) return;

  const start = Number(from);
  const end = Number(to);

  if (!isFinite(start) || !isFinite(end) || start === end) {
    setPoints(end);
    return;
  }

  const duration = 900;
  const startTime = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const val = Math.round(start + (end - start) * t);
    setPoints(val);
    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function showCardError(itemId, text) {
  const el = document.getElementById("cardMsg-" + itemId);
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

function clearCardError(itemId) {
  const el = document.getElementById("cardMsg-" + itemId);
  if (!el) return;
  el.classList.add("d-none");
  el.textContent = "";
}

// Data Loaders
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

  fetchMethod(currentUrl + PROFILE_ME_PATH, callback, "GET", null, token);
}

function loadItems() {
  const callback = function (status, payload) {
    if (status !== 200) {
      if (msg) {
        msg.textContent = (payload && payload.message) || "Failed to load shop items.";
        msg.classList.remove("d-none");
      }
      return;
    }

    const items = (payload && payload.data && payload.data.items) || (payload && payload.items) || [];
    renderItems(Array.isArray(items) ? items : []);
  };

  fetchMethod(currentUrl + SHOP_LIST_PATH, callback, "GET", null, token);
}

// Render
function renderItems(items) {
  if (!itemList) return;

  itemList.innerHTML = "";

  if (!items.length) {
    itemList.innerHTML = `
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <p class="m-0">No items available.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  items.forEach(function (i) {
    itemList.appendChild(buildItemCard(i));
  });
}

function buildItemCard(item) {
  const id = item.id;
  const name = item.name || "Unnamed";
  const desc = item.description || "";
  const cost = Number(item.cost) || 0;
  const power = Number(item.power) || 0;

  const col = document.createElement("div");
  col.className = "col-12 col-md-6 col-lg-4";

  const escapeHtml = function(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  col.innerHTML = `
    <div class="shop-orb h-100">
      <div class="shop-orb-inner">
        <div id="cardMsg-${id}" class="alert alert-danger d-none mb-2 shop-card-error"></div>

        <h5 class="shop-title">${escapeHtml(name)}</h5>
        <p class="shop-desc">${escapeHtml(desc)}</p>

        <div class="shop-meta">
          <span class="shop-pill">Cost: ${escapeHtml(cost)}</span>
          <span class="shop-pill">Power: ${escapeHtml(power)}</span>
        </div>

        <div class="shop-actions">
          <button
            class="btn btn-primary w-100"
            data-action="buy"
            data-id="${id}"
            data-cost="${cost}"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  `;

  return col;
}

// Actions
function buyItem(itemId, done) {
  const data = { quantity: 1 };
  const callback = function(status, payload) {
    done(status, payload);
  };

  fetchMethod(currentUrl + SHOP_BUY_PATH(itemId), callback, "POST", data, token);
}