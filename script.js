// DOM Elements
const audio = document.getElementById("audio");
const playPauseBtn = document.getElementById("play-pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const volumeSlider = document.getElementById("volume");
const volumeIcon = document.getElementById("volume-icon");
const volumePercent = document.getElementById("volume-percent");
const progressBar = document.getElementById("progress-bar");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const albumEl = document.getElementById("album");
const coverImg = document.getElementById("cover-img");
const playlistEl = document.getElementById("playlist");
const fileInput = document.getElementById("file-input");
const addMusicBtn = document.getElementById("add-music-btn");
const uploadBtnMain = document.getElementById("upload-btn-main");
const emptyPlaylistEl = document.getElementById("empty-playlist");
const songCountEl = document.getElementById("song-count");
const toast = document.getElementById("toast");

// Player state
let songs = [];
let currentSongIndex = 0;
let isPlaying = false;

// Initialize the player
function initPlayer() {
  // Load songs from localStorage if available
  const savedSongs = localStorage.getItem("tuneSmithSongs");
  if (savedSongs) {
    songs = JSON.parse(savedSongs);
    updateSongCount();
    renderPlaylist();

    if (songs.length > 0) {
      loadSong(0);
    }
  }

  // Set up event listeners
  setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
  playPauseBtn.addEventListener("click", togglePlayPause);
  prevBtn.addEventListener("click", prevSong);
  nextBtn.addEventListener("click", nextSong);

  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("ended", nextSong);
  audio.addEventListener("loadedmetadata", function () {
    durationEl.textContent = formatTime(audio.duration);
  });

  progressBar.addEventListener("click", setProgress);
  volumeSlider.addEventListener("input", setVolume);

  addMusicBtn.addEventListener("click", () => fileInput.click());
  uploadBtnMain.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", handleFileUpload);
}

// Handle file upload
function handleFileUpload(e) {
  addSongs(e.target.files);
  fileInput.value = ""; // Reset input
  showToast("Songs added to playlist");
}

// Load song into player
function loadSong(index) {
  if (songs.length === 0) return;

  const song = songs[index];
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  albumEl.textContent = song.album;
  audio.src = song.src;

  // Show cover image if available, otherwise show icon
  if (song.cover) {
    coverImg.src = song.cover;
    coverImg.style.display = "block";
    document.querySelector(".album-art i").style.display = "none";
  } else {
    coverImg.style.display = "none";
    document.querySelector(".album-art i").style.display = "block";
  }

  // Update active song in playlist
  updateActiveSongInPlaylist(index);

  // Play the song if player was playing
  if (isPlaying) playSong();
}

// Update active song in playlist
function updateActiveSongInPlaylist(index) {
  const playlistItems = playlistEl.querySelectorAll("li");
  playlistItems.forEach((item, i) => {
    if (i === index) {
      item.classList.add("playing");
    } else {
      item.classList.remove("playing");
    }
  });
}

// Toggle play/pause
function togglePlayPause() {
  if (songs.length === 0) {
    fileInput.click();
    return;
  }

  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

// Play song
function playSong() {
  isPlaying = true;
  playPauseBtn.querySelector("i").classList.remove("fa-play");
  playPauseBtn.querySelector("i").classList.add("fa-pause");
  document.querySelector(".now-playing").classList.add("playing");
  audio.play();
  showToast("Now playing: " + songs[currentSongIndex].title);
}

// Pause song
function pauseSong() {
  isPlaying = false;
  playPauseBtn.querySelector("i").classList.remove("fa-pause");
  playPauseBtn.querySelector("i").classList.add("fa-play");
  document.querySelector(".now-playing").classList.remove("playing");
  audio.pause();
  showToast("Playback paused");
}

// Previous song
function prevSong() {
  if (songs.length === 0) return;

  currentSongIndex--;
  if (currentSongIndex < 0) {
    currentSongIndex = songs.length - 1;
  }
  loadSong(currentSongIndex);
}

// Next song
function nextSong() {
  if (songs.length === 0) return;

  currentSongIndex++;
  if (currentSongIndex > songs.length - 1) {
    currentSongIndex = 0;
  }
  loadSong(currentSongIndex);
}

// Update progress bar
function updateProgress() {
  const { currentTime, duration } = audio;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;

  // Update time displays
  currentTimeEl.textContent = formatTime(currentTime);
  if (duration) {
    durationEl.textContent = formatTime(duration);
  }
}

// Set progress on click
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  audio.currentTime = (clickX / width) * duration;
}

// Set volume
function setVolume() {
  audio.volume = volumeSlider.value;
  const percent = Math.round(volumeSlider.value * 100);
  volumePercent.textContent = `${percent}%`;

  // Update volume icon
  if (audio.volume == 0) {
    volumeIcon.classList.remove("fa-volume-up");
    volumeIcon.classList.remove("fa-volume-down");
    volumeIcon.classList.add("fa-volume-off");
  } else if (audio.volume < 0.5) {
    volumeIcon.classList.remove("fa-volume-up");
    volumeIcon.classList.remove("fa-volume-off");
    volumeIcon.classList.add("fa-volume-down");
  } else {
    volumeIcon.classList.remove("fa-volume-down");
    volumeIcon.classList.remove("fa-volume-off");
    volumeIcon.classList.add("fa-volume-up");
  }
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
}

// Update song count display
function updateSongCount() {
  songCountEl.textContent = songs.length;
  if (songs.length > 0) {
    emptyPlaylistEl.style.display = "none";
    playlistEl.style.display = "flex";
    playlistEl.classList.add("scrollable");
  } else {
    emptyPlaylistEl.style.display = "flex";
    playlistEl.style.display = "none";
    playlistEl.classList.remove("scrollable");
    resetPlayerDisplay();
  }
}

// Reset player display when no songs
function resetPlayerDisplay() {
  titleEl.textContent = "No Track Selected";
  artistEl.textContent = "Unknown Artist";
  albumEl.textContent = "—";
  progress.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  coverImg.style.display = "none";
  document.querySelector(".album-art i").style.display = "block";
  document.querySelector(".now-playing").classList.remove("playing");
  pauseSong();
}

// Remove song from playlist
function removeSong(index, e) {
  e.stopPropagation(); // Prevent triggering the song selection

  const songTitle = songs[index].title;

  // If we're removing the currently playing song
  if (index === currentSongIndex) {
    if (songs.length === 1) {
      // If it's the last song, reset player
      songs.splice(index, 1);
      currentSongIndex = 0;
      updateSongCount();
      renderPlaylist();
    } else if (currentSongIndex === songs.length - 1) {
      // If it's the last song in the list but not the only one
      songs.splice(index, 1);
      currentSongIndex = 0;
      loadSong(currentSongIndex);
    } else {
      // If it's somewhere in the middle
      songs.splice(index, 1);
      loadSong(currentSongIndex);
    }
  } else if (index < currentSongIndex) {
    // If we're removing a song before the current one
    songs.splice(index, 1);
    currentSongIndex--;
    renderPlaylist();
  } else {
    // If we're removing a song after the current one
    songs.splice(index, 1);
    renderPlaylist();
  }

  // Save to localStorage
  localStorage.setItem("tuneSmithSongs", JSON.stringify(songs));
  showToast(`Removed: ${songTitle}`);
}

// Render playlist
function renderPlaylist() {
  playlistEl.innerHTML = "";

  songs.forEach((song, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
                    <div class="item-img">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="item-info">
                        <h4>${song.title}</h4>
                        <p>${song.artist}</p>
                    </div>
                    <div class="item-duration">${song.duration || "0:00"}</div>
                    <button class="remove-btn" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                `;

    if (index === currentSongIndex) {
      li.classList.add("playing");
    }

    li.addEventListener("click", () => {
      currentSongIndex = index;
      loadSong(currentSongIndex);
    });

    // Add event listener to remove button
    const removeBtn = li.querySelector(".remove-btn");
    removeBtn.addEventListener("click", (e) => {
      removeSong(index, e);
    });

    playlistEl.appendChild(li);
  });

  updateSongCount();
}

// Add songs from local files
function addSongs(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith("audio/")) {
      const song = {
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        artist: "Unknown Artist",
        album: "Unknown Album",
        src: URL.createObjectURL(file),
        duration: "0:00",
      };
      songs.push(song);
    }
  }

  // Save to localStorage
  localStorage.setItem("tuneSmithSongs", JSON.stringify(songs));
  renderPlaylist();

  // If first song added, load it
  if (songs.length === files.length) {
    loadSong(0);
  }
}

// Show toast notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Initialize player when DOM is loaded
document.addEventListener("DOMContentLoaded", initPlayer);
