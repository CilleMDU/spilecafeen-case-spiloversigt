"Use strict";

document.addEventListener("DOMContentLoaded", initApp);

// Global variabel til alle film - tilgængelig for alle funktioner
let allgames = [];

// #1: Initialize the app - sæt event listeners og hent data
function initApp() {
  getgames(); // Hent film data fra JSON fil

  // Event listeners for alle filtre - kører filtergames når brugeren ændrer noget
  document.querySelector("#search-input").addEventListener("input", filtergames);
  document.querySelector("#genre-select").addEventListener("change", filtergames);
  document.querySelector("#sort-select").addEventListener("change", filtergames);
  document.querySelector("#year-from").addEventListener("input", filtergames);
  document.querySelector("#year-to").addEventListener("input", filtergames);
  document.querySelector("#rating-from").addEventListener("input", filtergames);
  document.querySelector("#rating-to").addEventListener("input", filtergames);

  // Event listener for clear-knappen - rydder alle filtre
  document.querySelector("#clear-filters").addEventListener("click", clearAllFilters);
}

// #2: Fetch games from JSON file - asynkron funktion der henter data
async function getgames() {
  // Hent data fra URL - await venter på svar før vi går videre
  const response = await fetch("https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json");

  // Pars JSON til JS array og gem i global variabel, der er tilgængelig for alle funktioner
  allgames = await response.json();

  populateGenreDropdown(); // Udfyld dropdown med genrer fra data
  displaygames(allgames); // Vis alle film ved start
}

// ===== VISNING AF FILM =====
// #3: Display all games - vis en liste af film på siden
function displaygames(games) {
  const gameList = document.querySelector("#game-list"); // Find container til film
  gameList.innerHTML = ""; // Ryd gammel liste (fjern alt HTML indhold)

  // Hvis ingen film matcher filtrene, vis en besked til brugeren
  if (games.length === 0) {
    gameList.innerHTML = '<p class="no-results">Ingen film matchede dine filtre 😢</p>';
    return; // Stop funktionen her - return betyder "stop her og gå ikke videre"
  }

  // Loop gennem alle film og vis hver enkelt
  for (const game of games) {
    displaygame(game); // Kald displaygame for hver film
  }
}

// #4: Render a single game card and add event listeners - lav et film kort
function displaygame(game) {
  const gameList = document.querySelector("#game-list"); // Find container til film

  // Byg HTML struktur dynamisk - template literal med ${} til at indsætte data
  const gameHTML = /*html*/ `
    <article class="game-card" tabindex="0">
      <img src="${game.image}" 
           alt="Poster of ${game.title}" 
           class="game-poster" />
      <div class="game-info">
        <h3>${game.title} <span class="game-year">(${game.year})</span></h3>
        <p class="game-genre">${game.genre}</p>
        <p class="game-rating">⭐ ${game.rating}</p>
        <p class="game-director"><strong>Director:</strong> ${game.director}</p>
      </div>
    </article>
  `;

  // Tilføj game card til DOM (HTML) - insertAdjacentHTML sætter HTML ind uden at overskrive
  gameList.insertAdjacentHTML("beforeend", gameHTML);

  // Find det kort vi lige har tilføjet (det sidste element)
  const newCard = gameList.lastElementChild;

  // Tilføj click event til kortet - når brugeren klikker på kortet
  newCard.addEventListener("click", function () {
    showgameModal(game); // Vis modal med film detaljer
  });

  // Tilføj keyboard support (Enter og mellemrum) for tilgængelighed
  newCard.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); // Forhindre scroll ved mellemrum
      showgameModal(game); // Vis modal med film detaljer
    }
  });
}

// ===== DROPDOWN OG MODAL FUNKTIONER =====
// #5: Udfyld genre-dropdown med alle unikke genrer fra data
function populateGenreDropdown() {
  const genreSelect = document.querySelector("#genre-select"); // Find genre dropdown
  const genres = new Set(); // Set fjerner automatisk dubletter

  // Samle alle unikke genrer fra alle film
  // Hver film kan have flere genrer (array), så vi løber gennem dem alle
  for (const game of allgames) {
    for (const genre of game.genre) {
      genres.add(genre); // Set sikrer kun unikke værdier
    }
  }

  // Fjern gamle options undtagen 'Alle genrer' (reset dropdown)
  genreSelect.innerHTML = /*html*/ `<option value="all">Alle genrer</option>`;

  // Sortér genres alfabetisk og tilføj dem som options
  const sortedGenres = [...genres].sort(); // Konvertér Set til Array og sortér genrer
  for (const genre of sortedGenres) {
    genreSelect.insertAdjacentHTML("beforeend", /*html*/ `<option value="${genre}">${genre}</option>`);
  }
}

