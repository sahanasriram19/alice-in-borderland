document.addEventListener("DOMContentLoaded", function () {
  const navbarContainer = document.getElementById("navbar");
  if (!navbarContainer) {
    console.warn("Missing #navbar container. Add <div id='navbar'></div> in your HTML.");
    return;
  }

  const navbarHTML =
    '<nav class="navbar navbar-expand-lg navbar-dark sticky-top">' +
      '<div class="container">' +

        // Brand
        '<a class="navbar-brand fw-bold no-underline" href="index.html">Borderland</a>' +

        // Mobile toggle
        '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">' +
          '<span class="navbar-toggler-icon"></span>' +
        '</button>' +

        '<div class="collapse navbar-collapse" id="navbarNav">' +

          // Left links
          '<ul class="navbar-nav me-auto">' +
            '<li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>' +
            '<li class="nav-item"><a id="challengesLink" class="nav-link" href="challenges.html">Challenges</a></li>' +
            '<li class="nav-item"><a id="charactersLink" class="nav-link" href="characters.html">Characters</a></li>' +
            '<li class="nav-item"><a id="shopLink" class="nav-link" href="shop.html">Shop</a></li>' +
            '<li class="nav-item"><a id="matchesLink" class="nav-link" href="matches.html">Matches</a></li>' +
          '</ul>' +

          // Right links (user)
          '<ul class="navbar-nav ms-auto">' +
            '<li class="nav-item"><a id="profileButton" class="nav-link" href="profile.html">Profile</a></li>' +
            '<li class="nav-item"><a id="logoutButton" class="nav-link text-danger" href="#">Logout</a></li>' +
            '<li class="nav-item"><a id="loginButton" class="nav-link" href="login.html">Login</a></li>' +
            '<li class="nav-item"><a id="registerButton" class="nav-link" href="register.html">Register</a></li>' +
          '</ul>' +

        '</div>' +
      '</div>' +
    '</nav>';

  navbarContainer.innerHTML = navbarHTML;

  // Show/Hide links based on login
  const token = localStorage.getItem("token");

  const challengesLink = document.getElementById("challengesLink");
  const charactersLink = document.getElementById("charactersLink");
  const shopLink = document.getElementById("shopLink");
  const matchesLink = document.getElementById("matchesLink");

  const loginButton = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");
  const profileButton = document.getElementById("profileButton");
  const logoutButton = document.getElementById("logoutButton");

  if (token) {
    // Logged in: show everything
    challengesLink.classList.remove("d-none");
    charactersLink.classList.remove("d-none");
    shopLink.classList.remove("d-none");
    matchesLink.classList.remove("d-none");

    profileButton.classList.remove("d-none");
    logoutButton.classList.remove("d-none");

    loginButton.classList.add("d-none");
    registerButton.classList.add("d-none");
  } else {
    // Not logged in: only Home + Login/Register
    challengesLink.classList.add("d-none");
    charactersLink.classList.add("d-none");
    shopLink.classList.add("d-none");
    matchesLink.classList.add("d-none");

    profileButton.classList.add("d-none");
    logoutButton.classList.add("d-none");

    loginButton.classList.remove("d-none");
    registerButton.classList.remove("d-none");
  }

  // Active link highlight
  const currentPage = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".navbar .nav-link");

  links.forEach(function (link) {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const target = href.split("/").pop();
    if (target === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
});