const GAMES = [
  { id: 1, t: "Neon Drift", g: "Course", p: ["PC", "PlayStation", "Xbox"], d: "2024-03-15", pop: 92 },
  { id: 2, t: "Eldoria Chronicles", g: "RPG", p: ["PC", "PlayStation", "Switch"], d: "2023-11-02", pop: 97 },
  { id: 3, t: "Shadow Protocol", g: "Action", p: ["PC", "PlayStation", "Xbox"], d: "2025-01-24", pop: 88 },
  { id: 4, t: "Pixel Striker", g: "Sport", p: ["PC", "Switch"], d: "2022-06-10", pop: 79 },
  { id: 5, t: "Cosmic Farm", g: "Simulation", p: ["PC", "Switch", "PlayStation"], d: "2024-08-29", pop: 84 },
  { id: 6, t: "Dungeon Echo", g: "RPG", p: ["PC", "Switch", "Xbox"], d: "2025-05-16", pop: 90 }
];
const $ = selector => document.querySelector(selector);

/* API Audio : feedback sonore discret, sans bloquer l'interface si le son est indisponible. */
const clickSound = () => {
  const sound = new Audio("media/click.wav");
  sound.volume = 0.4;
  sound.play().catch(() => {});
};

const card = (game, index) => `
  <article class="card" style="animation-delay:${index * 0.07}s">
    <div class="thumb">
      <img src="media/jeu${game.id}.svg" alt="Jaquette de ${game.t}" loading="lazy">
      <video muted loop playsinline preload="none" src="media/trailer${game.id}.mp4" aria-label="Trailer de ${game.t}"></video>
      <span class="tag">${game.g}</span>
    </div>
    <div class="body">
      <h3>${game.t}</h3>
      <p>${game.g} · ${game.d.slice(0, 4)} · ★ ${game.pop}/100</p>
      <a class="btn" href="jeu${game.id}.html">Voir plus</a>
    </div>
  </article>`;

/* API Video : lecture au survol et remise a zero a la sortie du pointeur. */
function attachTrailerHover(container) {
  if (!container) return;
  container.querySelectorAll(".card").forEach(cardElement => {
    const video = cardElement.querySelector("video");
    if (!video) return;
    cardElement.addEventListener("pointerenter", event => {
      if (event.pointerType === "touch") return;
      cardElement.classList.add("playing");
      video.play().catch(() => cardElement.classList.remove("playing"));
    });
    cardElement.addEventListener("pointerleave", event => {
      if (event.pointerType === "touch") return;
      video.pause();
      try { video.currentTime = 0; } catch (_) { /* Les metadonnees ne sont pas toujours chargees. */ }
      cardElement.classList.remove("playing");
    });
  });
}

function renderGames(games, container) {
  if (!container) return;
  container.innerHTML = games.length
    ? games.map(card).join("")
    : '<p class="empty" role="status">Aucun jeu ne correspond à votre recherche.</p>';
  attachTrailerHover(container);
}

/* Accueil : recherche, genre, plateforme et tri. */
const grid = $("#grid");
if (grid) {
  const form = $("#filters");
  const status = $("#results-status");

  const applyFilters = () => {
    const query = form.elements.q.value.trim().toLocaleLowerCase("fr");
    const genre = form.elements.genre.value;
    const platform = form.elements.platform.value;
    const sort = form.elements.sort.value;
    const filtered = GAMES.filter(game =>
      game.t.toLocaleLowerCase("fr").includes(query) &&
      (!genre || game.g === genre) &&
      (!platform || game.p.includes(platform))
    );

    filtered.sort((a, b) => {
      if (sort === "pop") return b.pop - a.pop;
      if (sort === "date") return b.d.localeCompare(a.d);
      return a.t.localeCompare(b.t, "fr");
    });

    renderGames(filtered, grid);
    if (status) {
      status.textContent = `${filtered.length} jeu${filtered.length > 1 ? "x" : ""} affiché${filtered.length > 1 ? "s" : ""}`;
    }
  };

  form.addEventListener("input", applyFilters);
  form.addEventListener("change", event => {
    if (event.target.matches('select, input[type="search"]')) clickSound();
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    applyFilters();
    clickSound();
  });
  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      applyFilters();
      clickSound();
    }, 0);
  });
  applyFilters();
}

