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
let isLoading = false;

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
  const files = e.target.files;
  if (files.length > 0) {
    addSongs(files);
    fileInput.value = ""; // Reset input
  }
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
    volumeIcon.classList.add("fa-volume-mute");
  } else if (audio.volume < 0.5) {
    volumeIcon.classList.remove("fa-volume-up");
    volumeIcon.classList.remove("fa-volume-mute");
    volumeIcon.classList.add("fa-volume-down");
  } else {
    volumeIcon.classList.remove("fa-volume-down");
    volumeIcon.classList.remove("fa-volume-mute");
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
      if (!isPlaying) playSong();
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

// Extract metadata from audio file
function extractMetadata(file) {
  return new Promise((resolve) => {
    // Create a temporary audio element to get duration
    const tempAudio = new Audio();
    tempAudio.src = URL.createObjectURL(file);

    tempAudio.addEventListener("loadedmetadata", function () {
      const duration = tempAudio.duration;

      // Try to read ID3 tags if it's an MP3 file
      if (file.type === "audio/mpeg") {
        const reader = new FileReader();
        reader.onload = function (e) {
          const arrayBuffer = e.target.result;

          // Simple ID3 tag parsing (basic implementation)
          try {
            const dataView = new DataView(arrayBuffer);
            let offset = 0;

            // Look for ID3 header
            if (dataView.getUint32(offset) === 0x49443300) {
              offset += 6; // Skip ID3 header

              // Get tag size
              const tagSize = dataView.getUint32(offset);
              offset += 4;

              let metadata = {
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Unknown Artist",
                album: "Unknown Album",
                cover: null,
              };

              // Try to find frames (simplified)
              while (offset < tagSize + 10) {
                const frameHeader = String.fromCharCode(
                  dataView.getUint8(offset),
                  dataView.getUint8(offset + 1),
                  dataView.getUint8(offset + 2),
                  dataView.getUint8(offset + 3)
                );

                const frameSize = dataView.getUint32(offset + 4);
                offset += 10;

                if (frameHeader === "TIT2") {
                  // Title frame
                  metadata.title = readStringFrame(dataView, offset, frameSize);
                } else if (frameHeader === "TPE1") {
                  // Artist frame
                  metadata.artist = readStringFrame(
                    dataView,
                    offset,
                    frameSize
                  );
                } else if (frameHeader === "TALB") {
                  // Album frame
                  metadata.album = readStringFrame(dataView, offset, frameSize);
                } else if (frameHeader === "APIC") {
                  // Picture frame (simplified)
                  // Skip for now as it's complex to handle
                }

                offset += frameSize;
              }

              metadata.duration = duration;
              resolve(metadata);
            } else {
              // No ID3 tags found
              resolve({
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Unknown Artist",
                album: "Unknown Album",
                duration: duration,
                cover: null,
              });
            }
          } catch (error) {
            console.error("Error parsing ID3 tags:", error);
            resolve({
              title: file.name.replace(/\.[^/.]+$/, ""),
              artist: "Unknown Artist",
              album: "Unknown Album",
              duration: duration,
              cover: null,
            });
          }
        };
        reader.readAsArrayBuffer(file.slice(0, 1024 * 10)); // Read first 10KB for ID3 tags
      } else {
        // For non-MP3 files, just get the duration
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Unknown Artist",
          album: "Unknown Album",
          duration: duration,
          cover: null,
        });
      }

      URL.revokeObjectURL(tempAudio.src);
    });

    tempAudio.addEventListener("error", () => {
      resolve({
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist",
        album: "Unknown Album",
        duration: 0,
        cover: null,
      });
      URL.revokeObjectURL(tempAudio.src);
    });
  });
}

// Helper function to read string frames from ID3 tags
function readStringFrame(dataView, offset, size) {
  let text = "";
  let encoding = dataView.getUint8(offset);
  offset += 1;
  size -= 1;

  for (let i = 0; i < size; i++) {
    const charCode = dataView.getUint8(offset + i);
    if (charCode === 0) break; // Null terminator
    text += String.fromCharCode(charCode);
  }

  return text;
}

// Add songs from local files with metadata extraction
async function addSongs(files) {
  if (isLoading) {
    showToast("Please wait, songs are still processing");
    return;
  }

  isLoading = true;
  showToast("Processing audio files...");

  const loadingIndicator = document.createElement("li");
  loadingIndicator.className = "loading";
  loadingIndicator.innerHTML =
    '<div class="spinner"></div><span>Processing songs...</span>';
  playlistEl.appendChild(loadingIndicator);

  const audioFiles = Array.from(files).filter((file) =>
    file.type.startsWith("audio/")
  );

  for (let i = 0; i < audioFiles.length; i++) {
    const file = audioFiles[i];

    try {
      // Extract metadata
      const metadata = await extractMetadata(file);

      const song = {
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        src: URL.createObjectURL(file),
        duration: formatTime(metadata.duration),
        cover: metadata.cover,
      };

      songs.push(song);
    } catch (error) {
      console.error("Error processing file:", error);
      // Add song with basic info if metadata extraction fails
      const song = {
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Unknown Artist",
        album: "Unknown Album",
        src: URL.createObjectURL(file),
        duration: "0:00",
        cover: null,
      };
      songs.push(song);
    }
  }

  // Remove loading indicator
  playlistEl.removeChild(loadingIndicator);

  // Save to localStorage
  localStorage.setItem("tuneSmithSongs", JSON.stringify(songs));
  renderPlaylist();

  // If first song added, load it
  if (songs.length === audioFiles.length) {
    loadSong(0);
  }

  showToast(`${audioFiles.length} song(s) added to playlist`);
  isLoading = false;
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
