// Event: DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  eventListeners();
});

// DOM Elements
const signupForm = document.getElementById("signupForm");
const warningCard = document.getElementById("warningCard");
const warningText = document.getElementById("warningText");

// Add all the Event Listeners
function eventListeners() {
  if (!signupForm) return;

  signupForm.addEventListener("submit", onSignupSubmit);
}

function onSignupSubmit(event) {
  event.preventDefault();
  clearWarning();

  const formData = readFormValues();
  const error = validateSignup(formData.username, formData.email, formData.password, formData.confirmPassword);

  if (error) {
    showWarning(error);
    return;
  }

  submitSignup(formData);
}

// Form Helpers
function readFormValues() {
  return {
    username: document.getElementById("username").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    confirmPassword: document.getElementById("confirmPassword").value
  };
}

function validateSignup(username, email, password, confirmPassword) {
  if (!username) return "Username is required.";
  if (!email) return "Email is required.";
  if (!password) return "Password is required.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
}

// UI Feedback
function showWarning(text) {
  if (!warningCard || !warningText) return;
  warningText.innerText = text;
  warningCard.classList.remove("d-none");
}

function clearWarning() {
  if (!warningCard || !warningText) return;
  warningCard.classList.add("d-none");
  warningText.innerText = "";
}

// API
function submitSignup(formData) {
  const data = {
    username: formData.username,
    email: formData.email,
    password: formData.password
  };

  const callback = function (status, payload) {
    if (status === 200 && payload && payload.token) {
      localStorage.setItem("token", payload.token);
      window.location.href = "profile.html";
      return;
    }

    showWarning((payload && payload.message) || "Signup failed.");
  };

  fetchMethod(currentUrl + "/api/auth/register", callback, "POST", data);

  signupForm.reset();
}