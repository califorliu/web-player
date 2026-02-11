# Web Music Player

A beautiful, feature-rich web music player with dual viewing modes, playlist support, and synchronized lyrics.

## Features

### 🎵 Dual Player Modes
- **Mini Player**: Compact, minimalist design with rotating album art
- **Large Player**: Full-featured player with glassmorphism design
- **Seamless Switching**: Toggle between modes with synced playback state

### 📝 Lyrics Support
- Real-time synchronized lyrics display (LRC format)
- Auto-scrolling with highlighted current line
- Toggle panel to show/hide lyrics
- Expandable player interface

### 📋 Playlist Management
- Dynamic playlist from JSON file
- Click to play any song
- Visual indication of current track
- Toggle panel to show/hide playlist

### 🎛️ Player Controls
- Play/Pause
- Previous/Next track
- Seek bar with time display
- Volume control with increment/decrement buttons
- Repeat mode toggle
- Copyright link for each track

### 🎨 Beautiful UI
- Glassmorphism effects
- Smooth animations and transitions
- Responsive design
- Custom styled range sliders
- Rotating album art (mini player)

## File Structure

```
web-player/
├── index.html          # Main HTML file
├── styles.css          # All styles for both players
├── app.js             # Main JavaScript logic
├── extract_metadata.py # Python script to extract metadata (optional)
├── music/             # Music files directory
│   ├── playlist.json  # Playlist configuration
│   ├── *.opus         # Audio files
│   ├── *.lrc          # Lyrics files (same name as audio)
│   └── *.jpg          # Cover images (same name as audio)
└── README.md          # This file
```

## Setup

### 1. Basic Setup

1. Clone or download this repository
2. Place your music files in the `music/` folder
3. Create/edit `music/playlist.json` (see format below)
4. Open `index.html` in a web browser

### 2. Multiple Playlists (URL Parameter Support)

You can create multiple playlist JSON files and load them using URL parameters:

**Default playlist:**
```
index.html
```
This loads `music/playlist.json`

**Custom playlist:**
```
index.html?playlist=alternate
```
This loads `music/alternate.json`

**Example:**
- Create `music/myplaylist.json`
- Access it via `index.html?playlist=myplaylist`

This feature allows you to organize different collections of music and switch between them easily!

### 3. Playlist Configuration

Create a `music/playlist.json` file with the following format:

```json
[
  {
    "src": "./music/song-name.opus",
    "title": "Song Title",
    "artist": "Artist Name",
    "cover": "./music/song-name.jpg",
    "lrc": "./music/song-name.lrc",
    "copyrightUrl": "https://example.com/copyright-info",
    "duration": 245.5
  }
]
```

**Fields:**
- `src`: Path to audio file (relative to index.html)
- `title`: Song title
- `artist`: Artist name
- `cover`: Path to cover image
- `lrc`: Path to lyrics file (optional, leave as "" if no lyrics)
- `copyrightUrl`: Link to copyright/purchase page (optional)
- `duration`: Song duration in seconds (optional but recommended for Opus files)

### 4. Lyrics Format (LRC)

Create `.lrc` files with the same name as your audio files:

```
[00:12.50]First line of lyrics
[00:17.20]Second line of lyrics
[00:21.10]Third line of lyrics
```

Format: `[MM:SS.XX]Lyrics text`

### 5. Automated Metadata Extraction (Optional)

If you have many songs, use the Python script to automatically extract metadata:

**Requirements:**
```bash
pip install mutagen
```

**Usage:**
```bash
python extract_metadata.py
```

This will:
- Scan all audio files in `music/` folder
- **Load existing `playlist.json` to preserve manual entries (like copyrightUrl)**
- Extract title, artist, cover art, and **duration** from file tags
- Update `music/playlist.json` with latest metadata
- Create automatic backup: `music/playlist_backup_YYYYMMDDHHMMSS.json`
- Extract embedded album art to `.jpg` files

**Smart Library Management:**
- **Existing songs**: Copyright URLs and other manual data are preserved
- **New songs**: Added with empty copyrightUrl for you to fill in
- **Updated songs**: Metadata refreshed but copyrightUrl kept intact

**Note:** Duration extraction is especially important for Opus files which may not report duration correctly in browsers. The script now preserves your manually added copyright URLs while updating everything else!

## Supported Audio Formats

- **MP3** (.mp3)
- **Opus** (.opus)
- **Ogg Vorbis** (.ogg)
- **FLAC** (.flac)
- **M4A/AAC** (.m4a)
- **WAV** (.wav)

Browser support varies - MP3 and M4A have best compatibility.

## Usage

### Controls

**Mini Player:**
- Click play button to play/pause
- Use prev/next buttons to navigate
- Click progress bar to seek
- Album art rotates when playing

**Large Player:**
- Click central play button to play/pause
- Drag seekbar to navigate
- Click volume icon to show/hide volume control
- Click lyrics icon to show/hide lyrics panel
- Click playlist icon to show/hide playlist panel
- Click repeat icon to toggle loop mode
- Click copyright link to visit song's official page

**View Switcher:**
- Click "Switch View" button in top-right corner
- Playback state and position sync automatically

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

## Customization

### Colors
Edit `styles.css` to change color scheme:
- Background gradient: `body { background: ... }`
- Primary color: Search for `#667eea` and `#764ba2`
- Accent color: Search for `#ff3677`

### Fonts
Change font in `styles.css`:
```css
font-family: "Your Font", 'Lato', sans-serif;
```

### Player Size
Adjust in `styles.css`:
```css
.shell {
    width: 330px;  /* Change width */
    height: 580px; /* Change height */
}
```

## Serving the Player

### Local Development
Simply open `index.html` in a browser.

### Web Server
For best results, serve via HTTP server:

**Python:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server
```

**PHP:**
```bash
php -S localhost:8000
```

Then open `http://localhost:8000`

## Troubleshooting

### Music won't play
- Check that file paths in `playlist.json` are correct
- Ensure audio files are in correct format
- Check browser console for errors
- Verify files are accessible (check CORS if using different domains)

### Progress bar not working with Opus files
- The player now uses `loadedmetadata` event which provides better support for Opus files
- Make sure your browser supports Opus format (most modern browsers do)
- If issues persist, try converting to MP3 format

### Progress bar not draggable
- The seekbar now supports both `input` and `change` events for smooth dragging
- Click or drag the progress bar to seek to different positions

### Switching views interrupts playback
- The player now maintains playback state when switching between mini and large views
- Music should continue playing seamlessly when you switch views

### Lyrics not showing
- Ensure `.lrc` file has same name as audio file
- Check LRC format is correct (`[MM:SS.XX]Text`)
- Verify path in `playlist.json` is correct

### Opus files duration not showing correctly
- Opus files often don't report duration correctly in browsers
- **Solution**: Run `python extract_metadata.py` to extract duration from metadata
- The script adds a `duration` field to the JSON which the player will use
- This provides accurate duration display for all Opus files

### Switching songs requires double-clicking play button
- This has been fixed - song switching now properly maintains play state
- The player automatically starts playing when using prev/next buttons
- When manually selecting from playlist, click once to play

### Cover images not showing
- Ensure `.jpg` files exist
- Check paths in `playlist.json`
- Use `extract_metadata.py` to extract embedded covers

### Metadata extraction fails
- Install mutagen: `pip install mutagen`
- Ensure audio files have embedded tags
- Check file permissions

## License

This project is open source. Please respect copyright of music files you use.

## Credits

Design inspired by modern music player interfaces with glassmorphism effects.

---

Enjoy your music! 🎵
