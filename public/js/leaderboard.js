document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("leaderboardBtn");
  const section = document.getElementById("leaderboardSection");
  const list = document.getElementById("leaderboardList");

  if (!btn || !section || !list) return;

  let loaded = false;

  btn.addEventListener("click", function () {
    section.classList.toggle("d-none");

    if (loaded) return;

    fetch(currentUrl + "/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        list.innerHTML = "";

        (data.leaderboard || []).forEach((user, index) => {
          const li = document.createElement("li");
          li.className = "list-group-item d-flex justify-content-between";

          li.innerHTML = `
            <span>${index + 1}. ${user.username}</span>
            <strong>${user.points} pts</strong>
          `;

          list.appendChild(li);
        });

        loaded = true;
      })
      .catch(() => {
        list.innerHTML =
          "<li class='list-group-item text-danger'>Failed to load leaderboard.</li>";
      });
  });
});