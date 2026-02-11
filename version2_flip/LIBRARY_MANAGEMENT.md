# Extract Metadata Script - Library Management Feature

## New Feature: Preserve Manual Entries

The metadata extraction script now intelligently manages a library file, preserving manual entries like `copyrightUrl` while updating metadata.

## How It Works

### 1. **Library File**
- Primary library: `./music/playlist.json`
- Script loads this file before processing
- Uses `src` path as unique identifier for each song

### 2. **Processing Logic**

**For Existing Songs:**
- Preserves `copyrightUrl` from library
- Updates metadata: title, artist, duration
- Updates cover and lyrics paths if changed
- Marked as `[UPDATED]` in output

**For New Songs:**
- Adds to library with empty `copyrightUrl`
- Extracts all metadata from audio file
- Marked as `[NEW]` in output

### 3. **Backup System**
- Creates automatic backup before updating
- Format: `playlist_backup_YYYYMMDDHHMMSS.json`
- Safeguard against accidental data loss

## Usage Example

### Initial Run (No Library)
```bash
python extract_metadata.py
```
```
No existing library found at ./music/playlist.json
  Will create new library

Found 3 audio file(s)

Processing: song1.opus
  [NEW] Title: Song 1
  Artist: Artist Name
  Duration: 245.67s
  Lyrics: ✓
...

✓ Playlist updated successfully!
  Total songs: 3
  
Statistics:
  New entries: 3
  Updated entries: 0
  Copyright URLs preserved: 0
```

### Subsequent Run (With Manual Copyright URLs)
After manually adding copyright URLs to `playlist.json`:

```bash
python extract_metadata.py
```
```
Loaded existing library: ./music/playlist.json
  Found 3 existing entries

✓ Backup created: ./music/playlist_backup_20260203120000.json

Found 4 audio file(s)

Processing: song1.opus
  ✓ Copyright URL preserved: https://example.com/song1
  [UPDATED] Title: Song 1
  Artist: Artist Name
  Duration: 245.67s
  Lyrics: ✓

Processing: song2.opus
  ✓ Copyright URL preserved: https://example.com/song2
  [UPDATED] Title: Song 2
...

Processing: song4.opus
  [NEW] Title: Song 4
  Artist: New Artist
  Duration: 180.42s
...

✓ Playlist updated successfully!
  Total songs: 4
  
Statistics:
  New entries: 1
  Updated entries: 1
  Copyright URLs preserved: 2
```

## Benefits

### ✅ No Data Loss
- Manual entries (copyrightUrl) are never overwritten
- Safe to run multiple times

### ✅ Easy Maintenance
- Add new songs → run script → only fill in new copyright URLs
- Update metadata → run script → copyright URLs stay intact

### ✅ Version Control Friendly
- Consistent file: `playlist.json`
- Backups available if needed
- No timestamp-based filenames cluttering folder

### ✅ Workflow Integration
```bash
# 1. Add new music files to /music folder
# 2. Run metadata extraction
python extract_metadata.py

# 3. Only need to add copyright URLs for NEW songs
# 4. Existing songs keep their copyright URLs
```

## File Structure

```
music/
├── playlist.json              # Main library (updated in-place)
├── playlist_backup_*.json     # Automatic backups
├── song1.opus
├── song1.jpg                  # Auto-extracted
├── song1.lrc
├── song2.opus
└── ...
```

## Migration from Old Script

If you have old timestamped playlists:

1. **Rename your preferred playlist:**
   ```bash
   cp music/playlist_20260201120000.json music/playlist.json
   ```

2. **Run the new script:**
   ```bash
   python extract_metadata.py
   ```

3. **Result:**
   - All manual data preserved
   - New format with backups
   - Ready for future updates

## Technical Details

### Library Lookup
```python
# Creates dictionary with src path as key
library = {
    "./music/song1.opus": {
        "src": "./music/song1.opus",
        "title": "Song 1",
        "copyrightUrl": "https://example.com/song1",
        ...
    }
}
```

### Entry Matching
- Uses `src` field as unique identifier
- Case-sensitive path matching
- Preserves all fields from existing entry, updates metadata

### Statistics Tracking
- **New entries**: Songs not in library
- **Updated entries**: Songs in library but no copyright URL yet
- **Preserved**: Songs with copyright URL kept intact

## Error Handling

- Failed to load library → Creates new library
- Failed to create backup → Warning, continues anyway
- Failed to process audio file → Skips, continues with others

---

**Recommendation:** Run the script every time you add new songs. Your copyright URLs will be preserved, and only new songs need manual entry addition.
