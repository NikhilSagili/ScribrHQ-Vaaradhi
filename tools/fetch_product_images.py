"""Download one photo per product into img/products/ and record where each came from in data/product-images.js.

    python tools/fetch_product_images.py

Order of preference for each product:
  1. Vaaradhi's own photo on its EkSecond ordering page (brandImage in data/catalogue.js)
  2. Vaaradhi's own photo on vaaradhifarms.com (Shopify reference capture in data/source/)
  3. A representative photo from Wikimedia Commons (free licence, credited in CREDITS.md and labelled
     "Representative photo" in the app), for products Vaaradhi hasn't photographed.
Needs curl and Pillow (pip install pillow).
"""
import io, json, os, re, subprocess, sys, time, urllib.parse
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'img', 'products')
UA = 'ScribrVaaradhiDemo/1.0 (demo prototype; contact via github.com/NikhilSagili)'
SIZE = 480

def load_js(path):
    s = open(os.path.join(ROOT, path), encoding='utf-8').read()
    return json.loads(s[s.index('=') + 1:].rstrip().rstrip(';'))

def curl(url, tries=4):
    for k in range(tries):
        r = subprocess.run(['curl', '-sfL', '-m', '60', '-A', UA, url], capture_output=True)
        if not r.returncode: return r.stdout
        time.sleep(10 * (k + 1))   # Commons rate-limits bursts; back off and retry
    raise RuntimeError(f'curl failed ({r.returncode}) for {url}')

def save_square(data, dest):
    im = Image.open(io.BytesIO(data))
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[-1]); im = bg
    im = im.convert('RGB'); w, h = im.size; s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((SIZE, SIZE), Image.LANCZOS)
    im.save(dest, 'JPEG', quality=82, optimize=True, progressive=True)

# Same product under its Telugu / English name on the two Vaaradhi channels.
EXTRA_SHOPIFY = {'bellam-powder-1-kg': 'Jaggery Powder'}

# Commons searches for products Vaaradhi hasn't photographed. A specific File: title pins a reviewed choice.
COMMONS = {
    'ginger-250-g': 'ginger rhizome',
    'apple-500-g': 'red apple fruit',
    'ragi-idli-rava-500-g': 'finger millet flour',
    'ragi-upma-rava-500-g': 'File:Food grain finger millet.jpg',
    'jowar-idly-rava-500-g': 'File:Sorghum rice (1).jpg',
    'foxtail-upma-rava-500-g': 'foxtail millet grains',
    'korralu-1-kg': 'foxtail millet',
    'ragulu-1-kg': 'finger millet grains',
    'sona-masuri-rice-1-kg': 'File:Uncooked ST25 rice on bamboo surface.jpg',
    'kaalabhat-black-rice-1-kg': 'black rice grains',
    'kabuli-chana-500-g': 'File:Kabuli Chana.jpg',
    'white-poha-500-g': 'flattened rice poha',
    'jowar-flakes-150-g': 'File:Corn flakes.jpg',
    'quinoa-500-g': 'quinoa seeds',
    'tamarind-500-g': 'tamarind pulp',
    'himalaya-rock-salt-1-kg': 'himalayan salt',
    'pasupu-250-g': 'File:Turmeric Powder on a Spoon - Black Background.jpg',
    'coriander-powder-100-g': 'File:Coriander Seeds.jpg',
    'jeera-powder-100-g': 'File:Cumin powder.JPG',
    'palli-karam-100-g': 'File:Idli Podi.jpg',
    'dates-250-g': 'dates fruit',
    'almond-kashmiri-mamra-250-g': 'almonds',
}
OK_LICENCE = re.compile(r'^(CC0|CC BY(-SA)? [0-9.]+|Public domain|PD)', re.I)

def commons(query):
    base = 'https://commons.wikimedia.org/w/api.php?format=json&action=query&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=900&'
    if query.startswith('File:'):
        url = base + 'titles=' + urllib.parse.quote(query)
    else:
        url = base + 'generator=search&gsrnamespace=6&gsrlimit=15&gsrsearch=' + urllib.parse.quote(query + ' filetype:bitmap')
    pages = json.loads(curl(url)).get('query', {}).get('pages', {})
    for p in sorted(pages.values(), key=lambda p: p.get('index', 0)):
        ii = (p.get('imageinfo') or [{}])[0]; md = ii.get('extmetadata', {})
        lic = md.get('LicenseShortName', {}).get('value', '')
        if not OK_LICENCE.match(lic) or not re.search(r'\.(jpe?g|png|webp)$', p['title'], re.I): continue
        if min(ii.get('width', 0), ii.get('height', 0)) < 300: continue
        artist = re.sub(r'<[^>]+>', '', md.get('Artist', {}).get('value', 'Unknown')).strip()
        return {'url': ii.get('thumburl') or ii['url'], 'page': ii.get('descriptionurl'), 'title': p['title'][5:], 'author': artist[:80], 'licence': lic}
    raise RuntimeError(f'no freely licensed Commons photo for "{query}"')

def main():
    cat = load_js('data/catalogue.js')
    matches = json.load(open(os.path.join(ROOT, 'data/source/shopify-matches.json'), encoding='utf-8'))['matches']
    shop = json.load(open(os.path.join(ROOT, 'data/source/shopify-2026-10-28.json'), encoding='utf-8'))['products']
    by_handle, by_title = {p['handle']: p for p in shop}, {p['title']: p for p in shop}
    os.makedirs(OUT, exist_ok=True)
    out, fails = {}, []
    for p in cat['products']:
        pid, rec = p['id'], None
        try:
            if p.get('brandImage'):
                rec = {'source': 'EkSecond', 'from': p['brandImage']}
            else:
                m = matches.get(pid); sp = by_handle.get(m['handle']) if m else by_title.get(EXTRA_SHOPIFY.get(pid))
                if sp and sp.get('image'): rec = {'source': 'vaaradhifarms.com', 'from': sp['image']}
            if rec:
                dest = os.path.join(OUT, pid + '.jpg')
                if not os.path.exists(dest): save_square(curl(rec['from']), dest)
            else:
                time.sleep(2); c = commons(COMMONS[pid])
                save_square(curl(c['url']), os.path.join(OUT, pid + '.jpg'))
                rec = {'source': 'Wikimedia Commons', 'representative': True, 'from': c['page'], 'title': c['title'], 'author': c['author'], 'licence': c['licence']}
            rec['src'] = f'img/products/{pid}.jpg'; out[pid] = rec
            print(f"  {pid:30} {rec['source']}" + (f"  ({rec['title']}, {rec['licence']})" if rec.get('representative') else ''))
        except Exception as e:
            fails.append(pid); print(f'  {pid:30} FAILED: {e}')
    with open(os.path.join(ROOT, 'data/product-images.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* Generated by tools/fetch_product_images.py. One photo per product, with where it came from.\n'
                '   "representative": a free stock photo standing in for a product Vaaradhi hasn\'t photographed. */\n'
                'window.PRODUCT_IMAGES = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
    src = {}
    for r in out.values(): src[r['source']] = src.get(r['source'], 0) + 1
    print(f'{len(out)} of {len(cat["products"])} photos · ' + ' · '.join(f'{k}: {v}' for k, v in src.items()) + (f' · FAILED: {fails}' if fails else ''))
    if fails: sys.exit(1)

if __name__ == '__main__':
    main()
