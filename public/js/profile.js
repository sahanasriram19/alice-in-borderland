document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    // DOM Elements
    const msg = AppHelpers.byId("msg");
    const usernameEl = AppHelpers.byId("profileUsername");
    const pointsEl = AppHelpers.byId("profilePoints");
    const characterEl = AppHelpers.byId("profileCharacter");
    const avatarEl = AppHelpers.byId("profileAvatar");
    const inventoryList = AppHelpers.byId("inventoryList");
    const inventoryEmpty = AppHelpers.byId("inventoryEmpty");

    // Endpoints
    const PROFILE_ME_PATH = "/api/profiles/me";
    const INVENTORY_PATH = "/api/inventory";

    // Avatar URL template
    const AVATAR_BASE = "https://raw.githubusercontent.com/SahanaSP19/images/main/avatars/";
    const AVATAR_EXT = ".png";

    init();

    // Initialization
    function init() {
        AppHelpers.clearPageError(msg);

        if (typeof currentUrl === "undefined") {
            AppHelpers.showPageError(
                msg,
                "currentUrl is not defined. Include getCurrentURL.js before profile.js"
            );
            return;
        }

        if (!token) {
            AppHelpers.showPageError(msg, "No token found. Please login first.");
            return;
        }

        loadUserProfile(token);
        loadInventory(token);
    }

    // Load User Profile
    function loadUserProfile(token) {
        const callback = (status, payload) => {
            if (status !== 200) {
                return AppHelpers.showPageError(
                    msg,
                    (payload && payload.message) || "Failed to load user profile."
                );
            }

            const profile = AppHelpers.pick(payload, ["profile"], null);
            if (!profile) {
                return AppHelpers.showPageError(msg, "Profile data missing.");
            }

            updateProfileUI(profile);
        };

        AppHelpers.apiGet(PROFILE_ME_PATH, token, callback);
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

    // Load Inventory (FIXED)
    function loadInventory(token) {
        const callback = (status, payload) => {
            if (status !== 200) {
                return AppHelpers.showPageError(
                    msg,
                    (payload && payload.message) || "Failed to load inventory."
                );
            }

            const items =
                (payload && payload.inventory) ||
                (payload && payload.data && payload.data.inventory) ||
                [];

            renderInventory(items);
        };

        AppHelpers.apiGet(INVENTORY_PATH, token, callback);
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
            col.innerHTML = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${AppHelpers.escapeHtml(item.name)}</h5>
                        <p class="card-text">${AppHelpers.escapeHtml(item.description || "")}</p>
                    </div>
                </div>
            `;
            inventoryList.appendChild(col);
        });
    }
});