document.addEventListener("DOMContentLoaded", function () {

  // DOM Elements
  var signupForm = document.getElementById("signupForm");
  var warningCard = document.getElementById("warningCard");
  var warningText = document.getElementById("warningText");

  // Init
  init();

  function init() {
    if (!signupForm) return;
    bindEvents();
  }

  // Events
  function bindEvents() {
    signupForm.addEventListener("submit", onSignupSubmit);
  }

  function onSignupSubmit(event) {
    event.preventDefault();
    clearWarning();

    var formData = readFormValues();
    var error = validateSignup(
      formData.username,
      formData.email,
      formData.password,
      formData.confirmPassword
    );

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
    var payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password
    };

    const callback = function (status, data) {
      if (status === 200 && data && data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "profile.html";
        return;
      }

      showWarning((data && data.message) || "Signup failed.");
    };

    fetchMethod(
      currentUrl + "/api/auth/register",
      callback,
      "POST",
      payload
    );

    signupForm.reset();
  }
});