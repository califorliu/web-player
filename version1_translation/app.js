// Music Player App
class MusicPlayer {
    constructor() {
        this.playlist = [];
        this.currentIndex = 0;
        this.currentView = 'large'; // 'mini' or 'large'
        this.lyrics = {};
        this.currentLyricIndex = -1;
        
        // Elements
        this.miniPlayer = document.getElementById('miniPlayer');
        this.largePlayer = document.getElementById('largePlayer');
        this.viewToggle = document.getElementById('viewToggle');
        
        // Mini player elements
        this.miniAudio = document.getElementById('mini-audio');
        this.miniTitle = document.getElementById('mini-title');
        this.miniCover = document.getElementById('mini-cover');
        this.miniProgress = document.getElementById('mini-progress');
        this.miniProgressContainer = document.getElementById('mini-progress-container');
        this.miniPlayBtn = document.getElementById('mini-play');
        this.miniPrevBtn = document.getElementById('mini-prev');
        this.miniNextBtn = document.getElementById('mini-next');
        this.musicContainer = document.getElementById('music-container');
        
        // Large player elements
        this.largeAudio = document.getElementById('large-audio');
        this.largeCover = document.getElementById('large-cover');
        this.largeTitle = document.getElementById('large-title');
        this.largeArtist = document.getElementById('large-artist');
        this.copyrightLink = document.getElementById('copyright-link');
        this.seekbar = document.querySelector('.seekbar');
        this.currentTime = document.querySelector('.current-time');
        this.duration = document.querySelector('.duration');
        this.playBtn = document.querySelector('.play');
        this.largePrevBtn = document.querySelector('.prev-btn');
        this.largeNextBtn = document.querySelector('.next-btn');
        this.volumeRange = document.querySelector('.volume-range');
        this.volumeBox = document.querySelector('.volume-box');
        this.shell = document.getElementById('shell');

        this.playlistToggle = document.querySelector('.playlist-toggle');
        this.lyricsToggle = document.querySelector('.lyrics-toggle');
        
        // Panels
        this.playlistPanel = document.getElementById('playlistPanel');
        this.lyricsPanel = document.getElementById('lyricsPanel');
        this.playlistItems = document.getElementById('playlistItems');
        this.lyricsContent = document.getElementById('lyricsContent');
        
        this.init();
    }
    
    async init() {
        // Load playlist from JSON
        await this.loadPlaylist();
        
        // Initialize view
        this.switchView('large');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load first song
        if (this.playlist.length > 0) {
            this.loadSong(0);
            player.playCurrentSong();
        }
    }
    
    async loadPlaylist() {
        try {
            // Support different playlists via URL parameter
            // e.g., index.html?playlist=myplaylist will load ./music/myplaylist.json
            const urlParams = new URLSearchParams(window.location.search);
            const playlistParam = urlParams.get('playlist');
            const playlistPath = playlistParam ? `./music/${playlistParam}.json` : './music/playlist.json';
            
            const response = await fetch(playlistPath);
            this.playlist = await response.json();
            this.renderPlaylist();
        } catch (error) {
            console.error('Error loading playlist:', error);
            // Fallback to default playlist if JSON fails
            this.playlist = [
                {
                    "src": "./music/往欄印.opus",
                    "title": "往欄印",
                    "artist": "MyGO!!!!!",
                    "cover": "./music/往欄印.jpg",
                    "lrc": "./music/往欄印.lrc",
                    "copyrightUrl": "https://bmu.lnk.to/MyGO7th_SGwe",
                    "duration": 298.15
                }
            ];
            this.renderPlaylist();
        }
    }
    
