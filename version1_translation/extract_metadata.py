#!/usr/bin/env python3
"""
Music Metadata Extractor
Extracts metadata and cover art from audio files to generate playlist.json
Requires: mutagen library (install via: pip install mutagen)
"""

from datetime import datetime
import os
import json
import base64
from pathlib import Path

try:
    from mutagen import File
    from mutagen.id3 import ID3, APIC
    from mutagen.oggopus import OggOpus
    from mutagen.flac import FLAC, Picture
    from mutagen.mp4 import MP4
except ImportError:
    print("Error: mutagen library not found.")
    print("Install it with: pip install mutagen")
    exit(1)


def extract_cover_art(audio_file, output_path):
    """Extract cover art from audio file and save as image"""
    try:
        audio = File(audio_file)
        
        if audio is None:
            return None
            
        cover_data = None
        
        # Handle different audio formats
        if isinstance(audio, OggOpus):
            # Ogg Opus files
            if 'metadata_block_picture' in audio:
                import base64
                from mutagen.flac import Picture
                pic_data = base64.b64decode(audio['metadata_block_picture'][0])
                picture = Picture(pic_data)
                cover_data = picture.data
        
        elif hasattr(audio, 'tags') and audio.tags:
            # ID3 tags (MP3)
            if 'APIC:' in audio.tags or 'APIC' in audio.tags:
                for key in audio.tags.keys():
                    if key.startswith('APIC'):
                        cover_data = audio.tags[key].data
                        break
            
            # MP4/M4A
            elif 'covr' in audio.tags:
                cover_data = audio.tags['covr'][0]
            
            # FLAC
            elif hasattr(audio, 'pictures') and audio.pictures:
                cover_data = audio.pictures[0].data
        
        if cover_data:
            with open(output_path, 'wb') as f:
                f.write(cover_data)
            return True
            
    except Exception as e:
        print(f"Warning: Could not extract cover from {audio_file}: {e}")
    
    return None


def load_library(library_file):
    """Load existing library/playlist file to preserve manual data like copyrightUrl"""
    library = {}
    
    if os.path.exists(library_file):
        try:
            with open(library_file, 'r', encoding='utf-8') as f:
                existing_playlist = json.load(f)
                # Create a lookup dictionary using src path as key
                for entry in existing_playlist:
                    if 'src' in entry:
                        library[entry['src']] = entry
            print(f"\nLoaded existing library: {library_file}")
            print(f"  Found {len(library)} existing entries")
        except Exception as e:
            print(f"\nWarning: Could not load existing library: {e}")
            print("  Will create new library")
    else:
        print(f"\nNo existing library found at {library_file}")
        print("  Will create new library")
    
    return library


