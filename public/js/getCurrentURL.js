// Base URL for all API calls.
// If the page is served by the Express server (http://localhost:3000) use that.
// If it was opened another way (Live Server on :5500, or double-clicked as file://),
// fall back to the Express server so the API calls still work.
const API_PORT = "3000";

const currentUrl =
  window.location.protocol === "file:" || window.location.port !== API_PORT
    ? "http://localhost:" + API_PORT
    : window.location.protocol + "//" + window.location.host;

console.log("currentUrl:", currentUrl);