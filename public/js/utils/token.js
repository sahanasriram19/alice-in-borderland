// Check if the user is authenticated by looking for a token in localStorage
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}
