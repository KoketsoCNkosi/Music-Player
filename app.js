class MusicApp {
  constructor() {
    this.player          = null;
    this.view            = 'library'; // library | queue | search
    this.filtered        = [];
    this.activeGenre     = 'all';
    this.searchQuery     = '';
    this.likedSongs      = new Set(JSON.parse(localStorage.getItem('liked') || '[]'));
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.player   = new MusicPlayer();
    this.filtered = [...musicLibrary];
    this.renderLibrary();
    this.renderQueue();
    this.bindUI();
    this.updateCounts();
    this.animateIn();
  }

  bindUI() {
    // Nav tabs
    document.querySelectorAll('[data-view]').forEach(btn =>
      btn.addEventListener('click', (e) => this.switchView(e.currentTarget.dataset.view)));

    // Genre pills
    document.querySelectorAll('[data-genre]').forEach(btn =>
      btn.addEventListener('click', (e) => this.filterGenre(e.currentTarget.dataset.genre)));

    // Search
    const si = document.getElementById('searchInput');
    if (si) si.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.applyFilters();
      if (this.searchQuery) this.switchView('search');
    });

    // Player controls
    document.getElementById('playBtn')?.addEventListener('click', () => this.player.togglePlay());
    document.getElementById('nextBtn')?.addEventListener('click', () => this.player.next());
    document.getElementById('prevBtn')?.addEventListener('click', () => this.player.prev());

    // Seek bar
    const seekBar = document.getElementById('seekBar');
    if (seekBar) {
      seekBar.addEventListener('click', (e) => {
        const rect = seekBar.getBoundingClientRect();
        this.player.seekTo((e.clientX - rect.left) / rect.width);
      });
      let dragging = false;
      seekBar.addEventListener('mousedown', () => dragging = true);
      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const rect = seekBar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.player.seekTo(pct);
      });
      document.addEventListener('mouseup', () => dragging = false);
    }

    // Volume
    const volSlider = document.getElementById('volSlider');
    if (volSlider) volSlider.addEventListener('input', (e) => this.player.setVolume(e.target.value / 100));
    document.getElementById('volIcon')?.addEventListener('click', () => this.player.toggleMute());

    // Queue controls
    document.getElementById('shuffleQueueBtn')?.addEventListener('click', () => {
      this.player.shuffleArray();
      this.renderQueue();
      this.toast('Queue shuffled', 'success');
    });
    document.getElementById('clearQueueBtn')?.addEventListener('click', () => {
      if (!this.player.currentPlaylist.length) return;
      this.player.currentPlaylist = [];
      this.player.currentIndex = 0;
      this.renderQueue();
      this.renderLibrary();
      this.updateCounts();
      this.toast('Queue cleared', 'info');
    });
    document.getElementById('repeatBtn')?.addEventListener('click', (e) => {
      const on = this.player.toggleRepeat();
      e.currentTarget.classList.toggle('active', on);
      this.toast(on ? 'Repeat on' : 'Repeat off', 'info');
    });
    document.getElementById('shuffleBtn')?.addEventListener('click', (e) => {
      const on = this.player.toggleShuffle();
      e.currentTarget.classList.toggle('active', on);
      this.toast(on ? 'Shuffle on' : 'Shuffle off', 'info');
    });

    // Like button
    document.getElementById('likeBtn')?.addEventListener('click', () => this.toggleLike());
  }

  switchView(v) {
    this.view = v;
    document.querySelectorAll('[data-view]').forEach(b =>
      b.classList.toggle('active', b.dataset.view === v));
    document.querySelectorAll('.view-panel').forEach(p =>
      p.classList.toggle('active', p.id === `view-${v}`));
  }

  filterGenre(g) {
    this.activeGenre = g;
    document.querySelectorAll('[data-genre]').forEach(b =>
      b.classList.toggle('active', b.dataset.genre === g));
    this.applyFilters();
  }

  applyFilters() {
    let list = [...musicLibrary];
    if (this.activeGenre !== 'all') list = list.filter(s => s.genre === this.activeGenre);
    if (this.searchQuery) list = list.filter(s =>
      s.title.toLowerCase().includes(this.searchQuery) ||
      s.artist.toLowerCase().includes(this.searchQuery) ||
      s.album.toLowerCase().includes(this.searchQuery));
    this.filtered = list;
    this.renderLibrary();
    if (this.view === 'search') this.renderSearch();
    this.updateCounts();
  }

  renderLibrary() {
    const container = document.getElementById('songList');
    if (!container) return;
    if (!this.filtered.length) {
      container.innerHTML = `<div class="empty-state"><span>🎵</span><p>No tracks found</p></div>`;
      return;
    }
    container.innerHTML = this.filtered.map((s, i) => this.songRowHTML(s, i)).join('');
    container.querySelectorAll('.song-row').forEach(row => {
      const id = +row.dataset.id;
      row.querySelector('.row-play')?.addEventListener('click', (e) => { e.stopPropagation(); this.playSong(id); });
      row.querySelector('.row-add')?.addEventListener('click', (e)  => { e.stopPropagation(); this.addToQueue(id); });
      row.querySelector('.row-like')?.addEventListener('click', (e) => { e.stopPropagation(); this.toggleLikeSong(id, row); });
      row.addEventListener('dblclick', () => this.playSong(id));
    });
  }

  renderSearch() {
    const container = document.getElementById('searchResults');
    if (!container) return;
    container.innerHTML = this.filtered.length
      ? `<p class="search-label">${this.filtered.length} result${this.filtered.length !== 1 ? 's' : ''} for "<em>${this.searchQuery}</em>"</p>` +
        this.filtered.map((s, i) => this.songRowHTML(s, i)).join('')
      : `<div class="empty-state"><span>🔍</span><p>No results for "${this.searchQuery}"</p></div>`;
    container.querySelectorAll('.song-row').forEach(row => {
      const id = +row.dataset.id;
      row.querySelector('.row-play')?.addEventListener('click', (e) => { e.stopPropagation(); this.playSong(id); });
      row.querySelector('.row-add')?.addEventListener('click',  (e) => { e.stopPropagation(); this.addToQueue(id); });
      row.querySelector('.row-like')?.addEventListener('click', (e) => { e.stopPropagation(); this.toggleLikeSong(id, row); });
    });
  }

  renderQueue() {
    const container = document.getElementById('queueList');
    if (!container) return;
    const queue = this.player.currentPlaylist;
    if (!queue.length) {
      container.innerHTML = `<div class="empty-state"><span>🎶</span><p>Your queue is empty</p><small>Add tracks from the library</small></div>`;
      return;
    }
    container.innerHTML = queue.map((s, i) => `
      <div class="queue-item ${this.player.currentSong?.id === s.id ? 'playing' : ''}" data-id="${s.id}" data-idx="${i}">
        <div class="queue-num">${this.player.currentSong?.id === s.id ? '<span class="q-wave">▶</span>' : i + 1}</div>
        <div class="queue-info">
          <div class="qi-title">${s.title}</div>
          <div class="qi-artist">${s.artist}</div>
        </div>
        <div class="qi-dur">${s.duration}</div>
        <button class="qi-remove" data-idx="${i}">✕</button>
      </div>`).join('');
    container.querySelectorAll('.queue-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('qi-remove')) return;
        const idx = +item.dataset.idx;
        this.player.currentIndex = idx;
        this.player.play(this.player.currentPlaylist[idx], true);
        this.renderQueue();
        this.renderLibrary();
      });
    });
    container.querySelectorAll('.qi-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = +btn.dataset.idx;
        this.removeFromQueue(idx);
      });
    });
  }

  songRowHTML(s, i) {
    const inQueue = this.player.currentPlaylist.some(q => q.id === s.id);
    const isPlaying = this.player.currentSong?.id === s.id;
    const isLiked   = this.likedSongs.has(s.id);
    return `
      <div class="song-row ${isPlaying ? 'now-playing' : ''}" data-id="${s.id}">
        <div class="row-num">${isPlaying ? '<span class="playing-dot"></span>' : i + 1}</div>
        <div class="row-disc" style="--disc-accent:${s.accent}">
          <button class="row-play" title="Play">${isPlaying && this.player.isPlaying ? pauseSVG() : playSVG()}</button>
        </div>
        <div class="row-meta">
          <div class="row-title">${s.title}</div>
          <div class="row-artist">${s.artist}</div>
        </div>
        <div class="row-album hide-mobile">${s.album}</div>
        <div class="row-year hide-mobile">${s.year}</div>
        <div class="row-actions">
          <button class="row-like ${isLiked ? 'liked' : ''}" title="Like">${isLiked ? '♥' : '♡'}</button>
          <button class="row-add ${inQueue ? 'in-queue' : ''}" title="${inQueue ? 'In queue' : 'Add to queue'}">${inQueue ? '✓' : '+'}</button>
        </div>
        <div class="row-dur">${s.duration}</div>
      </div>`;
  }

  playSong(id) {
    const song = musicLibrary.find(s => s.id === id);
    if (!song) return;
    // If not in queue, add it first
    if (!this.player.currentPlaylist.find(s => s.id === id)) {
      this.player.currentPlaylist.push(song);
    }
    this.player.play(song, true);
    this.renderLibrary();
    this.renderQueue();
    this.updateCounts();
  }

  addToQueue(id) {
    const song = musicLibrary.find(s => s.id === id);
    if (!song) return;
    if (this.player.currentPlaylist.find(s => s.id === id)) {
      this.toast(`Already in queue`, 'info'); return;
    }
    this.player.currentPlaylist.push(song);
    this.renderLibrary();
    this.renderQueue();
    this.updateCounts();
    this.toast(`Added to queue`, 'success');
  }

  removeFromQueue(idx) {
    const song = this.player.currentPlaylist[idx];
    this.player.currentPlaylist.splice(idx, 1);
    if (this.player.currentIndex >= idx && this.player.currentIndex > 0) this.player.currentIndex--;
    this.renderQueue();
    this.renderLibrary();
    this.updateCounts();
    this.toast(`Removed from queue`, 'info');
  }

  toggleLike() {
    const song = this.player.currentSong;
    if (!song) return;
    this.toggleLikeSong(song.id);
    const btn = document.getElementById('likeBtn');
    if (btn) btn.classList.toggle('liked', this.likedSongs.has(song.id));
  }

  toggleLikeSong(id, row) {
    if (this.likedSongs.has(id)) {
      this.likedSongs.delete(id);
    } else {
      this.likedSongs.add(id);
      this.spawnHeart();
    }
    localStorage.setItem('liked', JSON.stringify([...this.likedSongs]));
    if (row) {
      const btn = row.querySelector('.row-like');
      if (btn) { btn.classList.toggle('liked', this.likedSongs.has(id)); btn.textContent = this.likedSongs.has(id) ? '♥' : '♡'; }
    }
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn && this.player.currentSong?.id === id) likeBtn.classList.toggle('liked', this.likedSongs.has(id));
  }

  onSongChange(song) {
    // Update like button state
    const btn = document.getElementById('likeBtn');
    if (btn) btn.classList.toggle('liked', this.likedSongs.has(song.id));
    // Update disc bg glow
    document.body.style.setProperty('--track-accent', song.accent);
    this.renderLibrary();
    this.renderQueue();
  }

  updateCounts() {
    const qc = document.getElementById('queueCount');
    if (qc) qc.textContent = this.player.currentPlaylist.length || '';
  }

  animateIn() {
    document.querySelectorAll('.song-row').forEach((row, i) => {
      row.style.animationDelay = `${i * 30}ms`;
      row.classList.add('row-enter');
    });
  }

  spawnHeart() {
    const h = document.createElement('div');
    h.className = 'heart-burst'; h.textContent = '♥';
    const disc = document.getElementById('discArt');
    if (disc) { disc.appendChild(h); setTimeout(() => h.remove(), 800); }
  }

  toast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    container.appendChild(t);
    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 2500);
  }
}

const app = new MusicApp();
window.app = app;
