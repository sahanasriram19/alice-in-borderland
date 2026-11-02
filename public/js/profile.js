/* Run initial setup once the page has fully loaded */
document.addEventListener("DOMContentLoaded", function () {
  getToken();
  loadUserProfile();
  loadInventory();
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

/* Profile section display elements */
const usernameEl  = document.getElementById("profileUsername");
const pointsEl    = document.getElementById("profilePoints");
const characterEl = document.getElementById("profileCharacter");
const avatarEl    = document.getElementById("profileAvatar");

/* Inventory section elements */
const inventoryList  = document.getElementById("inventoryList");
const inventoryEmpty = document.getElementById("inventoryEmpty");


/* API endpoint paths */

const PROFILE_ME_PATH = "/api/profiles/me";
const INVENTORY_PATH  = "/api/inventory";


/* Image URL config */

/* GitHub raw base URL and file extension used to build avatar image URLs */
const AVATAR_BASE = "https://raw.githubusercontent.com/SahanaSP19/images/main/avatars/";
const AVATAR_EXT  = ".png";


/* Fetch the user's profile from the server and update the profile section */
function loadUserProfile() {

  const callback = (status, payload) => {

    /* Show an error and stop if the fetch failed */
    if (status !== 200) {
      if (msg) {
        msg.textContent = (payload && payload.message) || "Failed to load user profile.";
        msg.classList.remove("d-none");
      }
      return;
    }

    /* Extract the profile object from whichever response shape the API returned */
    const profile = (payload && payload.data && payload.data.profile)
      || (payload && payload.profile)
      || null;

    /* Show an error if the profile object is missing from the response */
    if (!profile) {
      if (msg) {
        msg.textContent = "Profile data missing.";
        msg.classList.remove("d-none");
      }
      return;
    }

    /* Pass the profile data to the UI update function */
    updateProfileUI(profile);
  };

  fetchMethod(currentUrl + PROFILE_ME_PATH, callback, "GET", null, token);
}


/* Populate the profile section with data from the user's profile */
function updateProfileUI(profile) {

  /* Extract values with safe defaults in case any fields are missing */
  const username      = profile.username       ?? "-";
  const points        = Number(profile.points) || 0;
  const characterName = profile.character_name ?? "-";

  /* Update each display element with the corresponding profile value */
  if (usernameEl)  usernameEl.textContent  = username;
  if (pointsEl)    pointsEl.textContent    = String(points);
  if (characterEl) characterEl.textContent = characterName;

  /* Set the avatar image based on the user's current character */
  setAvatarByCharacter(characterName);
}


/* Build the avatar URL from the character name and assign it to the image element */
function setAvatarByCharacter(characterName) {

  if (!avatarEl || !characterName) return;

  /* Convert the character name to lowercase to match the image filename convention */
  const fileName = characterName.toLowerCase();
  avatarEl.src   = AVATAR_BASE + fileName + AVATAR_EXT;

  /* Log an error to the console if the image file doesn't exist */
  avatarEl.onerror = function () {
    console.error("Avatar not found:", avatarEl.src);
  };
}


/* Fetch the user's inventory from the server and render the items */
function loadInventory() {

  const callback = (status, payload) => {

    /* Show an error and stop if the fetch failed */
    if (status !== 200) {
      if (msg) {
        msg.textContent = (payload && payload.message) || "Failed to load inventory.";
        msg.classList.remove("d-none");
      }
      return;
    }

    /* Extract the items array from whichever response shape the API returned */
    const items = (payload && payload.inventory)
      || (payload && payload.data && payload.data.inventory)
      || [];

    renderInventory(items);
  };

  fetchMethod(currentUrl + INVENTORY_PATH, callback, "GET", null, token);
}


/* Clear the inventory list and render a card for each item the user owns */
function renderInventory(items) {

  if (!inventoryList || !inventoryEmpty) return;

  /* Wipe any previously rendered inventory cards */
  inventoryList.innerHTML = "";

  /* Ensure items is always an array even if the API returns something unexpected */
  items = Array.isArray(items) ? items : [];

  /* Show the empty state message if the user has no items */
  if (items.length === 0) {
    inventoryEmpty.classList.remove("d-none");
    return;
  }

  /* Hide the empty state since we have items to show */
  inventoryEmpty.classList.add("d-none");

  /* Escape HTML special characters to prevent XSS from server-supplied item data */
  const escapeHtml = function (str) {
    return String(str ?? "")
      .replace(/&/g,  "&amp;")
      .replace(/</g,  "&lt;")
      .replace(/>/g,  "&gt;")
      .replace(/"/g,  "&quot;")
      .replace(/'/g,  "&#039;");
  };

  /* Build and append a card for each inventory item */
  items.forEach((item) => {

    const col = document.createElement("div");

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