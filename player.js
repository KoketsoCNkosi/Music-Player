class MusicPlayer {
  constructor() {
    this.currentSong     = null;
    this.isPlaying       = false;
    this.currentPlaylist = [];
    this.currentIndex    = 0;
    this.isRepeat        = false;
    this.isShuffle       = false;
    this.isMuted         = false;
    this.previousVolume  = 80;
    this.previewCache    = {};   // songId -> preview URL cache
    this.loading         = false;

    this.audio = document.getElementById('audioEl');
    this.init();
  }

  init() {
    this.audio.volume = 0.8;
    this.audio.addEventListener('timeupdate',     () => this.onTimeUpdate());
    this.audio.addEventListener('ended',          () => this.onEnded());
    this.audio.addEventListener('loadedmetadata', () => this.onMetadata());
    this.audio.addEventListener('play',           () => this.onPlay());
    this.audio.addEventListener('pause',          () => this.onPause());
    this.audio.addEventListener('error',          () => this.onAudioError());

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space')                            { e.preventDefault(); this.togglePlay(); }
      if (e.shiftKey && e.code === 'ArrowRight')         { e.preventDefault(); this.next(); }
      if (e.shiftKey && e.code === 'ArrowLeft')          { e.preventDefault(); this.prev(); }
      if (!e.shiftKey && e.code === 'ArrowRight' && this.audio.duration) { e.preventDefault(); this.audio.currentTime = Math.min(this.audio.currentTime + 5, this.audio.duration); }
      if (!e.shiftKey && e.code === 'ArrowLeft'  && this.audio.duration) { e.preventDefault(); this.audio.currentTime = Math.max(this.audio.currentTime - 5, 0); }
      if (e.code === 'KeyM') { e.preventDefault(); this.toggleMute(); }
    });
  }

  // ── DEEZER PREVIEW RESOLVER ──────────────────────────────────────
  async resolvePreview(song) {
    // Return cached URL immediately
    if (this.previewCache[song.id]) return this.previewCache[song.id];

    const query = encodeURIComponent(song.deezerQuery || `${song.artist} ${song.title}`);
    const url   = `https://api.deezer.com/search?q=${query}&limit=5&output=jsonp`;

    // Deezer blocks direct fetch due to CORS on some hosts — use JSONP approach
    return new Promise((resolve) => {
      const cbName = `dz_${song.id}_${Date.now()}`;
      const timeout = setTimeout(() => {
        cleanup();
        resolve(null);
      }, 8000);

      function cleanup() {
        clearTimeout(timeout);
        delete window[cbName];
        const s = document.getElementById(cbName);
        if (s) s.remove();
      }

      window[cbName] = (data) => {
        cleanup();
        const tracks = data?.data || [];
        // Find best match — prefer exact title match
        const match = tracks.find(t =>
          t.title.toLowerCase().includes(song.title.toLowerCase()) ||
          song.title.toLowerCase().includes(t.title.toLowerCase())
        ) || tracks[0];

        const preview = match?.preview || null;
        if (preview) this.previewCache[song.id] = preview;
        resolve(preview);
      };

      const script = document.createElement('script');
      script.id  = cbName;
      script.src = `https://api.deezer.com/search?q=${query}&limit=5&output=jsonp&callback=${cbName}`;
      script.onerror = () => { cleanup(); resolve(null); };
      document.head.appendChild(script);
    });
  }

  // ── PLAY ─────────────────────────────────────────────────────────
  async play(song, fromPlaylist = false) {
    if (this.loading) return;
    this.loading = true;
    this.currentSong = song;

    if (fromPlaylist) {
      this.currentIndex = this.currentPlaylist.findIndex(s => s.id === song.id);
    }

    // Show loading state immediately
    this.setDiscLoading(true);
    this.updateNowPlaying();
    window.app?.onSongChange(song);

    // Resolve the real preview URL
    const previewUrl = await this.resolvePreview(song);
    this.loading = false;
    this.setDiscLoading(false);

    if (!previewUrl) {
      window.app?.toast(`No preview available for "${song.title}"`, 'error');
      return;
    }

    this.audio.src = previewUrl;
    this.audio.play().catch(() => {
      window.app?.toast('Playback blocked — tap play to start', 'error');
    });
  }

  togglePlay() {
    if (!this.currentSong) return;
    if (this.loading)      return;
    this.isPlaying ? this.audio.pause() : this.audio.play().catch(() => {});
  }

  next() {
    if (!this.currentPlaylist.length) return;
    if (this.isShuffle) {
      this.currentIndex = Math.floor(Math.random() * this.currentPlaylist.length);
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.currentPlaylist.length;
    }
    this.play(this.currentPlaylist[this.currentIndex], true);
  }

  prev() {
    if (!this.currentPlaylist.length) return;
    if (this.audio.currentTime > 3) { this.audio.currentTime = 0; return; }
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.currentPlaylist.length - 1;
    this.play(this.currentPlaylist[this.currentIndex], true);
  }

  seekTo(pct) {
    if (this.audio.duration) this.audio.currentTime = pct * this.audio.duration;
  }

  setVolume(v) {
    this.audio.volume = v;
    if (v > 0) this.isMuted = false;
    this.updateVolumeUI(v);
  }

  toggleMute() {
    if (this.isMuted) {
      this.audio.volume  = this.previousVolume / 100;
      this.isMuted = false;
    } else {
      this.previousVolume = this.audio.volume * 100;
      this.audio.volume   = 0;
      this.isMuted = true;
    }
    this.updateVolumeUI(this.audio.volume);
  }

  toggleRepeat()  { this.isRepeat  = !this.isRepeat;  return this.isRepeat; }
  toggleShuffle() { this.isShuffle = !this.isShuffle; return this.isShuffle; }

  shuffleArray() {
    const curId = this.currentSong?.id;
    for (let i = this.currentPlaylist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentPlaylist[i], this.currentPlaylist[j]] = [this.currentPlaylist[j], this.currentPlaylist[i]];
    }
    if (curId) this.currentIndex = this.currentPlaylist.findIndex(s => s.id === curId);
  }

  // ── AUDIO EVENTS ─────────────────────────────────────────────────
  onPlay() {
    this.isPlaying = true;
    document.getElementById('playIcon').innerHTML = pauseSVG();
    document.getElementById('discArt')?.classList.add('spinning');
  }

  onPause() {
    this.isPlaying = false;
    document.getElementById('playIcon').innerHTML = playSVG();
    document.getElementById('discArt')?.classList.remove('spinning');
  }

  onTimeUpdate() {
    const pct  = this.audio.duration ? (this.audio.currentTime / this.audio.duration) * 100 : 0;
    const fill = document.getElementById('seekFill');
    const dot  = document.getElementById('seekDot');
    if (fill) fill.style.width = pct + '%';
    if (dot)  dot.style.left  = pct + '%';
    const ct = document.getElementById('currentTime');
    const td = document.getElementById('totalTime');
    if (ct) ct.textContent = fmt(this.audio.currentTime);
    if (td && this.audio.duration) td.textContent = fmt(this.audio.duration);
  }

  onMetadata() {
    const td = document.getElementById('totalTime');
    if (td) td.textContent = fmt(this.audio.duration);
  }

  onEnded() {
    if (this.isRepeat) {
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
    } else if (this.currentPlaylist.length > 0) {
      this.next();
    } else {
      this.onPause();
    }
  }

  onAudioError() {
    window.app?.toast('Failed to load track', 'error');
    this.setDiscLoading(false);
  }

  setDiscLoading(on) {
    const disc = document.getElementById('discArt');
    if (!disc) return;
    if (on) {
      disc.classList.add('loading');
      disc.classList.remove('spinning');
    } else {
      disc.classList.remove('loading');
    }
  }

  updateNowPlaying() {
    const s = this.currentSong;
    if (!s) return;
    const el = (id) => document.getElementById(id);
    if (el('npTitle'))    el('npTitle').textContent    = s.title;
    if (el('npArtist'))   el('npArtist').textContent   = s.artist;
    if (el('npAlbum'))    el('npAlbum').textContent    = s.album;
    if (el('npYear'))     el('npYear').textContent     = s.year;
    if (el('miniTitle'))  el('miniTitle').textContent  = s.title;
    if (el('miniArtist')) el('miniArtist').textContent = s.artist;
    document.documentElement.style.setProperty('--track-accent', s.accent || '#fff');
  }

  updateVolumeUI(v) {
    const slider = document.getElementById('volSlider');
    const icon   = document.getElementById('volIcon');
    if (slider) slider.value = Math.round(v * 100);
    if (icon)   icon.innerHTML = v === 0 ? muteSVG() : v < 0.5 ? volLowSVG() : volHighSVG();
  }
}

// ── SVG icons ──────────────────────────────────────────────────────
const playSVG   = () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const pauseSVG  = () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
const muteSVG   = () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97V10l2.45 2.45c.03-.15.05-.31.05-.45zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zm-14.27-9L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 20L19 21.27 20.27 20 4.73 4 3.46 2.73zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
const volLowSVG = () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>`;
const volHighSVG= () => `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

const fmt = (s) => {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

window.MusicPlayer = MusicPlayer;
