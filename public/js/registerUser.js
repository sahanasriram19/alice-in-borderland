/* Run setup once the page has fully loaded */
document.addEventListener("DOMContentLoaded", function () {
  eventListeners();
});

/* DOM references */

/* The signup form element */
const signupForm = document.getElementById("signupForm");

/* Warning card and text element used to display validation and server errors */
const warningCard = document.getElementById("warningCard");
const warningText = document.getElementById("warningText");


/* Attach the submit event listener to the signup form */
function eventListeners() {

  /* If the form doesn't exist on this page, stop early */
  if (!signupForm) return;

  signupForm.addEventListener("submit", onSignupSubmit);
}


/* Handle the signup form submission */
function onSignupSubmit(event) {

  /* Stop the browser from refreshing the page on submit */
  event.preventDefault();

  /* Clear any warning message left over from a previous attempt */
  clearWarning();

  /* Read the current values from all form fields */
  const formData = readFormValues();

  /* Validate the inputs and get an error message if anything is wrong */
  const error = validateSignup(
    formData.username,
    formData.email,
    formData.password,
    formData.confirmPassword
  );

  /* If validation failed, show the error and stop without submitting */
  if (error) {
    showWarning(error);
    return;
  }

  /* All inputs are valid — send the signup request to the server */
  submitSignup(formData);
}


/* Read and return trimmed values from all signup form input fields */
function readFormValues() {

  return {
    /* Trim whitespace from text fields to avoid accidental spaces */
    username:        document.getElementById("username").value.trim(),
    email:           document.getElementById("email").value.trim(),
    /* Do not trim passwords as spaces may be intentional */
    password:        document.getElementById("password").value,
    confirmPassword: document.getElementById("confirmPassword").value
  };
}


/* Validate all signup fields and return an error message string, or null if valid */
function validateSignup(username, email, password, confirmPassword) {

  /* Each check returns an error string as soon as a problem is found */
  if (!username)                    return "Username is required.";
  if (!email)                       return "Email is required.";
  if (!password)                    return "Password is required.";
  if (password !== confirmPassword) return "Passwords do not match.";

  /* All checks passed — return null to indicate no errors */
  return null;
}


/* Reveal the warning card and set its message text */
function showWarning(text) {

  /* Do nothing if the required elements are missing from the page */
  if (!warningCard || !warningText) return;

  warningText.innerText = text;
  warningCard.classList.remove("d-none");
}

/* Hide the warning card and clear its message text */
function clearWarning() {

  /* Do nothing if the required elements are missing from the page */
  if (!warningCard || !warningText) return;

  warningCard.classList.add("d-none");
  warningText.innerText = "";
}


/* Send the signup data to the register endpoint and handle the response */
function submitSignup(formData) {

  /* Build the request body with only the fields the API expects */
  const data = {
    username: formData.username,
    email:    formData.email,
    password: formData.password
  };

  /* Handle the API response */
  const callback = function (status, payload) {

    /* On success, save the token to localStorage and redirect to the profile page */
    if (status === 200 && payload && payload.token) {
      localStorage.setItem("token", payload.token);
      window.location.href = "profile.html";
      return;
    }

    /* On failure, display the server's error message or a generic fallback */
    showWarning((payload && payload.message) || "Signup failed.");
  };

  /* Send the POST request to the register endpoint */
  fetchMethod(currentUrl + "/api/auth/register", callback, "POST", data);

  /* Reset the form fields after submission so they are cleared */
  signupForm.reset();
}