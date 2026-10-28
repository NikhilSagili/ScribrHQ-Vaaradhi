"""Make a LOCAL meeting copy of the demo that uses Vaaradhi's own logo and product photos.

    python tools/make_meeting_copy.py

Output: meeting-copy/ (git-ignored). Open meeting-copy/index.html, or serve that folder.
The public demo is unchanged and keeps neutral placeholders. Use this copy only for the
meeting, and only as permitted by Vaaradhi Farms. Never commit or publish it.
"""
import json, os, shutil, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'meeting-copy')
LOGO_URL = 'https://vaaradhifarms.com/cdn/shop/files/VF_logo_final-02_2c6e6ec2-4064-4bf2-aae3-f51b9efa841e.png?v=1756365579&width=300'
SKIP = {'.git', 'meeting-copy', 'tools', 'data/source', 'img', 'CREDITS.md'}

def fetch(url, dest):
    r = subprocess.run(['curl', '-sfL', '-m', '40', '-A', 'Mozilla/5.0', '-o', dest, url])
    return r.returncode == 0 and os.path.getsize(dest) > 500

if os.path.exists(OUT): shutil.rmtree(OUT)
for base, dirs, files in os.walk(ROOT):
    rel = os.path.relpath(base, ROOT).replace('\\', '/')
    rel = '' if rel == '.' else rel
    dirs[:] = [d for d in dirs if (f'{rel}/{d}' if rel else d) not in SKIP]
    for f in files:
        if (f'{rel}/{f}' if rel else f) in SKIP: continue
        os.makedirs(os.path.join(OUT, rel), exist_ok=True)
        shutil.copy2(os.path.join(base, f), os.path.join(OUT, rel, f))

cat_src = open(os.path.join(ROOT, 'data/catalogue.js'), encoding='utf-8').read()
catalogue = json.loads(cat_src[cat_src.index('=') + 1:].rstrip().rstrip(';'))
os.makedirs(os.path.join(OUT, 'brand/products'), exist_ok=True)
images, missing = {}, []
for p in catalogue['products']:
    url = p.get('brandImage')
    if not url: missing.append(p['id']); continue
    ext = os.path.splitext(url.split('?')[0])[1] or '.jpg'
    name = p['id'] + ext
    if fetch(url, os.path.join(OUT, 'brand/products', name)): images[p['id']] = name
    else: missing.append(p['id'])
logo_ok = fetch(LOGO_URL, os.path.join(OUT, 'brand/logo.png'))

# Keep every public setting (cutoff, home essentials...) and only switch the asset mode.
brand = {'logo': 'brand/logo.png' if logo_ok else None, 'productImageDir': 'brand/products/', 'productImages': images}
with open(os.path.join(OUT, 'data/config.js'), 'a', encoding='utf-8', newline='\n') as f:
    f.write('\n/* LOCAL MEETING COPY ONLY. Uses Vaaradhi Farms brand assets. Do not publish. */\n'
            "window.DEMO_CONFIG.assetMode = 'brand';\n"
            "window.DEMO_CONFIG.sampleInterest = true;   // illustrative breakfast-interest samples, meeting copy only\n"
            'window.DEMO_CONFIG.brandAssets = ' + json.dumps(brand, indent=1) + ';\n')
print(f'meeting copy: {OUT}\nlogo: {"ok" if logo_ok else "MISSING"} | product photos: {len(images)} of {len(catalogue["products"])}'
      f' | neutral tile used for {len(missing)} products without a source photo')
