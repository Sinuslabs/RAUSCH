import subprocess, os, json

audio_dir = os.path.dirname(os.path.abspath(__file__))
files = []

for root, dirs, filenames in os.walk(audio_dir):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for name in filenames:
        if name.endswith('.flac'):
            files.append(os.path.join(root, name))

files.sort()

print(f"{'File':<42} {'Size':>6}  {'Duration':>8}  {'Hz':>6}  {'Ch':>3}  {'Bit':>4}")
print("-" * 80)

total_size = 0
for f in files:
    # Size
    size_bytes = os.path.getsize(f)
    total_size += size_bytes
    size_mb = size_bytes / 1024 / 1024

    # Metadata via ffprobe
    result = subprocess.run([
        '/opt/homebrew/bin/ffprobe', '-hide_banner', '-loglevel', 'quiet',
        '-print_format', 'json',
        '-show_format', '-show_streams', f
    ], capture_output=True, text=True)

    data = json.loads(result.stdout)
    duration = float(data['format'].get('duration', 0))
    stream = next((s for s in data['streams'] if s['codec_type'] == 'audio'), {})
    sr = int(stream.get('sample_rate', 0))
    ch = stream.get('channels', '?')
    bits = stream.get('bits_per_raw_sample', '?')

    m, s = divmod(int(duration), 60)
    name = os.path.relpath(f, audio_dir)

    print(f"{name:<42} {size_mb:>5.1f}M  {m}m{s:02d}s  {sr:>6}  {ch:>3}  {bits:>4}")

print("-" * 80)
print(f"{'TOTAL':<42} {total_size/1024/1024:>5.0f}M")
