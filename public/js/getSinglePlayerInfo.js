document.addEventListener("DOMContentLoaded", function () {
  url = new URL(document.URL);
  const urlParams = url.searchParams;
  const playerId = urlParams.get("player_id");

  const callbackForPlayerInfo = (responseStatus, responseData) => {
       console.log("responseStatus:", responseStatus);
    console.log("responseData:", responseData);

    const playerInfo = document.getElementById("playerInfo");

    if (responseStatus == 404) {
      playerInfo.innerHTML = `${responseData.message}`;
      return;
    }

    playerInfo.innerHTML = `
        <div class="card">
            <div class="card-body">
                <p class="card-text">
                Player ID: ${responseData.id} <br>
                    Player Name: ${responseData.name} <br>
                    Level: ${responseData.level} <br>
                    Created On: ${responseData.created_on} <br>
                </p>
            </div>
        </div>
    `;
  };

  fetchMethod(currentUrl + `/api/player/${playerId}`, callbackForPlayerInfo);
});