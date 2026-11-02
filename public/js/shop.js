/* Run initial setup once the page has fully loaded */
document.addEventListener("DOMContentLoaded", function () {
  getToken();
  eventListeners();
  loadPoints();
  loadItems();
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
const msg = document.getElementById("msg");

/* Container where all shop item cards are rendered */
const itemList = document.getElementById("itemList");

/* Badge in the header that displays the user's current point balance */
const pointsBadge = document.getElementById("pointsBadge");


/* Application state */

/* Tracks the user's current point total — starts null until first server fetch */
let currentPoints = null;


/* API endpoint paths */

const SHOP_LIST_PATH  = "/api/shop";
const PROFILE_ME_PATH = "/api/profiles/me";

/* Builds the buy endpoint URL for a specific item ID */
const SHOP_BUY_PATH = function (id) { return "/api/shop/" + id + "/buy"; };


/* Attach a single delegated click listener that handles all Buy buttons */
function eventListeners() {

  document.addEventListener("click", onBuyClick);
}


/* Handle clicks on any Buy button across the shop item list */
function onBuyClick(e) {

  /* Use event delegation to find the clicked buy button, if any */
  const btn = e.target.closest("[data-action='buy']");
  if (!btn) return;

  /* Read the item ID and cost stored on the button */
  const itemId = btn.getAttribute("data-id");
  const cost   = Number(btn.getAttribute("data-cost")) || 0;

  /* Clear any previous error on this card and on the main page */
  clearCardError(itemId);

  if (msg) {
    msg.classList.add("d-none");
    msg.textContent = "";
  }

  /* Optimistically deduct the cost from the displayed points before the server confirms */
  if (currentPoints !== null) {
    animatePoints(currentPoints, Math.max(0, currentPoints - cost));
  }

  /* Disable the button to prevent double-purchases while the request is in flight */
  btn.disabled = true;

  /* Send the purchase request to the server */
  buyItem(itemId, function (status, data) {

    /* Re-enable the button once we get a response */
    btn.disabled = false;

    /* On failure, reload the real point total to reverse the optimistic update */
    if (status !== 200 && status !== 201) {
      loadPoints();
      return showCardError(itemId, (data && data.message) || "Purchase failed.");
    }

    /* On success, clear any error and re-fetch points to confirm the server total */
    clearCardError(itemId);
    loadPoints();
  });
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


/* Show an error message on a specific item card */
function showCardError(itemId, text) {

  /* Look for the error element that belongs to this card */
  const el = document.getElementById("cardMsg-" + itemId);

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

/* Hide and clear the error message on a specific item card */
function clearCardError(itemId) {

  const el = document.getElementById("cardMsg-" + itemId);
  if (!el) return;

  el.classList.add("d-none");
  el.textContent = "";
}


/* Fetch the user's profile from the server and update the points badge */
function loadPoints() {

  const callback = function (status, payload) {

    if (status !== 200) return;

    /* Extract the profile object from whichever response shape the API returned */
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

  fetchMethod(currentUrl + PROFILE_ME_PATH, callback, "GET", null, token);
}


/* Fetch all shop items from the API and render them as cards */
function loadItems() {

  const callback = function (status, payload) {

    /* Show an error and stop if the fetch failed */
    if (status !== 200) {
      if (msg) {
        msg.textContent = (payload && payload.message) || "Failed to load shop items.";
        msg.classList.remove("d-none");
      }
      return;
    }

    /* Extract the items array from whichever response shape the API returned */
    const items = (payload && payload.data && payload.data.items)
      || (payload && payload.items)
      || [];

    renderItems(Array.isArray(items) ? items : []);
  };

  fetchMethod(currentUrl + SHOP_LIST_PATH, callback, "GET", null, token);
}


/* Clear the item list and render a card for each shop item */
function renderItems(items) {

  if (!itemList) return;

  /* Wipe any existing cards before re-rendering */
  itemList.innerHTML = "";

  /* Show an empty state message if there are no items to display */
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

  /* Build and append a card for each item */
  items.forEach(function (i) {
    itemList.appendChild(buildItemCard(i));
  });
}


/* Build the complete card element for a single shop item */
function buildItemCard(item) {

  /* Extract item properties with safe defaults */
  const id    = item.id;
  const name  = item.name        || "Unnamed";
  const desc  = item.description || "";
  const cost  = Number(item.cost)  || 0;
  const power = Number(item.power) || 0;

  /* Create the Bootstrap column wrapper */
  const col     = document.createElement("div");
  col.className = "col-12 col-md-6 col-lg-4";

  /* Escape HTML special characters to prevent XSS from server-supplied item data */
  const escapeHtml = function (str) {
    return String(str ?? "")
      .replace(/&/g,  "&amp;")
      .replace(/</g,  "&lt;")
      .replace(/>/g,  "&gt;")
      .replace(/"/g,  "&quot;")
      .replace(/'/g,  "&#039;");
  };

  /* Build the card HTML with error area, name, description, cost, power, and buy button */
  col.innerHTML = `
    <div class="shop-orb h-100">
      <div class="shop-orb-inner">

        <!-- Per-card error message area, hidden by default -->
        <div id="cardMsg-${id}" class="alert alert-danger d-none mb-2 shop-card-error"></div>

        <h5 class="shop-title">${escapeHtml(name)}</h5>

        <p class="shop-desc">${escapeHtml(desc)}</p>

        <!-- Cost and power displayed as pills -->
        <div class="shop-meta">
          <span class="shop-pill">Cost: ${escapeHtml(cost)}</span>
          <span class="shop-pill">Power: ${escapeHtml(power)}</span>
        </div>

        <!-- Buy button carries the item ID and cost as data attributes for the click handler -->
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


/* POST a purchase request for the given item and forward the response to the caller */
function buyItem(itemId, done) {

  const callback = function (status, payload) {
    done(status, payload);
  };

  /* Send quantity 1 as the request body */
  fetchMethod(currentUrl + SHOP_BUY_PATH(itemId), callback, "POST", { quantity: 1 }, token);
}