// Music Player Class
class MusicPlayer {
    constructor() {
        this.currentSong = null;
        this.isPlaying = false;
        this.currentPlaylist = [];
        this.currentIndex = 0;
        this.isRepeat = false;
        this.isMuted = false;
        this.previousVolume = 70;
        
        // DOM elements
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progress = document.getElementById('progress');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValue = document.getElementById('volumeValue');
        this.volumeIcon = document.getElementById('volumeIcon');
        this.muteBtn = document.getElementById('muteBtn');
        this.speedControl = document.getElementById('speedControl');
        this.vinylRecord = document.getElementById('vinylRecord');
        this.visualizer = document.getElementById('audioVisualizer');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.audioPlayer.volume = 0.7;
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        // Audio player events
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.handleTrackEnd());
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('play', () => this.handlePlay());
        this.audioPlayer.addEventListener('pause', () => this.handlePause());

        // Control buttons
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());

        // Progress bar
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        
        // Volume control
        this.volumeSlider.addEventListener('input', () => this.changeVolume());
        this.muteBtn.addEventListener('click', () => this.toggleMute());

        // Playback speed
        this.speedControl.addEventListener('change', () => this.changeSpeed());
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Space - Play/Pause
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                this.togglePlayPause();
            }
            
            // Arrow keys with Shift - Next/Previous
            if (e.shiftKey) {
                if (e.code === 'ArrowRight') {
                    e.preventDefault();
                    this.nextTrack();
                } else if (e.code === 'ArrowLeft') {
                    e.preventDefault();
                    this.previousTrack();
                }
            }

            // Arrow keys - Seek
            if (!e.shiftKey && this.audioPlayer.duration) {
                if (e.code === 'ArrowRight') {
                    e.preventDefault();
                    this.audioPlayer.currentTime = Math.min(
                        this.audioPlayer.currentTime + 5,
                        this.audioPlayer.duration
                    );
                } else if (e.code === 'ArrowLeft') {
                    e.preventDefault();
                    this.audioPlayer.currentTime = Math.max(
                        this.audioPlayer.currentTime - 5,
                        0
                    );
                }
            }

            // M - Mute/Unmute
            if (e.code === 'KeyM') {
                e.preventDefault();
                this.toggleMute();
            }
        });
    }

    playSong(song, fromPlaylist = false) {
        this.currentSong = song;
        this.audioPlayer.src = song.url;
        this.audioPlayer.play();
        this.isPlaying = true;
        this.updatePlayerUI();
        
        // Update index if from playlist
        if (fromPlaylist && this.currentPlaylist.length > 0) {
            this.currentIndex = this.currentPlaylist.findIndex(s => s.id === song.id);
        }
    }

    togglePlayPause() {
        if (!this.currentSong) {
            window.app.showToast('Please select a song to play', 'error');
            return;
        }

        if (this.isPlaying) {
            this.audioPlayer.pause();
        } else {
            this.audioPlayer.play();
        }
    }

    nextTrack() {
        if (this.currentPlaylist.length === 0) {
            window.app.showToast('Please add songs to your playlist', 'error');
            return;
        }

        this.currentIndex = (this.currentIndex + 1) % this.currentPlaylist.length;
        this.playSong(this.currentPlaylist[this.currentIndex], true);
    }

    previousTrack() {
        if (this.currentPlaylist.length === 0) {
            window.app.showToast('Please add songs to your playlist', 'error');
            return;
        }

        this.currentIndex = this.currentIndex > 0 
            ? this.currentIndex - 1 
            : this.currentPlaylist.length - 1;
        this.playSong(this.currentPlaylist[this.currentIndex], true);
    }

    handleTrackEnd() {
        if (this.isRepeat) {
            this.audioPlayer.currentTime = 0;
            this.audioPlayer.play();
        } else if (this.currentPlaylist.length > 0) {
            this.nextTrack();
        } else {
            this.isPlaying = false;
            this.updatePlayerUI();
        }
    }

    handlePlay() {
        this.isPlaying = true;
        this.updatePlayerUI();
        this.vinylRecord.classList.add('spinning');
    }

    handlePause() {
        this.isPlaying = false;
        this.updatePlayerUI();
        this.vinylRecord.classList.remove('spinning');
    }

    updatePlayerUI() {
        if (this.currentSong) {
            document.getElementById('currentTitle').textContent = this.currentSong.title;
            document.getElementById('currentArtist').textContent = this.currentSong.artist;
            document.getElementById('trackCategory').textContent = this.currentSong.category;
        }

        const playIcon = this.playPauseBtn.querySelector('.btn-icon');
        playIcon.textContent = this.isPlaying ? '⏸️' : '▶️';
        this.playPauseBtn.setAttribute('aria-label', this.isPlaying ? 'Pause' : 'Play');
    }

    updateProgress() {
        if (this.audioPlayer.duration) {
            const progressPercent = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            this.progress.style.width = `${progressPercent}%`;
            this.currentTimeEl.textContent = this.formatTime(this.audioPlayer.currentTime);
            this.progressBar.setAttribute('aria-valuenow', Math.floor(progressPercent));
        }
    }

    updateDuration() {
        if (this.audioPlayer.duration) {
            this.durationEl.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }

    seekTo(e) {
        if (this.audioPlayer.duration) {
            const rect = this.progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audioPlayer.currentTime = percent * this.audioPlayer.duration;
        }
    }

    changeVolume() {
        const volume = this.volumeSlider.value / 100;
        this.audioPlayer.volume = volume;
        this.volumeValue.textContent = `${this.volumeSlider.value}%`;
        this.updateVolumeIcon(volume);
        
        if (volume > 0 && this.isMuted) {
            this.isMuted = false;
        }
    }

    toggleMute() {
        if (this.isMuted) {
            this.audioPlayer.volume = this.previousVolume / 100;
            this.volumeSlider.value = this.previousVolume;
            this.isMuted = false;
        } else {
            this.previousVolume = this.volumeSlider.value;
            this.audioPlayer.volume = 0;
            this.volumeSlider.value = 0;
            this.isMuted = true;
        }
        this.volumeValue.textContent = `${this.volumeSlider.value}%`;
        this.updateVolumeIcon(this.audioPlayer.volume);
    }

    updateVolumeIcon(volume) {
        if (volume === 0) {
            this.volumeIcon.textContent = '🔇';
        } else if (volume < 0.5) {
            this.volumeIcon.textContent = '🔉';
        } else {
            this.volumeIcon.textContent = '🔊';
        }
    }

    changeSpeed() {
        this.audioPlayer.playbackRate = parseFloat(this.speedControl.value);
    }

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        return this.isRepeat;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    shufflePlaylist() {
        if (this.currentPlaylist.length <= 1) return;

        const currentSongId = this.currentSong ? this.currentSong.id : null;
        
        // Fisher-Yates shuffle
        for (let i = this.currentPlaylist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentPlaylist[i], this.currentPlaylist[j]] = 
            [this.currentPlaylist[j], this.currentPlaylist[i]];
        }

        // Find new index of current song
        if (currentSongId) {
            this.currentIndex = this.currentPlaylist.findIndex(song => song.id === currentSongId);
        }
    }
}

// Export player instance
window.MusicPlayer = MusicPlayer;
