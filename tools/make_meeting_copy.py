"""Make a LOCAL meeting copy of the demo with Vaaradhi's logo and the illustrative breakfast-interest samples.

    python tools/make_meeting_copy.py              # also re-captures slide screenshots from the meeting copy
    python tools/make_meeting_copy.py --no-slides  # skip the screenshots (faster)

Output: meeting-copy/ (git-ignored). Open meeting-copy/index.html, or serve that folder.
Product photos are the same as the public demo (img/products/). The public demo is unchanged:
no logo and no sample interest. Use this copy only for the meeting. Never commit or publish it.
"""
import os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'meeting-copy')
LOGO_URL = 'https://vaaradhifarms.com/cdn/shop/files/VF_logo_final-02_2c6e6ec2-4064-4bf2-aae3-f51b9efa841e.png?v=1756365579&width=300'
# img/*.jpg directly under img/ belong to the archived pitch; img/products/ is copied.
SKIP = {'.git', 'meeting-copy', 'tools', 'data/source', 'CREDITS.md', 'archive', 'brand'}

def fetch(url, dest):
    r = subprocess.run(['curl', '-sfL', '-m', '40', '-A', 'Mozilla/5.0', '-o', dest, url])
    return r.returncode == 0 and os.path.getsize(dest) > 500

if os.path.exists(OUT): shutil.rmtree(OUT)
for base, dirs, files in os.walk(ROOT):
    rel = os.path.relpath(base, ROOT).replace('\\', '/')
    rel = '' if rel == '.' else rel
    dirs[:] = [d for d in dirs if (f'{rel}/{d}' if rel else d) not in SKIP]
    for f in files:
        if (f'{rel}/{f}' if rel else f) in SKIP or rel == 'img': continue
        os.makedirs(os.path.join(OUT, rel), exist_ok=True)
        shutil.copy2(os.path.join(base, f), os.path.join(OUT, rel, f))

os.makedirs(os.path.join(OUT, 'brand'), exist_ok=True)
logo_ok = fetch(LOGO_URL, os.path.join(OUT, 'brand/logo.png'))
n_photos = len(os.listdir(os.path.join(OUT, 'img', 'products')))

# Keep every public setting (cutoff, home essentials...) and only switch the asset mode.
with open(os.path.join(OUT, 'data/config.js'), 'a', encoding='utf-8', newline='\n') as f:
    f.write('\n/* LOCAL MEETING COPY ONLY. Uses the Vaaradhi Farms logo. Do not publish. */\n'
            "window.DEMO_CONFIG.assetMode = 'brand';\n"
            "window.DEMO_CONFIG.sampleInterest = true;   // illustrative breakfast-interest samples, meeting copy only\n"
            "window.DEMO_CONFIG.brandAssets = {logo: " + ("'brand/logo.png'" if logo_ok else 'null') + "};\n")
print(f'meeting copy: {OUT}\nlogo: {"ok" if logo_ok else "MISSING"} | product photos: {n_photos} (same as the public demo)')

# slides.html in the meeting copy uses screenshots of the meeting copy itself (with brand assets).
# They stay inside the git-ignored meeting-copy folder.
if '--no-slides' not in sys.argv:
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'capture_slides.py'), '--meeting'])