    renderPlaylist() {
        this.playlistItems.innerHTML = '';
        this.playlist.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = `playlist-item ${index === this.currentIndex ? 'active' : ''}`;
            item.innerHTML = `
                <div class="item-title">${song.title}</div>
                <div class="item-artist">${song.artist}</div>
            `;
            item.addEventListener('click', () => {
                this.loadSong(index);
                this.playBtn.className = 'play';
                this.playBtn.innerHTML = '<i class="material-icons">play_arrow</i>';
            });
            this.playlistItems.appendChild(item);
        });
    }
    
    async loadSong(index, autoPlay = false) {
        this.currentIndex = index;
        const song = this.playlist[index];
        
        // Update both players
        this.miniTitle.textContent = song.title;
        this.miniCover.src = song.cover;
        this.miniAudio.src = song.src;
        
        this.largeTitle.textContent = song.title;
        this.largeArtist.textContent = song.artist;
        this.largeCover.src = song.cover;
        this.largeAudio.src = song.src;
        
        // Update copyright link
        if (song.copyrightUrl) {
            this.copyrightLink.href = song.copyrightUrl;
            this.copyrightLink.style.display = 'inline-flex';
        } else {
            this.copyrightLink.style.display = 'none';
        }
        
        // If duration is in playlist JSON (pre-extracted), use it
        if (song.duration) {
            this.seekbar.max = song.duration;
            const ds = Math.floor(song.duration % 60);
            const dm = Math.floor((song.duration / 60) % 60);
            this.duration.textContent = `${dm}:${ds.toString().padStart(2, '0')}`;
        } else {
            // Reset duration display to wait for metadata
            this.duration.textContent = '0:00';
        }
        
        // Load lyrics
        if (song.lrc) {
            await this.loadLyrics(song.lrc);
        } else {
            this.lyricsContent.innerHTML = '<p class="no-lyrics">No lyrics available</p>';
        }
        
        // Update playlist highlighting
        this.renderPlaylist();
        
        // Sync volume
        this.miniAudio.volume = this.volumeRange.value / 100;
        this.largeAudio.volume = this.volumeRange.value / 100;
        
        // Auto play if requested (for prev/next)
        if (autoPlay) {
            // Wait for audio to be ready
            const activeAudio = this.currentView === 'mini' ? this.miniAudio : this.largeAudio;
            activeAudio.addEventListener('loadedmetadata', () => {
                this.playCurrentSong();
            }, { once: true });
        }
    }
    
    playCurrentSong() {
        if (this.currentView === 'mini') {
            this.miniAudio.play();
            this.musicContainer.classList.add('play');
            this.miniPlayBtn.querySelector('i.fas').classList.remove('fa-play');
            this.miniPlayBtn.querySelector('i.fas').classList.add('fa-pause');
        } else {
            this.largeAudio.play();
            this.playBtn.className = 'pause';
            this.playBtn.innerHTML = '<i class="material-icons">pause</i>';
        }
    }
    
    async loadLyrics(lrcPath) {
        try {
            const response = await fetch(lrcPath);
            const lrcText = await response.text();
            this.parseLyrics(lrcText);
        } catch (error) {
            console.error('Error loading lyrics:', error);
            this.lyricsContent.innerHTML = '<p class="no-lyrics">Lyrics not found</p>';
        }
    }
    
    parseLyrics(lrcText) {
        const lines = lrcText.split('\n');
        this.lyrics = {};
        let lyricsHTML = '';
        
        lines.forEach(line => {
            const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3]);
                const text = match[4].trim();
                const time = minutes * 60 + seconds + milliseconds / 1000;
                
                this.lyrics[time] = text;
                lyricsHTML += `<div class="lyrics-line" data-time="${time}">${text || '♪'}</div>`;
            }
        });
        
        if (lyricsHTML) {
            this.lyricsContent.innerHTML = lyricsHTML;
        } else {
            this.lyricsContent.innerHTML = '<p class="no-lyrics">No lyrics available</p>';
        }
    }
    
    updateLyrics(currentTime) {
        const lyricLines = this.lyricsContent.querySelectorAll('.lyrics-line');
        let activeIndex = -1;
        
        lyricLines.forEach((line, index) => {
            const time = parseFloat(line.dataset.time);
            if (currentTime >= time) {
                activeIndex = index;
            }
        });
        
        if (activeIndex !== this.currentLyricIndex) {
            lyricLines.forEach(line => line.classList.remove('active'));
            if (activeIndex >= 0) {
                lyricLines[activeIndex].classList.add('active');
                // Auto scroll
                lyricLines[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            this.currentLyricIndex = activeIndex;
        }
    }
    
    setupEventListeners() {
        // View switcher
        this.viewToggle.addEventListener('click', () => {
            this.switchView(this.currentView === 'mini' ? 'large' : 'mini');
        });
        
        // Mini player controls
        this.miniPlayBtn.addEventListener('click', () => this.togglePlay('mini'));
        this.miniPrevBtn.addEventListener('click', () => this.prevSong());
        this.miniNextBtn.addEventListener('click', () => this.nextSong());
        this.miniProgressContainer.addEventListener('click', (e) => this.setProgress(e, 'mini'));
        this.miniAudio.addEventListener('timeupdate', () => this.updateProgress('mini'));
        this.miniAudio.addEventListener('ended', () => this.nextSong());
        // Use loadedmetadata for better Opus support
        
        // Large player controls
        this.playBtn.addEventListener('click', () => this.togglePlay('large'));
        this.largePrevBtn.addEventListener('click', () => this.prevSong());
        this.largeNextBtn.addEventListener('click', () => this.nextSong());
        this.seekbar.addEventListener('input', () => this.handleSeekBar());
        this.seekbar.addEventListener('change', () => this.handleSeekBar()); // For dragging
        this.largeAudio.addEventListener('timeupdate', () => {
            this.updateProgress('large');
            this.updateLyrics(this.largeAudio.currentTime);
        });
        this.largeAudio.addEventListener('ended', () => this.nextSong());
        // Use loadedmetadata for better Opus support
        this.largeAudio.addEventListener('loadedmetadata', () => {
            // Only update if not already set from JSON
            const song = this.playlist[this.currentIndex];
            if (!song.duration && this.largeAudio.duration && isFinite(this.largeAudio.duration)) {
                this.seekbar.max = this.largeAudio.duration;
                const ds = Math.floor(this.largeAudio.duration % 60);
                const dm = Math.floor((this.largeAudio.duration / 60) % 60);
                this.duration.textContent = `${dm}:${ds.toString().padStart(2, '0')}`;
            }
        });
        
        // Volume controls
        this.volumeRange.addEventListener('input', () => {
            const volume = this.volumeRange.value / 100;
            this.miniAudio.volume = volume;
            this.largeAudio.volume = volume;
        });
        
        document.querySelector('.volume-down').addEventListener('click', () => {
            this.volumeRange.value = Math.max(0, Number(this.volumeRange.value) - 20);
            const volume = this.volumeRange.value / 100;
            this.miniAudio.volume = volume;
            this.largeAudio.volume = volume;
        });
        
        document.querySelector('.volume-up').addEventListener('click', () => {
            this.volumeRange.value = Math.min(100, Number(this.volumeRange.value) + 20);
            const volume = this.volumeRange.value / 100;
            this.miniAudio.volume = volume;
            this.largeAudio.volume = volume;
        });
        
        // Large player buttons
        document.querySelector('.volume').addEventListener('click', (e) => {
            this.volumeBox.classList.toggle('active');
            e.target.classList.toggle('active');
        });
        
        document.querySelector('.repeat').addEventListener('click', (e) => {
            this.miniAudio.loop = !this.miniAudio.loop;
            this.largeAudio.loop = !this.largeAudio.loop;
            e.target.classList.toggle('active');
        });
        
        this.playlistToggle.addEventListener('click', (e) => {
            this.togglePanel('playlist');
            e.target.classList.toggle('active');
            this.lyricsToggle.classList.remove('active');
        });
        
        this.lyricsToggle.addEventListener('click', (e) => {
            this.togglePanel('lyrics');
            e.target.classList.toggle('active');
            this.playlistToggle.classList.remove('active');
        });
        
        // Close panel buttons
        document.querySelectorAll('.close-panel').forEach(btn => {
            btn.addEventListener('click', () => {
                this.playlistPanel.classList.remove('active');
                this.lyricsPanel.classList.remove('active');
                this.shell.classList.remove('shift-left', 'shift-right');
                this.playlistToggle.classList.remove('active');
                this.lyricsToggle.classList.remove('active');
            });
        });
    }
    
    switchView(view) {
        // Get current state from the active player
        const fromAudio = this.currentView === 'mini' ? this.miniAudio : this.largeAudio;
        const toAudio = view === 'mini' ? this.miniAudio : this.largeAudio;
        const isPlaying = !fromAudio.paused;
        const currentTime = fromAudio.currentTime;
        
        this.currentView = view;
        
        if (view === 'mini') {
            this.largePlayer.classList.remove('active');
            this.miniPlayer.classList.add('active');
            
            // Sync to mini player without interruption
            this.miniAudio.currentTime = currentTime;
            if (isPlaying) {
                const playPromise = this.miniAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.largeAudio.pause();
                    }).catch(e => console.log('Play interrupted:', e));
                }
            } else {
                this.largeAudio.pause();
            }
            
            // Update UI
            if (isPlaying) {
                this.musicContainer.classList.add('play');
                this.miniPlayBtn.querySelector('i.fas').classList.remove('fa-play');
                this.miniPlayBtn.querySelector('i.fas').classList.add('fa-pause');
            }
        } else {
            this.miniPlayer.classList.remove('active');
            this.largePlayer.classList.add('active');
            
            // Sync to large player without interruption
            this.largeAudio.currentTime = currentTime;
            if (isPlaying) {
                const playPromise = this.largeAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.miniAudio.pause();
                    }).catch(e => console.log('Play interrupted:', e));
                }
            } else {
                this.miniAudio.pause();
            }
            
            // Update UI
            if (isPlaying) {
                this.playBtn.className = 'pause';
                this.playBtn.innerHTML = '<i class="material-icons">pause</i>';
            }
        }
    }
    
    togglePlay(player) {
        if (player === 'mini') {
            if (this.miniAudio.paused) {
                this.miniAudio.play();
                this.musicContainer.classList.add('play');
                this.miniPlayBtn.querySelector('i.fas').classList.remove('fa-play');
                this.miniPlayBtn.querySelector('i.fas').classList.add('fa-pause');
            } else {
                this.miniAudio.pause();
                this.musicContainer.classList.remove('play');
                this.miniPlayBtn.querySelector('i.fas').classList.add('fa-play');
                this.miniPlayBtn.querySelector('i.fas').classList.remove('fa-pause');
            }
        } else {
            if (this.largeAudio.paused) {
                this.largeAudio.play();
                this.playBtn.className = 'pause';
                this.playBtn.innerHTML = '<i class="material-icons">pause</i>';
            } else {
                this.largeAudio.pause();
                this.playBtn.className = 'play';
                this.playBtn.innerHTML = '<i class="material-icons">play_arrow</i>';
            }
        }
    }
    
    prevSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.playlist.length - 1;
        }
        this.loadSong(this.currentIndex, true);
    }
    
    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.playlist.length) {
            this.currentIndex = 0;
        }
        this.loadSong(this.currentIndex, true);
    }
    
    updateProgress(player) {
        if (player === 'mini') {
            const song = this.playlist[this.currentIndex];
            if (!song.duration && this.largeAudio.duration && isFinite(this.largeAudio.duration)) {
                const { duration, currentTime } = this.miniAudio;
                const progressPercent = (currentTime / duration) * 100;
                this.miniProgress.style.width = `${progressPercent}%`;
            } else {
                const duration = song.duration;
                const currentTime = this.miniAudio.currentTime;
                const progressPercent = (currentTime / duration) * 100;
                this.miniProgress.style.width = `${progressPercent}%`;
            }
        } else {
            this.seekbar.value = this.largeAudio.currentTime;
            const cs = Math.floor(this.largeAudio.currentTime % 60);
            const cm = Math.floor((this.largeAudio.currentTime / 60) % 60);
            this.currentTime.textContent = `${cm}:${cs.toString().padStart(2, '0')}`;
        }
    }
    
    setProgress(e, player) {
        const song = this.playlist[this.currentIndex];
        const width = this.miniProgressContainer.clientWidth;
        const clickX = e.offsetX;
            if (!song.duration && this.largeAudio.duration && isFinite(this.largeAudio.duration)) {
                const duration = this.miniAudio.duration;
                this.miniAudio.currentTime = (clickX / width) * duration;
            } else {
                const duration = song.duration;
                this.miniAudio.currentTime = (clickX / width) * duration;
            }
    }
    
    handleSeekBar() {
        this.largeAudio.currentTime = this.seekbar.value;
    }
    
    togglePanel(panel) {
        if (panel === 'playlist') {
            const isActive = this.playlistPanel.classList.toggle('active');
            if (isActive) {
                this.lyricsPanel.classList.remove('active');
                this.shell.classList.remove('shift-left');
                this.shell.classList.add('shift-right');
            } else {
                this.shell.classList.remove('shift-right');
            }
        } else if (panel === 'lyrics') {
            const isActive = this.lyricsPanel.classList.toggle('active');
            if (isActive) {
                this.playlistPanel.classList.remove('active');
                this.shell.classList.remove('shift-right');
                this.shell.classList.add('shift-left');
            } else {
                this.shell.classList.remove('shift-left');
            }
        }
    }
}

// Initialize the player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const player = new MusicPlayer();
});
