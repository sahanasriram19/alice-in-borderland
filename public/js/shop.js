document.addEventListener("DOMContentLoaded", function () {

  // Elements & State
  var msg = AppHelpers.byId("msg");
  var itemList = AppHelpers.byId("itemList");
  var pointsBadge = AppHelpers.byId("pointsBadge");

  var token = localStorage.getItem("token");
  var currentPoints = null;

  // Endpoints
  var SHOP_LIST_PATH = "/api/shop";
  var SHOP_BUY_PATH = function (id) { return "/api/shop/" + id + "/buy"; };
  var PROFILE_ME_PATH = "/api/profiles/me";

  // Init
  init();

  function init() {
    if (typeof currentUrl === "undefined") {
      AppHelpers.showPageError(
        msg,
        "currentUrl is not defined. Include getCurrentURL.js before shop.js"
      );
      return;
    }

    if (!token) {
      AppHelpers.showPageError(msg, "No token found. Please login first.");
      return;
    }

    AppHelpers.clearPageError(msg);

    bindEvents();
    loadPoints();
    loadItems();
  }

  // Events
  function bindEvents() {
    document.addEventListener("click", onBuyClick);
  }

  function onBuyClick(e) {
    var btn = e.target.closest("[data-action='buy']");
    if (!btn) return;

    var itemId = btn.getAttribute("data-id");
    var cost = Number(btn.getAttribute("data-cost")) || 0;

    clearCardError(itemId);
    AppHelpers.clearPageError(msg);

    // Optimistic preview
    if (currentPoints !== null) {
      animatePoints(currentPoints, Math.max(0, currentPoints - cost));
    }

    btn.disabled = true;

    buyItem(itemId, function (status, data) {
      btn.disabled = false;

      if (status !== 200 && status !== 201) {
        loadPoints(); // restore truth
        return showCardError(
          itemId,
          (data && data.message) || "Purchase failed."
        );
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

    var start = Number(from);
    var end = Number(to);

    if (!isFinite(start) || !isFinite(end) || start === end) {
      setPoints(end);
      return;
    }

    var duration = 900;
    var startTime = performance.now();

    function tick(now) {
      var t = Math.min(1, (now - startTime) / duration);
      var val = Math.round(start + (end - start) * t);
      setPoints(val);
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function showCardError(itemId, text) {
    var el = AppHelpers.byId("cardMsg-" + itemId);
    if (!el) return AppHelpers.showPageError(msg, text);
    AppHelpers.showInlineError(el, text);
  }

  function clearCardError(itemId) {
    var el = AppHelpers.byId("cardMsg-" + itemId);
    if (!el) return;
    AppHelpers.clearInlineError(el);
  }

  // Data Loaders
  function loadPoints() {
    const callback = function (status, payload) {
      if (status !== 200) return;

      var profile = AppHelpers.pick(payload, ["profile"], null);
      if (!profile) return;

      var nextPoints = Number(profile.points) || 0;

      if (currentPoints === null) {
        currentPoints = nextPoints;
        setPoints(nextPoints);
      } else {
        animatePoints(currentPoints, nextPoints);
        currentPoints = nextPoints;
      }
    };

    AppHelpers.apiGet(PROFILE_ME_PATH, token, callback);
  }

  function loadItems() {
    const callback = function (status, payload) {
      if (status !== 200) {
        return AppHelpers.showPageError(
          msg,
          (payload && payload.message) || "Failed to load shop items."
        );
      }

      var items = AppHelpers.pick(payload, ["items"], []);
      renderItems(Array.isArray(items) ? items : []);
    };

    AppHelpers.apiGet(SHOP_LIST_PATH, token, callback);
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
    var id = item.id;
    var name = item.name || "Unnamed";
    var desc = item.description || "";
    var cost = Number(item.cost) || 0;
    var power = Number(item.power) || 0;

    var col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="shop-orb h-100">
        <div class="shop-orb-inner">
          <div id="cardMsg-${id}" class="alert alert-danger d-none mb-2 shop-card-error"></div>

          <h5 class="shop-title">${AppHelpers.escapeHtml(name)}</h5>
          <p class="shop-desc">${AppHelpers.escapeHtml(desc)}</p>

          <div class="shop-meta">
            <span class="shop-pill">Cost: ${AppHelpers.escapeHtml(cost)}</span>
            <span class="shop-pill">Power: ${AppHelpers.escapeHtml(power)}</span>
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
    AppHelpers.apiPost(
      SHOP_BUY_PATH(itemId),
      { quantity: 1 },
      token,
      done
    );
  }
});