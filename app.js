class MusicApp {
    constructor() {
        this.player = null;
        this.filteredLibrary = [];
        this.currentCategory = 'all';
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Initialize player
        this.player = new MusicPlayer();
        
        // Initialize theme
        this.initTheme();
        
        // Initialize library
        this.filteredLibrary = [...musicLibrary];
        this.renderMusicLibrary();
        this.renderPlaylist();
        this.updateCounts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize animations
        this.initAnimations();
        
        console.log('🎵 Music Player initialized!');
        console.log('💡 Keyboard shortcuts: Space (play/pause), Shift+→/← (next/prev), M (mute)');
    }

    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        document.documentElement.setAttribute('data-theme', this.theme);
        
        themeToggle.addEventListener('click', () => {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', this.theme);
            localStorage.setItem('theme', this.theme);
        });
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');
        
        searchInput.addEventListener('input', () => this.searchMusic());
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            this.searchMusic();
        });

        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByCategory(e));
        });

        // Playlist controls
        document.getElementById('shuffleBtn').addEventListener('click', () => this.shufflePlaylist());
        document.getElementById('repeatBtn').addEventListener('click', () => this.toggleRepeat());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearPlaylist());
        document.getElementById('saveBtn').addEventListener('click', () => this.savePlaylist());
    }

    initAnimations() {
        // Simple AOS-like animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                }
            });
        }, observerOptions);

        document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
    }

    renderMusicLibrary() {
        const musicList = document.getElementById('musicList');
        musicList.innerHTML = '';

        if (this.filteredLibrary.length === 0) {
            musicList.innerHTML = `
                <div style="text-align: center; opacity: 0.7; padding: 40px;">
                    <p style="font-size: 2rem; margin-bottom: 10px;">🎵</p>
                    <p>No songs found</p>
                </div>
            `;
            return;
        }

        this.filteredLibrary.forEach(song => {
            const musicItem = document.createElement('div');
            musicItem.className = 'music-item';
            musicItem.setAttribute('role', 'listitem');
            
            if (this.player.currentSong && this.player.currentSong.id === song.id) {
                musicItem.classList.add('playing');
            }

            const isInPlaylist = this.player.currentPlaylist.some(s => s.id === song.id);

            musicItem.innerHTML = `
                <div class="music-info">
                    <div class="music-title">${song.title}</div>
                    <div class="music-artist">${song.artist}</div>
                    <div class="music-duration">${song.duration}</div>
                </div>
                <button class="add-to-playlist" ${isInPlaylist ? 'disabled' : ''}>
                    ${isInPlaylist ? '✓ Added' : '+ Add'}
                </button>
            `;

            // Click to play
            musicItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-playlist')) {
                    this.player.playSong(song);
                    this.renderMusicLibrary();
                    this.renderPlaylist();
                }
            });

            // Add to playlist
            const addBtn = musicItem.querySelector('.add-to-playlist');
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!isInPlaylist) {
                    this.addToPlaylist(song.id);
                }
            });

            musicList.appendChild(musicItem);
        });
    }

    renderPlaylist() {
        const playlist = document.getElementById('playlist');
        playlist.innerHTML = '';

        if (this.player.currentPlaylist.length === 0) {
            playlist.innerHTML = `
                <div style="text-align: center; opacity: 0.7; padding: 40px;">
                    <p style="font-size: 2rem; margin-bottom: 10px;">📋</p>
                    <p>Your playlist is empty</p>
                    <p style="font-size: 0.875rem; margin-top: 5px;">Add songs from the library</p>
                </div>
            `;
            return;
        }

        this.player.currentPlaylist.forEach((song, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            playlistItem.setAttribute('role', 'listitem');
            
            if (this.player.currentSong && this.player.currentSong.id === song.id) {
                playlistItem.classList.add('playing');
            }

            playlistItem.innerHTML = `
                <div class="music-info">
                    <div class="music-title">${index + 1}. ${song.title}</div>
                    <div class="music-artist">${song.artist} • ${song.duration}</div>
                </div>
                <button class="remove-btn" aria-label="Remove from playlist">×</button>
            `;

            // Click to play
            playlistItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-btn')) {
                    this.playFromPlaylist(index);
                }
            });

            // Remove from playlist
            const removeBtn = playlistItem.querySelector('.remove-btn');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFromPlaylist(index);
            });

            playlist.appendChild(playlistItem);
        });
    }

    playFromPlaylist(index) {
        this.player.currentIndex = index;
        this.player.playSong(this.player.currentPlaylist[index], true);
        this.renderMusicLibrary();
        this.renderPlaylist();
    }

    addToPlaylist(songId) {
        const song = musicLibrary.find(s => s.id === songId);
        if (song && !this.player.currentPlaylist.find(s => s.id === songId)) {
            this.player.currentPlaylist.push(song);
            this.renderPlaylist();
            this.renderMusicLibrary();
            this.updateCounts();
            this.showToast(`Added "${song.title}" to playlist`, 'success');
        }
    }

    removeFromPlaylist(index) {
        const song = this.player.currentPlaylist[index];
        this.player.currentPlaylist.splice(index, 1);
        
        if (this.player.currentIndex >= index && this.player.currentIndex > 0) {
            this.player.currentIndex--;
        }
        
        this.renderPlaylist();
        this.renderMusicLibrary();
        this.updateCounts();
        this.showToast(`Removed "${song.title}" from playlist`, 'success');
    }

    clearPlaylist() {
        if (this.player.currentPlaylist.length === 0) {
            this.showToast('Playlist is already empty', 'error');
            return;
        }

        if (confirm('Are you sure you want to clear the entire playlist?')) {
            this.player.currentPlaylist = [];
            this.player.currentIndex = 0;
            this.renderPlaylist();
            this.renderMusicLibrary();
            this.updateCounts();
            this.showToast('Playlist cleared', 'success');
        }
    }

    shufflePlaylist() {
        if (this.player.currentPlaylist.length <= 1) {
            this.showToast('Add more songs to shuffle', 'error');
            return;
        }

        this.player.shufflePlaylist();
        this.renderPlaylist();
        this.showToast('Playlist shuffled!', 'success');
    }

    toggleRepeat() {
        const isRepeat = this.player.toggleRepeat();
        const repeatBtn = document.getElementById('repeatBtn');
        
        if (isRepeat) {
            repeatBtn.classList.add('active');
            this.showToast('Repeat enabled', 'success');
        } else {
            repeatBtn.classList.remove('active');
            this.showToast('Repeat disabled', 'success');
        }
    }

    savePlaylist() {
        if (this.player.currentPlaylist.length === 0) {
            this.showToast('Please add songs to save', 'error');
            return;
        }

        // Save to localStorage
        const playlistData = JSON.stringify(this.player.currentPlaylist);
        localStorage.setItem('savedPlaylist', playlistData);
        
        this.showToast(`Playlist saved! (${this.player.currentPlaylist.length} songs)`, 'success');
    }

    loadSavedPlaylist() {
        const savedData = localStorage.getItem('savedPlaylist');
        if (savedData) {
            try {
                const playlist = JSON.parse(savedData);
                this.player.currentPlaylist = playlist;
                this.renderPlaylist();
                this.updateCounts();
                this.showToast(`Loaded ${playlist.length} songs`, 'success');
            } catch (e) {
                this.showToast('Error loading saved playlist', 'error');
            }
        }
    }

    searchMusic() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        
        // Apply category filter first
        let filtered = this.currentCategory === 'all' 
            ? [...musicLibrary] 
            : musicLibrary.filter(song => song.category === this.currentCategory);

        // Apply search filter
        if (query) {
            filtered = filtered.filter(song => 
                song.title.toLowerCase().includes(query) || 
                song.artist.toLowerCase().includes(query)
            );
        }

        this.filteredLibrary = filtered;
        this.renderMusicLibrary();
        this.updateCounts();
    }

    filterByCategory(e) {
        const category = e.target.dataset.category;
        this.currentCategory = category;
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        // Filter library
        if (category === 'all') {
            this.filteredLibrary = [...musicLibrary];
        } else {
            this.filteredLibrary = musicLibrary.filter(song => song.category === category);
        }

        // Apply search if active
        const query = document.getElementById('searchInput').value.toLowerCase();
        if (query) {
            this.filteredLibrary = this.filteredLibrary.filter(song => 
                song.title.toLowerCase().includes(query) || 
                song.artist.toLowerCase().includes(query)
            );
        }

        this.renderMusicLibrary();
        this.updateCounts();
    }

    updateCounts() {
        document.getElementById('songCount').textContent = 
            `${this.filteredLibrary.length} song${this.filteredLibrary.length !== 1 ? 's' : ''}`;
        document.getElementById('playlistCount').textContent = 
            `${this.player.currentPlaylist.length} song${this.player.currentPlaylist.length !== 1 ? 's' : ''}`;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? '✅' : 
                     type === 'error' ? '❌' : 
                     type === 'warning' ? '⚠️' : 'ℹ️';

        toast.innerHTML = `
            <span style="font-size: 1.25rem;">${icon}</span>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize app when DOM is ready
const app = new MusicApp();

// Make app globally accessible
window.app = app;