def extract_metadata(music_folder, library):
    """Extract metadata from all audio files in the music folder"""
    music_path = Path(music_folder)
    playlist = []
    updated_count = 0
    new_count = 0
    preserved_count = 0
    
    # Supported audio extensions
    audio_extensions = ['.mp3', '.opus', '.ogg', '.flac', '.m4a', '.wav']
    
    # Find all audio files
    audio_files = []
    for ext in audio_extensions:
        audio_files.extend(music_path.glob(f'*{ext}'))
    
    print(f"Found {len(audio_files)} audio file(s)")
    
    for audio_file in sorted(audio_files):
        print(f"\nProcessing: {audio_file.name}")
        
        try:
            audio = File(audio_file)
            
            if audio is None:
                print(f"  Warning: Could not read metadata from {audio_file.name}")
                continue
            
            # Extract basic info
            filename = audio_file.stem
            file_ext = audio_file.suffix
            
            # Try to get title and artist from tags
            title = filename
            artist = "Unknown Artist"
            duration = None
            
            # Extract duration (in seconds)
            if audio.info and hasattr(audio.info, 'length'):
                duration = round(audio.info.length, 2)
            
            if audio.tags:
                # Common tag names across formats
                title_tags = ['title', 'TIT2', '\xa9nam', 'TITLE']
                artist_tags = ['artist', 'TPE1', '\xa9ART', 'ARTIST']
                
                for tag in title_tags:
                    if tag in audio.tags:
                        title = str(audio.tags[tag][0]) if isinstance(audio.tags[tag], list) else str(audio.tags[tag])
                        break
                
                for tag in artist_tags:
                    if tag in audio.tags:
                        artist = str(audio.tags[tag][0]) if isinstance(audio.tags[tag], list) else str(audio.tags[tag])
                        break
            
            # Cover art path
            cover_path = music_path / f"{filename}.jpg"
            
            # Extract cover art if it doesn't exist
            if not cover_path.exists():
                print(f"  Extracting cover art...")
                if extract_cover_art(audio_file, cover_path):
                    print(f"  ✓ Cover extracted: {cover_path.name}")
                else:
                    print(f"  ✗ No cover art found")
            else:
                print(f"  ✓ Cover already exists: {cover_path.name}")
            
            # Check for lyrics file
            lrc_path = music_path / f"{filename}.lrc"
            
            # Create the src path that will be used as key
            src_path = f"./music/{audio_file.name}"
            
            # Check if this song exists in library
            existing_entry = library.get(src_path)
            copyright_url = ""
            is_existing = False
            
            if existing_entry:
                # Preserve copyrightUrl from existing entry
                copyright_url = existing_entry.get('copyrightUrl', '')
                is_existing = True
                if copyright_url:
                    preserved_count += 1
                    print(f"  ✓ Copyright URL preserved: {copyright_url[:50]}..." if len(copyright_url) > 50 else f"  ✓ Copyright URL preserved: {copyright_url}")
                else:
                    updated_count += 1
            else:
                new_count += 1
            
            # Create playlist entry
            entry = {
                "src": src_path,
                "title": title,
                "artist": artist,
                "cover": f"./music/{filename}.jpg",
                "lrc": f"./music/{filename}.lrc" if lrc_path.exists() else "",
                "copyrightUrl": copyright_url,  # Preserved from library or empty
                "duration": duration  # Duration in seconds
            }
            
            playlist.append(entry)
            
            status = "[UPDATED]" if is_existing else "[NEW]"
            print(f"  {status} Title: {title}")
            print(f"  Artist: {artist}")
            print(f"  Duration: {duration:.2f}s" if duration else "  Duration: Unknown")
            print(f"  Lyrics: {'✓' if lrc_path.exists() else '✗'}")
            
        except Exception as e:
            print(f"  Error processing {audio_file.name}: {e}")
    
    return playlist, {'updated': updated_count, 'new': new_count, 'preserved': preserved_count}


def main():
    # Configuration
    music_folder = "./music"
    library_file = "./music/playlist.json"  # Primary library file to preserve
    output_file = "./music/playlist.json"  # Output to the same file to update it
    backup_file = f"./music/playlist_backup_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
    
    print("=" * 60)
    print("Music Metadata Extractor with Library Management")
    print("=" * 60)
    
    # Check if music folder exists
    if not os.path.exists(music_folder):
        print(f"Error: Music folder '{music_folder}' not found!")
        return
    
    # Load existing library to preserve manual data
    library = load_library(library_file)
    
    # Backup existing library if it exists
    if os.path.exists(library_file) and library:
        try:
            import shutil
            shutil.copy2(library_file, backup_file)
            print(f"\n✓ Backup created: {backup_file}")
        except Exception as e:
            print(f"\nWarning: Could not create backup: {e}")
    
    # Extract metadata
    playlist, stats = extract_metadata(music_folder, library)
    
    if not playlist:
        print("\nNo audio files found or processed!")
        return
    
    # Save to JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(playlist, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 60)
    print(f"✓ Playlist updated successfully!")
    print(f"  Output: {output_file}")
    print(f"  Total songs: {len(playlist)}")
    print(f"\nStatistics:")
    print(f"  New entries: {stats['new']}")
    print(f"  Updated entries: {stats['updated']}")
    print(f"  Copyright URLs preserved: {stats['preserved']}")
    print(f"\nNote: Copyright URLs have been preserved from existing library.")
    print(f"      Add copyright URLs for new songs manually.")
    print("=" * 60)


if __name__ == "__main__":
    main()
