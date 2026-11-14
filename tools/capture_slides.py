"""Capture real demo screenshots for slides.html.

    python tools/capture_slides.py            # public demo  -> assets/slides/  (neutral tiles, committed)
    python tools/capture_slides.py --meeting  # meeting copy -> meeting-copy/assets/slides/ (brand assets, never committed)

Needs Google Chrome (or set the CHROME environment variable to its path).
"""
import os, shutil, struct, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = ['c-home', 'c-shop', 'c-baskets', 'c-subscribe', 'c-manage', 'c-meals', 'c-meal-prefs',
         'm-overview', 'm-orders', 'm-tomorrow', 'm-plans', 'm-interest']

def chrome():
    for c in [os.environ.get('CHROME'), r'C:\Program Files\Google\Chrome\Application\chrome.exe',
              r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe', shutil.which('chrome'), shutil.which('google-chrome')]:
        if c and os.path.exists(c): return c
    sys.exit('Chrome not found. Set CHROME to its path.')

def url(path): return 'file:///' + os.path.abspath(path).replace('\\', '/')

def main():
    meeting = '--meeting' in sys.argv
    base = os.path.join(ROOT, 'meeting-copy') if meeting else ROOT
    if meeting and not os.path.exists(os.path.join(base, 'index.html')):
        sys.exit('Run tools/make_meeting_copy.py first.')
    cfg = open(os.path.join(ROOT, 'data', 'config.js'), encoding='utf-8').read().replace(' ', '')
    if not meeting and ("assetMode:'placeholder'" not in cfg or "'brand';" in cfg or os.path.exists(os.path.join(ROOT, 'brand'))):
        sys.exit('Public screenshots must not show the logo or meeting samples: data/config.js must be in placeholder mode and there must be no brand/ folder.')
    out = os.path.join(base, 'assets', 'slides'); os.makedirs(out, exist_ok=True)
    cap = url(os.path.join(ROOT, 'tools', 'capture.html')); app = url(os.path.join(base, 'index.html'))
    ok = 0
    for shot in SHOTS:
        dest = os.path.join(out, shot + '.png')
        prof = tempfile.mkdtemp(prefix='cap_')
        subprocess.run([chrome(), '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
                        f'--user-data-dir={prof}', '--window-size=390,844', '--force-device-scale-factor=2',
                        '--virtual-time-budget=9000', f'--screenshot={dest}', f'{cap}?shot={shot}&app={app}'],
                       capture_output=True, timeout=120)
        shutil.rmtree(prof, ignore_errors=True)
        if os.path.exists(dest):
            w, h = struct.unpack('>II', open(dest, 'rb').read(24)[16:24])
            print(f'  {shot}.png {w}x{h}'); ok += 1
        else:
            print(f'  {shot}.png FAILED')
    print(f'{ok} of {len(SHOTS)} screenshots in {out}')

if __name__ == '__main__':
    main()
