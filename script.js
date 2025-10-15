"Use strict";

document.addEventListener("DOMContentLoaded", initApp);

const isFavoritesPage = document.body.classList.contains("favorites-page");

let allgames = [];

function initApp() {
  if (isFavoritesPage) {
    showFavoritedGames();
  } else {
    getgames();

  document
    .querySelector("#search-input")
    .addEventListener("input", filtergames);
  document
    .querySelector("#sort-select")
    .addEventListener("change", filtergames);
  document
    .querySelector("#location-select")
    .addEventListener("change", filtergames);

  document
    .querySelector("#clear-filters")
    .addEventListener("click", clearAllFilters);

  document.querySelector("#save-btn").addEventListener("click", filtergames);

  document.querySelector("#alder-from").addEventListener("input", filtergames);
  document.querySelector("#alder-to").addEventListener("input", filtergames);

  document
    .querySelector("#spillere-from")
    .addEventListener("input", filtergames);
  document.querySelector("#spillere-to").addEventListener("input", filtergames);

  document
    .querySelector("#playtime-from")
    .addEventListener("input", filtergames);
  document.querySelector("#playtime-to").addEventListener("input", filtergames);
  }
}

async function getgames() {
  const response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json"
  );

  allgames = await response.json();

  allgames.sort((a, b) => b.rating - a.rating);

  populateLocationDropdown();
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
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  const isFavorited = favorites.some((fav) => fav.title === game.title);

  const gameHTML = /*html*/ `
    <article class="game-card" tabindex="0">
      <img src="${game.image}" 
           alt="Poster of ${game.title}" 
           class="game-poster" />
      <div class="game-info">
        <p class="game-title">${game.title}</p>
        <button class="favorite-btn ${isFavorited ? "favorited" : ""}">
          ${isFavorited ? "❤️" : "♡"}
        </button>
        <p class="game-genre">${game.genre}</p>
        <p class="game-rating">⭐ ${game.rating}</p>
      </div>
    </article>
  `;

  gameList.insertAdjacentHTML("beforeend", gameHTML);

  const newCard = gameList.lastElementChild;
  const favoriteBtn = newCard.querySelector(".favorite-btn");


  favoriteBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    const currentFavorites =
      JSON.parse(localStorage.getItem("favorites")) || [];
    const index = currentFavorites.findIndex((fav) => fav.title === game.title);

    if (index === -1) {
  
      currentFavorites.push(game);
      favoriteBtn.classList.add("favorited");
      favoriteBtn.textContent = "❤️";
    } else {
   
      currentFavorites.splice(index, 1);
      favoriteBtn.classList.remove("favorited");
      favoriteBtn.textContent = "♡";
    }

    localStorage.setItem("favorites", JSON.stringify(currentFavorites));
  });

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

function showFavoritedGames(){
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  document
    .querySelector("#search-input")
    .addEventListener("input", filterFavorites);
  document
    .querySelector("#sort-select")
    .addEventListener("change", filterFavorites);

function filterFavorites() {
    const searchValue = document.querySelector("#search-input").value.toLowerCase();
    const sortValue = document.querySelector("#sort-select").value;

    let filtered = favorites;

    if (searchValue) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchValue)
      );
    }

    if (sortValue === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortValue === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    displayFavorites(filtered);
  }

  filterFavorites();}

  function displayFavorites(games){
    const container = document.querySelector("#game-list-favorited");
    container.innerHTML = "";

    if (games.length === 0) {
      container.innerHTML = "<p>Ingen favoritter fundet.</p>";
      return;
    }

    for (const game of games) {
    const gameCard = document.createElement("article");
    gameCard.className = "game-card";
    gameCard.innerHTML = `
      <img src="${game.image}" alt="${game.title}" class="game-poster" />
      <div class="game-info">
        <p class="game-title">${game.title}</p>
        <button class="favorite-btn favorited">❤️</button>
        <p class="game-genre">${game.genre}</p>
        <p class="game-rating">⭐ ${game.rating}</p>
      </div>
    `;

    const favBtn = gameCard.querySelector(".favorite-btn");
    favBtn.addEventListener("click", () => {
      let currentFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
      currentFavorites = currentFavorites.filter(fav => fav.title !== game.title);
      localStorage.setItem("favorites", JSON.stringify(currentFavorites));
      showFavoritedGames(); 
    });
    gameCard.addEventListener("click", () => showgameModal(game));
    container.appendChild(gameCard);
  }
}

function populateLocationDropdown() {
  const locationSelect = document.querySelector("#location-select");
  const locations = new Set();

  for (const game of allgames) {
    if (Array.isArray(game.location)) {
      for (const location of game.location) {
        locations.add(location);
      }
    } else if (game.location) {
      locations.add(game.location);
    }
  }

  const sortedLocations = [...locations].sort();

  locationSelect.innerHTML = `<option value="all">Lokation</option>`;

  for (const location of sortedLocations) {
    locationSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${location}">${location}</option>`
    );
  }
}

