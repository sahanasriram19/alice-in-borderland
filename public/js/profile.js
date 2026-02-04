// Event: DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  getToken();
  loadUserProfile();
  loadInventory();
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
const usernameEl = document.getElementById("profileUsername");
const pointsEl = document.getElementById("profilePoints");
const characterEl = document.getElementById("profileCharacter");
const avatarEl = document.getElementById("profileAvatar");
const inventoryList = document.getElementById("inventoryList");
const inventoryEmpty = document.getElementById("inventoryEmpty");

// Endpoints
const PROFILE_ME_PATH = "/api/profiles/me";
const INVENTORY_PATH = "/api/inventory";

// Avatar URL template
const AVATAR_BASE = "https://raw.githubusercontent.com/SahanaSP19/images/main/avatars/";
const AVATAR_EXT = ".png";

// Load User Profile
function loadUserProfile() {
  const callback = (status, payload) => {
    if (status !== 200) {
      if (msg) {
        msg.textContent = (payload && payload.message) || "Failed to load user profile.";
        msg.classList.remove("d-none");
      }
      return;
    }

    const profile = (payload && payload.data && payload.data.profile) || (payload && payload.profile) || null;
    if (!profile) {
      if (msg) {
        msg.textContent = "Profile data missing.";
        msg.classList.remove("d-none");
      }
      return;
    }

    updateProfileUI(profile);
  };

  fetchMethod(currentUrl + PROFILE_ME_PATH, callback, "GET", null, token);
}

function updateProfileUI(profile) {
  const username = profile.username ?? "-";
  const points = Number(profile.points) || 0;
  const characterName = profile.character_name ?? "-";

  if (usernameEl) usernameEl.textContent = username;
  if (pointsEl) pointsEl.textContent = String(points);
  if (characterEl) characterEl.textContent = characterName;

  setAvatarByCharacter(characterName);
}

function setAvatarByCharacter(characterName) {
  if (!avatarEl || !characterName) return;

  const fileName = characterName.toLowerCase();
  avatarEl.src = AVATAR_BASE + fileName + AVATAR_EXT;

  avatarEl.onerror = function () {
    console.error("Avatar not found:", avatarEl.src);
  };
}

// Load Inventory
function loadInventory() {
  const callback = (status, payload) => {
    if (status !== 200) {
      if (msg) {
        msg.textContent = (payload && payload.message) || "Failed to load inventory.";
        msg.classList.remove("d-none");
      }
      return;
    }

    const items = (payload && payload.inventory) || (payload && payload.data && payload.data.inventory) || [];

    renderInventory(items);
  };

  fetchMethod(currentUrl + INVENTORY_PATH, callback, "GET", null, token);
}

function renderInventory(items) {
  if (!inventoryList || !inventoryEmpty) return;

  inventoryList.innerHTML = "";
  items = Array.isArray(items) ? items : [];

  if (items.length === 0) {
    inventoryEmpty.classList.remove("d-none");
    return;
  }

  inventoryEmpty.classList.add("d-none");

  items.forEach((item) => {
    const col = document.createElement("div");

    const escapeHtml = function(str) {
      return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    col.innerHTML = `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">${escapeHtml(item.name)}</h5>
          <p class="card-text">${escapeHtml(item.description || "")}</p>
        </div>
      </div>
    `;
    inventoryList.appendChild(col);
  });
}