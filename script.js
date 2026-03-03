/* ADD SONGS HERE! */
const playlist = [
  { title: "Song Title Here", artist: "Artist Name", file: "test.MP3" },
];

/* everything below you probably shouldn't mess with */

// --- DOM Elements ---
const audio = new Audio();
const btnPlay = document.getElementById("btn-play");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnQueue = document.getElementById("btn-queue");
const progressBar = document.getElementById("progress-bar");
const volumeBar = document.getElementById("volume-bar");
const timeCurrent = document.getElementById("time-current");
const timeTotal = document.getElementById("time-total");
const playerTitle = document.getElementById("player-title");
const playlistPanel = document.getElementById("playlist-panel");
const queuePanel = document.getElementById("queue-panel");
const themeToggle = document.getElementById("theme-toggle");
let currentIndex = -1;
let isPlaying = false;

// theme toggler
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☾" : "☀";
  localStorage.setItem("theme", theme);
}

setTheme(localStorage.getItem("theme") || "light");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

// tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    const target = document.getElementById(btn.dataset.tab);
    if (target) target.classList.add("active");
  });
});

// playlist queue button
btnQueue.addEventListener("click", () => {
  queuePanel.classList.toggle("open");
  btnQueue.classList.toggle("active");
});

// create the playlist window
function buildPlaylist() {
  playlistPanel.innerHTML = "";

  if (playlist.length === 0) {
    playlistPanel.innerHTML = '<p style="text-align:center; opacity:0.6;">No songs added yet~ Add some in script.js!</p>';
    return;
  }

  playlist.forEach((song, index) => {
    const item = document.createElement("div");
    item.className = "playlist-item";
    item.dataset.index = index;

    item.innerHTML = `
      <span class="playlist-item-icon">♫</span>
      <span class="playlist-item-title">${song.title}</span>
      ${song.artist ? `<span class="playlist-item-artist">${song.artist}</span>` : ""}
    `;

    item.addEventListener("click", () => {
      loadTrack(index);
      playTrack();
    });

    playlistPanel.appendChild(item);
  });
}

// highlight track
function highlightCurrent() {
  document.querySelectorAll(".playlist-item").forEach((item) => {
    item.classList.remove("playing");
    item.querySelector(".playlist-item-icon").textContent = "♫";
  });

  if (currentIndex >= 0) {
    const active = document.querySelector(`.playlist-item[data-index="${currentIndex}"]`);
    if (active) {
      active.classList.add("playing");
      active.querySelector(".playlist-item-icon").textContent = "▶";
    }
  }
}

// marquee
function updateMarquee() {
  const wrapper = playerTitle.parentElement;
  playerTitle.classList.remove("scrolling");
  // Small delay so the browser can measure without the animation
  requestAnimationFrame(() => {
    if (playerTitle.scrollWidth > wrapper.clientWidth + 2) {
      playerTitle.classList.add("scrolling");
    }
  });
}

// load music track
function loadTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  currentIndex = index;
  const song = playlist[index];
  audio.src = "music/" + song.file;
  playerTitle.textContent = song.artist ? `${song.title} — ${song.artist}` : song.title;
  highlightCurrent();
  updateMarquee();
}

// play/pause
function playTrack() {
  if (playlist.length === 0) return;
  if (currentIndex < 0) loadTrack(0);
  audio.play();
  isPlaying = true;
  btnPlay.textContent = "⏸";
}

function pauseTrack() {
  audio.pause();
  isPlaying = false;
  btnPlay.textContent = "▶";
}

btnPlay.addEventListener("click", () => {
  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
});

// skip track
btnNext.addEventListener("click", () => {
  if (playlist.length === 0) return;
  const next = (currentIndex + 1) % playlist.length;
  loadTrack(next);
  playTrack();
});

btnPrev.addEventListener("click", () => {
  if (playlist.length === 0) return;
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const prev = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(prev);
  playTrack();
});

// progress bar
audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 100;
    progressBar.value = pct;
    timeCurrent.textContent = formatTime(audio.currentTime);
    timeTotal.textContent = formatTime(audio.duration);
  }
});

progressBar.addEventListener("input", () => {
  if (audio.duration) {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
});

// volume
audio.volume = volumeBar.value / 100;
volumeBar.addEventListener("input", () => {
  audio.volume = volumeBar.value / 100;
});

// autoplay next track
audio.addEventListener("ended", () => {
  const next = currentIndex + 1;
  if (next < playlist.length) {
    loadTrack(next);
    playTrack();
  } else {
    pauseTrack();
  }
});

function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + (s < 10 ? "0" : "") + s;
}

buildPlaylist();