function showgameModal(game) {

  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const isFavorited = favorites.some((fav) => fav.title === game.title);

  document.querySelector("#dialog-content").innerHTML = /*html*/ `
    <img src="${game.image}" alt="Poster af ${game.title}" class="game-poster">
    <div class="dialog-details">
      <p class="game-title">${game.title}</p>
      <button type="button" class="favorite-btn ${
        isFavorited ? "favorited" : ""
       }">
       ${isFavorited ? "❤️" : "♡"}
       </button>
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

  const modalFavBtn = document.querySelector("#dialog-content .favorite-btn");

  modalFavBtn.addEventListener("click", (event) => {
    event.stopPropagation();

    let currentFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const index = currentFavorites.findIndex((fav) => fav.title === game.title);

    if (index === -1) {
      currentFavorites.push(game);
      modalFavBtn.classList.add("favorited");
      modalFavBtn.textContent = "❤️";
    } else {
      currentFavorites.splice(index, 1);
      modalFavBtn.classList.remove("favorited");
      modalFavBtn.textContent = "♡";
    }

    localStorage.setItem("favorites", JSON.stringify(currentFavorites));

    const allCardButtons = document.querySelectorAll(
      ".game-card .favorite-btn"
    );
    allCardButtons.forEach((btn) => {
      const titleEl = btn.closest(".game-card").querySelector(".game-title");
      if (titleEl && titleEl.textContent === game.title) {
        if (index === -1) {
          btn.classList.add("favorited");
          btn.textContent = "❤️";
        } else {
          btn.classList.remove("favorited");
          btn.textContent = "♡";
        }
      }
    });

    if (isFavoritesPage) {
      showFavoritedGames();
    }
  });

  document.querySelector("#game-dialog").showModal();
}

function clearAllFilters() {
  document.querySelector("#search-input").value = "";
  document.querySelector("#sort-select").value = "rating";
  document.querySelector("#location-select").value = "all";

  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  const numberInputs = document.querySelectorAll("input[type='number']");
  numberInputs.forEach((input) => {
    input.value = "";
  });

  filtergames();
}

function filtergames() {
  const searchValue = document
    .querySelector("#search-input")
    .value.toLowerCase();
  const sortValue = document.querySelector("#sort-select").value;
  const locationValue = document.querySelector("#location-select").value;

  const getCheckedValues = (name) =>
    Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
      (cb) => cb.value
    );

  const selectedGenres = getCheckedValues("genre");
  const selectedSprog = getCheckedValues("sprog");
  const selectedSværhedsgrad = getCheckedValues("sværhedsgrad");
  const alderFrom = Number(document.querySelector("#alder-from").value) || 0;
  const alderTo = Number(document.querySelector("#alder-to").value) || 99;
  const spillereFrom =
    Number(document.querySelector("#spillere-from").value) || 0;
  const spillereTo = Number(document.querySelector("#spillere-to").value) || 99;
  const playtimeFrom =
    Number(document.querySelector("#playtime-from").value) || 0;
  const playtimeTo = Number(document.querySelector("#playtime-to").value) || 99;

  let filteredgames = allgames;

  if (searchValue) {
    filteredgames = filteredgames.filter((game) => {
      return game.title.toLowerCase().includes(searchValue);
    });
  }

  if (locationValue !== "all") {
    filteredgames = filteredgames.filter(
      (game) => game.location.toLowerCase() === locationValue.toLowerCase()
    );
  }

  if (selectedGenres.length > 0) {
    filteredgames = filteredgames.filter((game) =>
      selectedGenres.includes(game.genre.toLowerCase())
    );
  }

  if (selectedSprog.length > 0) {
    filteredgames = filteredgames.filter((game) =>
      selectedSprog.includes(game.language.toLowerCase())
    );
  }

  if (selectedSværhedsgrad.length > 0) {
    filteredgames = filteredgames.filter((game) =>
      selectedSværhedsgrad.includes(game.difficulty.toLowerCase())
    );
  }

  if (alderFrom > 0 || alderTo < 99) {
    filteredgames = filteredgames.filter((game) => {
      return game.age >= alderFrom && game.age <= alderTo;
    });
  }

  if (spillereFrom > 0 || spillereTo < 99) {
    filteredgames = filteredgames.filter((game) => {
      if (
        !game.players ||
        typeof game.players.min !== "number" ||
        typeof game.players.max !== "number"
      ) {
        return false;
      }

      return game.players.min <= spillereTo && game.players.max >= spillereFrom;
    });
  }

  if (playtimeFrom > 0 || playtimeTo < 99) {
    filteredgames = filteredgames.filter((game) => {
      return game.playtime >= playtimeFrom && game.playtime <= playtimeTo;
    });
  }

  if (sortValue === "title") {
    filteredgames.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "rating") {
    filteredgames.sort((a, b) => b.rating - a.rating);
  }

  displaygames(filteredgames);
}