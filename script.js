document.addEventListener('DOMContentLoaded', function() {
            // Elements
            const audio = document.getElementById('audio');
            const playPauseBtn = document.getElementById('play-pause');
            const prevBtn = document.getElementById('prev');
            const nextBtn = document.getElementById('next');
            const volumeSlider = document.getElementById('volume');
            const progressBar = document.getElementById('progress-bar');
            const progress = document.getElementById('progress');
            const currentTimeEl = document.getElementById('current-time');
            const durationEl = document.getElementById('duration');
            const titleEl = document.getElementById('title');
            const artistEl = document.getElementById('artist');
            const albumEl = document.getElementById('album');
            const playlistEl = document.getElementById('playlist');
            const fileInput = document.getElementById('file-input');
            const addMusicBtn = document.getElementById('add-music-btn');
            const emptyPlaylistEl = document.getElementById('empty-playlist');
            const songCountEl = document.getElementById('song-count');
            
            // Default empty state
            let songs = [];
            let currentSongIndex = 0;
            let isPlaying = false;
            
            // Initialize the player
            function initPlayer() {
                // Load songs from localStorage if available
                const savedSongs = localStorage.getItem('tuneSmithSongs');
                if (savedSongs) {
                    songs = JSON.parse(savedSongs);
                    updateSongCount();
                    renderPlaylist();
                    
                    if (songs.length > 0) {
                        loadSong(0);
                    }
                }
            }
            
            // Load song
            function loadSong(index) {
                if (songs.length === 0) return;
                
                const song = songs[index];
                titleEl.textContent = song.title;
                artistEl.textContent = song.artist;
                albumEl.textContent = song.album;
                audio.src = song.src;
                
                // Update active song in playlist
                const playlistItems = playlistEl.querySelectorAll('li');
                playlistItems.forEach((item, i) => {
                    if (i === index) {
                        item.classList.add('playing');
                    } else {
                        item.classList.remove('playing');
                    }
                });
                
                // Play the song
                playSong();
            }
            
            // Play song
            function playSong() {
                isPlaying = true;
                playPauseBtn.querySelector('i').classList.remove('fa-play');
                playPauseBtn.querySelector('i').classList.add('fa-pause');
                audio.play();
            }
            
            // Pause song
            function pauseSong() {
                isPlaying = false;
                playPauseBtn.querySelector('i').classList.remove('fa-pause');
                playPauseBtn.querySelector('i').classList.add('fa-play');
                audio.pause();
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
            
            // Update progress
            function updateProgress() {
                const { currentTime, duration } = audio;
                const progressPercent = (currentTime / duration) * 100;
                progress.style.width = `${progressPercent}%`;
                
                // Format time for display
                const formatTime = (time) => {
                    if (isNaN(time)) return '0:00';
                    const minutes = Math.floor(time / 60);
                    const seconds = Math.floor(time % 60);
                    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
                };
                
                // Update time displays
                currentTimeEl.textContent = formatTime(currentTime);
                if (duration) {
                    durationEl.textContent = formatTime(duration);
                }
            }
            
            // Set progress
            function setProgress(e) {
                const width = this.clientWidth;
                const clickX = e.offsetX;
                const duration = audio.duration;
                audio.currentTime = (clickX / width) * duration;
            }
            
            // Set volume
            function setVolume() {
                audio.volume = volumeSlider.value;
                
                // Update volume icon
                const volumeIcon = volumeSlider.previousElementSibling;
                if (audio.volume == 0) {
                    volumeIcon.classList.remove('fa-volume-up');
                    volumeIcon.classList.remove('fa-volume-down');
                    volumeIcon.classList.add('fa-volume-off');
                } else if (audio.volume < 0.5) {
                    volumeIcon.classList.remove('fa-volume-up');
                    volumeIcon.classList.remove('fa-volume-off');
                    volumeIcon.classList.add('fa-volume-down');
                } else {
                    volumeIcon.classList.remove('fa-volume-down');
                    volumeIcon.classList.remove('fa-volume-off');
                    volumeIcon.classList.add('fa-volume-up');
                }
            }
            
            // Update song count
            function updateSongCount() {
                songCountEl.textContent = songs.length;
                if (songs.length > 0) {
                    emptyPlaylistEl.style.display = 'none';
                    playlistEl.style.display = 'block';
                } else {
                    emptyPlaylistEl.style.display = 'block';
                    playlistEl.style.display = 'none';
                    titleEl.textContent = "No Track Selected";
                    artistEl.textContent = "Unknown Artist";
                    albumEl.textContent = "—";
                    progress.style.width = "0%";
                    currentTimeEl.textContent = "0:00";
                    durationEl.textContent = "0:00";
                    pauseSong();
                }
            }
            
            // Remove song from playlist
            function removeSong(index, e) {
                e.stopPropagation(); // Prevent triggering the song selection
                
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
                localStorage.setItem('tuneSmithSongs', JSON.stringify(songs));
            }
            
            // Render playlist
            function renderPlaylist() {
                playlistEl.innerHTML = '';
                
                songs.forEach((song, index) => {
                    const li = document.createElement('li');
                    
                    li.innerHTML = `
                        <div class="item-img">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="item-info">
                            <h4>${song.title}</h4>
                            <p>${song.artist}</p>
                        </div>
                        <div class="item-duration">${song.duration || '0:00'}</div>
                        <button class="remove-btn" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    
                    if (index === currentSongIndex) {
                        li.classList.add('playing');
                    }
                    
                    li.addEventListener('click', () => {
                        currentSongIndex = index;
                        loadSong(currentSongIndex);
                    });
                    
                    // Add event listener to remove button
                    const removeBtn = li.querySelector('.remove-btn');
                    removeBtn.addEventListener('click', (e) => {
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
                    if (file.type.startsWith('audio/')) {
                        const song = {
                            title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
                            artist: 'Unknown Artist',
                            album: 'Unknown Album',
                            src: URL.createObjectURL(file),
                            duration: '0:00' // Would need to calculate this
                        };
                        songs.push(song);
                    }
                }
                
                // Save to localStorage
                localStorage.setItem('tuneSmithSongs', JSON.stringify(songs));
                renderPlaylist();
                
                // If first song added, load it
                if (songs.length === files.length) {
                    loadSong(0);
                }
            }
            
            // Event listeners
            playPauseBtn.addEventListener('click', () => {
                if (songs.length === 0) {
                    // If no songs, trigger file input
                    fileInput.click();
                    return;
                }
                
                if (isPlaying) {
                    pauseSong();
                } else {
                    playSong();
                }
            });
            
            prevBtn.addEventListener('click', prevSong);
            nextBtn.addEventListener('click', nextSong);
            
            audio.addEventListener('timeupdate', updateProgress);
            audio.addEventListener('ended', nextSong);
            
            progressBar.addEventListener('click', setProgress);
            volumeSlider.addEventListener('input', setVolume);
            
            addMusicBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                addSongs(e.target.files);
                fileInput.value = ''; // Reset input
            });
            
            // Initialize player
            initPlayer();
        });