/* Run setup once the page has fully loaded */
document.addEventListener("DOMContentLoaded", function () {

  /* Get references to the three elements this script needs */
  const btn     = document.getElementById("leaderboardBtn");
  const section = document.getElementById("leaderboardSection");
  const list    = document.getElementById("leaderboardList");

  /* If any required element is missing, stop early rather than throw errors */
  if (!btn || !section || !list) return;

  /* Track whether the leaderboard data has been fetched yet to avoid repeat calls */
  let loaded = false;

  /* Toggle the leaderboard section each time the button is clicked */
  btn.addEventListener("click", function () {

    /* Show or hide the leaderboard section */
    section.classList.toggle("d-none");

    /* If data was already fetched, just toggling visibility is enough — skip the fetch */
    if (loaded) return;

    /* Fetch the leaderboard data from the server for the first time */
    fetch(currentUrl + "/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {

        /* Clear any placeholder content before rendering */
        list.innerHTML = "";

        /* Build a list item for each user showing their rank, name, and points */
        (data.leaderboard || []).forEach((user, index) => {

          const li     = document.createElement("li");
          li.className = "list-group-item d-flex justify-content-between";

          /* index + 1 converts the zero-based array index to a 1-based rank number */
          li.innerHTML = `
            <span>${index + 1}. ${user.username}</span>
            <strong>${user.points} pts</strong>
          `;

          list.appendChild(li);
        });

        /* Mark the data as loaded so future toggles skip the fetch */
        loaded = true;
      })
      .catch(() => {

        /* If the fetch fails, show an error message inside the list */
        list.innerHTML = "<li class='list-group-item text-danger'>Failed to load leaderboard.</li>";
      });
  });
});