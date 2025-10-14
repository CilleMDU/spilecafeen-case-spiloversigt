"Use strict";

document.addEventListener("DOMContentLoaded", initApp);

let allgames = [];

function initApp() {
  getgames();

  document
    .querySelector("#search-input")
    .addEventListener("input", filtergames);
  document
    .querySelector("#sort-select")
    .addEventListener("change", filtergames);
}

async function getgames() {
  const response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json"
  );

  allgames = await response.json();

  allgames.sort((a, b) => b.rating - a.rating);

  displaygames(allgames);
}

function displaygames(games) {
  const gameList = document.querySelector("#game-list");
  gameList.innerHTML = "";

  if (games.length === 0) {
    gameList.innerHTML = '<p class="no-results">Spil ikke fundet</p>';
    return;
  }

  for (const game of games) {
    displaygame(game);
  }
}

function displaygame(game) {
  const gameList = document.querySelector("#game-list");

  const gameHTML = /*html*/ `
    <article class="game-card" tabindex="0">
      <img src="${game.image}" 
           alt="Poster of ${game.title}" 
           class="game-poster" />
      <div class="game-info">
        <p class="game-title">${game.title}</p>
        <p class="game-genre">${game.genre}</p>
        <p class="game-rating">⭐ ${game.rating}</p>
      </div>
    </article>
  `;

  gameList.insertAdjacentHTML("beforeend", gameHTML);

  const newCard = gameList.lastElementChild;

  newCard.addEventListener("click", function () {
    showgameModal(game);
  });

  newCard.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showgameModal(game);
    }
  });
}


function showgameModal(game) {
  document.querySelector("#dialog-content").innerHTML = /*html*/ `
    <img src="${game.image}" alt="Poster af ${game.title}" class="game-poster">
    <div class="dialog-details">
      <p class="game-title">${game.title}</p>
      <p class="game-description">${game.description}</p>
      <p class="game-genre">${game.genre}</p>
      <p class="game-rating"> ${game.rating}</p>
      <p class="game-players">${game.players.min} til ${game.players.max}</p>
      <p class="game-difficulty">${game.difficulty}</p>
      <p class="game-age">${game.age}</p>
      <p class="game-playtime">${game.playtime}</p>
      <p class="game-location">${game.location}</p>
      <p class="game-shelf">${game.shelf}</p>
      <p class="game-language">${game.language}</p>
    </div>
  `;

  document.querySelector("#game-dialog").showModal();
}

function filtergames() {
  const searchValue = document
    .querySelector("#search-input")
    .value.toLowerCase();
  const sortValue = document.querySelector("#sort-select").value;

  let filteredgames = allgames;

  if (searchValue) {
    filteredgames = filteredgames.filter((game) => {
      return game.title.toLowerCase().includes(searchValue);
    });
  }

  if (sortValue === "title") {
    filteredgames.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "rating") {
    filteredgames.sort((a, b) => b.rating - a.rating);
  }

  displaygames(filteredgames);
}