/* Pages de detail : suggestions, controles video, favoris. */
const gameId = Number(document.body.dataset.id);
if (Number.isInteger(gameId) && gameId > 0) {
  const game = GAMES.find(item => item.id === gameId);
  const similarGrid = $("#similar");
  if (game && similarGrid) {
    const similar = GAMES
      .filter(item => item.id !== gameId)
      .sort((a, b) => Number(b.g === game.g) - Number(a.g === game.g) || b.pop - a.pop)
      .slice(0, 4);
    renderGames(similar, similarGrid);
  }

  const video = $("#vid");
  const playPause = $("#pp");
  const progress = $("#bar");
  const fastForward = $("#ff");
  const volume = $("#vol");

  if (video && playPause && progress && fastForward && volume) {
    video.volume = Number(volume.value);

    const syncVideoControls = () => {
      const durationReady = Number.isFinite(video.duration) && video.duration > 0;
      progress.disabled = !durationReady;
      fastForward.disabled = !durationReady;
      if (durationReady) {
        progress.value = String((video.currentTime / video.duration) * 100);
      } else {
        progress.value = "0";
      }
    };

    playPause.addEventListener("click", () => {
      if (video.paused) {
        video.play().catch(() => { playPause.textContent = "▶"; });
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", () => { playPause.textContent = "⏸"; });
    video.addEventListener("pause", () => { playPause.textContent = "▶"; });
    video.addEventListener("loadedmetadata", syncVideoControls);
    video.addEventListener("durationchange", syncVideoControls);
    video.addEventListener("timeupdate", syncVideoControls);
    video.addEventListener("ended", () => { playPause.textContent = "▶"; });
    video.addEventListener("error", syncVideoControls);

    fastForward.addEventListener("click", () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      video.currentTime = Math.min(video.duration, video.currentTime + 5);
    });
    progress.addEventListener("input", () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      video.currentTime = (Number(progress.value) / 100) * video.duration;
    });
    volume.addEventListener("input", () => {
      video.volume = Number(volume.value);
    });
    syncVideoControls();
  }

  const favoriteButton = $("#fav");
  const storageKey = "gh-fav";
  const readFavorites = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(saved) ? saved.filter(Number.isInteger) : [];
    } catch (_) {
      return [];
    }
  };

  if (favoriteButton) {
    const updateFavoriteButton = () => {
      const isFavorite = readFavorites().includes(gameId);
      favoriteButton.textContent = isFavorite ? "★ Dans mes favoris" : "☆ Ajouter aux favoris";
      favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    };

    favoriteButton.addEventListener("click", () => {
      const favorites = readFavorites();
      const next = favorites.includes(gameId)
        ? favorites.filter(item => item !== gameId)
        : [...favorites, gameId];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (_) {
        /* Le bouton reste utilisable, mais la persistance depend des droits du navigateur. */
      }
      clickSound();
      updateFavoriteButton();
    });
    updateFavoriteButton();
  }
}

/* Footer : playlist audio presente sur toutes les pages. */
const playlist = $("#pl");
if (playlist) {
  let currentIndex = 0;
  const audio = playlist.querySelector("audio");
  const label = playlist.querySelector("span");
  const loadTrack = shouldPlay => {
    const currentGame = GAMES[currentIndex];
    audio.src = `media/theme${currentGame.id}.wav`;
    label.textContent = `♪ ${currentGame.t}`;
    audio.load();
    if (shouldPlay) audio.play().catch(() => {});
  };
  const moveTrack = direction => {
    const shouldResume = !audio.paused;
    currentIndex = (currentIndex + direction + GAMES.length) % GAMES.length;
    loadTrack(shouldResume);
  };
  playlist.querySelector(".prev").addEventListener("click", () => moveTrack(-1));
  playlist.querySelector(".next").addEventListener("click", () => moveTrack(1));
  audio.addEventListener("ended", () => moveTrack(1));
  loadTrack(false);
}
