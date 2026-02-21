import subprocess, os

FFMPEG = '/opt/homebrew/bin/ffmpeg'
audio_dir = os.path.dirname(os.path.abspath(__file__))

files = []
for root, dirs, filenames in os.walk(audio_dir):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for name in filenames:
        if name.endswith('.flac') and not name.endswith('_tmp.flac'):
            files.append(os.path.join(root, name))

files.sort()
print(f"Processing {len(files)} files: 192kHz/24-bit → 44.1kHz/16-bit + loudnorm\n")

ok, failed = [], []

for f in files:
    name = os.path.relpath(f, audio_dir)
    tmp = f.replace('.flac', '_tmp.flac')
    print(f"  {name} ...", end=' ', flush=True)

    result = subprocess.run([
        FFMPEG, '-hide_banner', '-loglevel', 'error',
        '-i', f,
        '-af', 'loudnorm=I=-14:TP=-1:LRA=11',
        '-ar', '44100',
        '-sample_fmt', 's16',
        '-c:a', 'flac',
        tmp, '-y'
    ], capture_output=True, text=True)

    if result.returncode == 0:
        os.replace(tmp, f)
        new_mb = os.path.getsize(f) / 1024 / 1024
        print(f"done ({new_mb:.1f}M)")
        ok.append(f)
    else:
        if os.path.exists(tmp):
            os.remove(tmp)
        print(f"FAILED")
        print(f"    {result.stderr.strip()}")
        failed.append(f)

print(f"\n{len(ok)} succeeded, {len(failed)} failed")
if failed:
    print("Failed files:")
    for f in failed:
        print(f"  {os.path.relpath(f, audio_dir)}")
