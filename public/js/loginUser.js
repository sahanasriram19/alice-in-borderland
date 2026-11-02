/* Run setup once the page has fully loaded */
document.addEventListener("DOMContentLoaded", function () {

  /* Get references to the form and the warning elements */
  const loginForm   = document.getElementById("loginForm");
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");

  /* Handle the response from the login API */
  const callback = (responseStatus, responseData) => {

    /* On success, store the token and redirect the user to their profile */
    if (responseStatus == 200) {

      /* Only proceed if the server actually returned a token */
      if (responseData.token) {
        localStorage.setItem("token", responseData.token);
        window.location.href = "profile.html";
      }

    } else {

      /* On failure, reveal the warning card and display the server's error message */
      warningCard.classList.remove("d-none");
      warningText.innerText = responseData.message;
    }
  };

  /* Listen for the form submission event */
  loginForm.addEventListener("submit", function (event) {

    /* Stop the browser from refreshing the page on submit */
    event.preventDefault();

    /* Read the username and password from their input fields */
    const data = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    };

    /* Send the credentials to the login endpoint */
    fetchMethod(currentUrl + "/api/auth/login", callback, "POST", data);

    /* Reset the form fields after submission so they are cleared */
    loginForm.reset();
  });
});