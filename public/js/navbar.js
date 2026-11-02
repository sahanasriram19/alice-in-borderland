/* Run navbar setup once the page has fully loaded */
document.addEventListener("DOMContentLoaded", function () {

  /* Find the container element where the navbar HTML will be injected */
  const navbarContainer = document.getElementById("navbar");

  /* If the container doesn't exist, warn the developer and stop */
  if (!navbarContainer) {
    console.warn("Missing #navbar container. Add <div id='navbar'></div> in your HTML.");
    return;
  }

  /* Build the full navbar HTML as a string, including the brand, hamburger toggler,
     left-side page links, and right-side user account links */
  const navbarHTML =
    '<nav class="navbar navbar-expand-lg navbar-dark sticky-top">' +
      '<div class="container">' +

        /* Brand / logo link in the top left */
        '<a class="navbar-brand fw-bold no-underline" href="index.html">Borderland</a>' +

        /* Mobile hamburger button that toggles the collapsible nav */
        '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">' +
          '<span class="navbar-toggler-icon"></span>' +
        '</button>' +

        '<div class="collapse navbar-collapse" id="navbarNav">' +

          /* Left-side links — main pages of the app */
          '<ul class="navbar-nav me-auto">' +
            '<li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>' +
            '<li class="nav-item"><a id="challengesLink" class="nav-link" href="challenges.html">Challenges</a></li>' +
            '<li class="nav-item"><a id="charactersLink" class="nav-link" href="characters.html">Characters</a></li>' +
            '<li class="nav-item"><a id="shopLink" class="nav-link" href="shop.html">Shop</a></li>' +
            '<li class="nav-item"><a id="matchesLink" class="nav-link" href="matches.html">Matches</a></li>' +
          '</ul>' +

          /* Right-side links — user account actions */
          '<ul class="navbar-nav ms-auto">' +
            '<li class="nav-item"><a id="profileButton" class="nav-link" href="profile.html">Profile</a></li>' +
            '<li class="nav-item"><a id="logoutButton" class="nav-link text-danger" href="#">Logout</a></li>' +
            '<li class="nav-item"><a id="loginButton" class="nav-link" href="login.html">Login</a></li>' +
            '<li class="nav-item"><a id="registerButton" class="nav-link" href="register.html">Register</a></li>' +
          '</ul>' +

        '</div>' +
      '</div>' +
    '</nav>';

  /* Inject the navbar HTML into the page */
  navbarContainer.innerHTML = navbarHTML;

  /* Check localStorage for an auth token to determine the user's login state */
  const token = localStorage.getItem("token");

  /* Get references to all the links whose visibility depends on login state */
  const challengesLink = document.getElementById("challengesLink");
  const charactersLink = document.getElementById("charactersLink");
  const shopLink       = document.getElementById("shopLink");
  const matchesLink    = document.getElementById("matchesLink");
  const loginButton    = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");
  const profileButton  = document.getElementById("profileButton");
  const logoutButton   = document.getElementById("logoutButton");

  /* Show the correct links depending on whether the user is logged in or not */
  if (token) {

    /* Logged in — reveal authenticated links and hide the login/register buttons */
    challengesLink.classList.remove("d-none");
    charactersLink.classList.remove("d-none");
    shopLink.classList.remove("d-none");
    matchesLink.classList.remove("d-none");
    profileButton.classList.remove("d-none");
    logoutButton.classList.remove("d-none");
    loginButton.classList.add("d-none");
    registerButton.classList.add("d-none");

  } else {

    /* Logged out — hide authenticated links and show login/register buttons */
    challengesLink.classList.add("d-none");
    charactersLink.classList.add("d-none");
    shopLink.classList.add("d-none");
    matchesLink.classList.add("d-none");
    profileButton.classList.add("d-none");
    logoutButton.classList.add("d-none");
    loginButton.classList.remove("d-none");
    registerButton.classList.remove("d-none");
  }

  /* Get the filename of the current page to use for active link highlighting */
  const currentPage = window.location.pathname.split("/").pop();

  /* Loop through every nav link and mark the one that matches the current page */
  document.querySelectorAll(".navbar .nav-link").forEach(function (link) {

    const href = link.getAttribute("href");

    /* Skip links with no href or that are just placeholder hash links */
    if (!href || href === "#") return;

    /* Extract just the filename from the link's href for comparison */
    const target = href.split("/").pop();

    /* Add the active class and aria attribute if this link matches the current page */
    if (target === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
});