// #6: Vis game i modal dialog - popup vindue med film detaljer
function showgameModal(game) {
  // Find modal indhold container og byg HTML struktur dynamisk
  document.querySelector("#dialog-content").innerHTML = /*html*/ `
    <img src="${game.image}" alt="Poster af ${game.title}" class="game-poster">
    <div class="dialog-details">
      <h2>${game.title} <span class="game-year">(${game.year})</span></h2>
      <p class="game-genre">${game.genre.join(", ")}</p>
      <p class="game-rating">⭐ ${game.rating}</p>
      <p><strong>Director:</strong> ${game.director}</p>
      <p><strong>Actors:</strong> ${game.actors.join(", ")}</p>
      <p class="game-description">${game.description}</p>
    </div>
  `;

  // Åbn modalen - showModal() er en built-in browser funktion
  document.querySelector("#game-dialog").showModal();
}

// ===== FILTER FUNKTIONER =====
// #7: Ryd alle filtre - reset alle filter felter til tomme værdier
function clearAllFilters() {
  // Ryd alle input felter - sæt value til tom string eller standard værdi
  document.querySelector("#search-input").value = "";
  document.querySelector("#genre-select").value = "all";
  document.querySelector("#sort-select").value = "none";
  document.querySelector("#year-from").value = "";
  document.querySelector("#year-to").value = "";
  document.querySelector("#rating-from").value = "";
  document.querySelector("#rating-to").value = "";

  // Kør filtrering igen (vil vise alle film da alle filtre er ryddet)
  filtergames();
}

// #8: Komplet filtrering med alle funktioner - den vigtigste funktion!
function filtergames() {
  // Hent alle filter værdier fra input felterne
  const searchValue = document.querySelector("#search-input").value.toLowerCase(); // Konvertér til lowercase for case-insensitive søgning
  const genreValue = document.querySelector("#genre-select").value;
  const sortValue = document.querySelector("#sort-select").value;

  // Number() konverterer string til tal, || 0 giver default værdi hvis tomt
  const yearFrom = Number(document.querySelector("#year-from").value) || 0;
  const yearTo = Number(document.querySelector("#year-to").value) || 9999;
  const ratingFrom = Number(document.querySelector("#rating-from").value) || 0;
  const ratingTo = Number(document.querySelector("#rating-to").value) || 10;

  // Start med alle film - kopiér til ny variabel så vi ikke ændrer originalen
  let filteredgames = allgames;

  // FILTER 1: Søgetekst - filtrer på film titel
  if (searchValue) {
    // Kun filtrer hvis der er indtastet noget
    filteredgames = filteredgames.filter(game => {
      // includes() checker om søgeteksten findes i titlen
      return game.title.toLowerCase().includes(searchValue);
    });
  }

  // FILTER 2: Genre - filtrer på valgt genre
  if (genreValue !== "all") {
    // Kun filtrer hvis ikke "all" er valgt
    filteredgames = filteredgames.filter(game => {
      // includes() checker om genren findes i filmens genre array
      return game.genre.includes(genreValue);
    });
  }

  // FILTER 3: År range - filtrer film mellem to årstal
  if (yearFrom > 0 || yearTo < 9999) {
    // Kun filtrer hvis der er sat grænser
    filteredgames = filteredgames.filter(game => {
      // Check om filmens år er mellem min og max værdi
      return game.year >= yearFrom && game.year <= yearTo;
    });
  }

  // FILTER 4: Rating range - filtrer film mellem to ratings
  if (ratingFrom > 0 || ratingTo < 10) {
    // Kun filtrer hvis der er sat grænser
    filteredgames = filteredgames.filter(game => {
      // Check om filmens rating er mellem min og max værdi
      return game.rating >= ratingFrom && game.rating <= ratingTo;
    });
  }

  // SORTERING (altid til sidst efter alle filtre er anvendt)
  if (sortValue === "title") {
    // Alfabetisk sortering - localeCompare() håndterer danske bogstaver korrekt
    filteredgames.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "year") {
    // Sortér på år (nyeste først) - b - a giver descending order
    filteredgames.sort((a, b) => b.year - a.year);
  } else if (sortValue === "rating") {
    // Sortér på rating (højeste først) - b - a giver descending order
    filteredgames.sort((a, b) => b.rating - a.rating);
  }

  // Vis de filtrerede film på siden
  displaygames(filteredgames);
}games