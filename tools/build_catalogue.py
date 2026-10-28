"""Build data/catalogue.js from the captured EkSecond source.

Re-run after editing CURATED, CATEGORIES or ELIGIBILITY below:
    python tools/build_catalogue.py

Prices come only from the EkSecond capture. Shopify data is matched for reference
and written to a separate file that the app never loads.
"""
import difflib, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EK = json.load(open(os.path.join(ROOT, 'data/source/eksecond-2026-10-28.json'), encoding='utf-8'))
SH = json.load(open(os.path.join(ROOT, 'data/source/shopify-2026-10-28.json'), encoding='utf-8'))

# Display categories, in the order customers see them. `source` is the EkSecond category name.
CATEGORIES = [
    ('vegetables', 'Vegetables',          'Veggies',    'Vegetable',                '#7FB069'),
    ('fruit',      'Fruit',               'Fruit',      'Fruit',                    '#E07A5F'),
    ('eggs',       'Eggs',                'Eggs',       'Eggs',                     '#E9C46A'),
    ('oils',       'Cold Pressed Oils',   'Oils',       'Cold Pressed Oils',        '#D4A017'),
    ('flours',     'Flours & Rava',       'Flours',     'Flours & Atta',            '#C9A66B'),
    ('millets',    'Millets',             'Millets',    'Millets',                  '#B5835A'),
    ('rice',       'Rice',                'Rice',       'Rice',                     '#A3B18A'),
    ('dals',       'Pulses & Dals',       'Dals',       'Pulses & Dals',            '#E76F51'),
    ('grocery',    'Grocery Staples',     'Staples',    'Other Grocery',            '#8AB17D'),
    ('sweeteners', 'Sweeteners & Salts',  'Sweeteners', 'Sweetners & Salts',        '#BC6C25'),
    ('spices',     'Spices & Powders',    'Spices',     'Spices & Powders',         '#C1440E'),
    ('pickles',    'Pickles & Podis',     'Pickles',    'Pickles & Pickle Powders', '#9C2C2C'),
    ('seeds',      'Seeds',               'Seeds',      'Seeds',                    '#6B8F71'),
    ('dryfruits',  'Dry Fruits & Nuts',   'Dry fruits', 'Dry Fruits & Nuts',        '#8D6346'),
    ('snacks',     'Snacks',              'Snacks',     'Snacks',                   '#DDA15E'),
    ('sweets',     'Sweets',              'Sweets',     'Sweets',                   '#CB997E'),
]

# Curated starting set: exact EkSecond names. Customisable items are excluded until variant prices are verified.
CURATED = {
    'vegetables': ['Onion 1Kg', 'Potato 500g', 'Garlic 250g', 'Ginger 250g'],
    'fruit':      ['Apple 500g'],
    'eggs':       ['Desi Eggs 6pcs'],
    'oils':       ['Sunflower Oil 1Liter', 'White Sesame Oil 500Ml', 'Pure Coconut Oil 500Ml', 'Safflower Oil 500Ml', 'Black Sesame Oil 500Ml', 'Mustard Oil 500Ml'],
    'flours':     ['Wheat Flour 1Kg', 'Ragi Idli Rava 500Gm', 'Ragi Upma Rava 500Gm', 'Jowar Idly Rava 500G', 'Foxtail Upma Rava 500Gm'],
    'millets':    ['Korralu 1Kg', 'Ragulu 1Kg', 'Arikelu 1Kg'],
    'rice':       ['Sona Masuri Rice 1Kg', 'Kaalabhat Black Rice 1Kg'],
    'dals':       ['Minapappu 500Gm', 'Pottu Pesarapappu 500G', 'Kabuli Chana 500G', 'Desi White Chana 500G', 'Green Peas 250G', 'Groundnuts 1Kg'],
    'grocery':    ['White Poha 500G', 'Jowar Flakes 150G', 'Quinoa 500Gm', 'Tamarind 500G'],
    'sweeteners': ['Bellam Powder 1Kg', 'Desi Khand Sugar 1Kg', 'Himalaya Rock Salt 1Kg'],
    'spices':     ['Pasupu 250G', 'Coriander Powder 100G', 'Jeera Powder 100Gm', 'Dhaniyalu 250G'],
    'pickles':    ['Mango Pickle 300Gm', 'Gongura Pickle 300G', 'Palli Karam 100Gm'],
    'seeds':      ['Chia Seeds 250G', 'Flax Seeds 250G'],
    'dryfruits':  ['Dates 250G', 'Almond (Kashmiri Mamra) 250Gm'],
    'snacks':     ['Ribbon Pakoda 200G', 'Korra Murukulu 250G'],
    'sweets':     ['Ragi Laddu 250G', 'Nuvvula Undalu 250G'],
}

# PROPOSED subscription defaults per category. Not merchant-approved. Edit freely.
# Frequencies: daily, alternate, days (customer-selected weekdays), weekly, fortnightly, monthly.
# 'monthly' is kept as a proposed option but the demo's schedule engine does not offer it.
FRESH = ['alternate', 'days', 'weekly']
STAPLE = ['weekly', 'fortnightly', 'monthly']
ELIGIBILITY = {
    'vegetables': FRESH, 'fruit': FRESH, 'eggs': ['daily', 'alternate', 'days', 'weekly'],
    'oils': STAPLE, 'flours': STAPLE, 'millets': STAPLE, 'rice': STAPLE, 'dals': STAPLE,
    'grocery': STAPLE, 'sweeteners': STAPLE,
}
NOT_ELIGIBLE_ITEMS = {'Tamarind 500G', 'Himalaya Rock Salt 1Kg'}   # long-lasting; one-time purchase by default

UNIT = {'ml': 'ml', 'l': 'litre', 'liter': 'litre', 'litre': 'litre', 'g': 'g', 'gm': 'g', 'gms': 'g', 'kg': 'kg', 'pcs': 'pcs'}
SIZE = re.compile(r'\s*,?\s*(\d+(?:\.\d+)?)\s*(ml|liter|litre|l|gms|gm|g|kg|pcs)\s*,?\s*$', re.I)

def split_name(raw):
    m = SIZE.search(raw)
    if not m: return raw.strip(' ,'), None
    unit = UNIT[m.group(2).lower()]
    qty = m.group(1)
    return raw[:m.start()].strip(' ,'), f'{qty} {unit}' if unit != 'pcs' else f'{qty} pcs'

def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def norm(s): return re.sub(r'\b\d+\s*(ml|g|gm|gms|kg|liter|litre|l|pcs)\b', '', s.lower()).replace('cold pressed', '').strip()

shop_by_norm = {norm(p['title']): p for p in SH['products']}
by_name = {i['name']: i for i in EK['items']}
cat_meta = {c[0]: c for c in CATEGORIES}

products, reference, problems = [], {}, []
for cat, names in CURATED.items():
    for raw in names:
        item = by_name.get(raw)
        if not item: problems.append(f'Missing in source: {raw}'); continue
        if item['customisable']: problems.append(f'Customisable, skipped: {raw}'); continue
        if item['category'] != cat_meta[cat][3]: problems.append(f'Category mismatch for {raw}: {item["category"]}')
        name, variant = split_name(raw)
        name = name[:1].upper() + name[1:]
        pid = slug(f'{name} {variant or ""}')
        freqs = [] if raw in NOT_ELIGIBLE_ITEMS else ELIGIBILITY.get(cat, [])
        products.append({
            'id': pid, 'name': name, 'variant': variant, 'category': cat,
            'price': item['displayedPrice'], 'description': None,
            'brandImage': item['image'],
            'availability': 'listed',
            'minQty': 1, 'maxQty': None,
            'subscription': {'eligible': bool(freqs), 'frequencies': freqs, 'status': 'proposed-default'},
            'source': {'channel': 'EkSecond', 'name': raw, 'category': item['category'], 'verifiedOn': EK['capturedOn']},
        })
        m = difflib.get_close_matches(norm(raw), shop_by_norm.keys(), n=1, cutoff=0.82)
        if m:
            sp = shop_by_norm[m[0]]
            reference[pid] = {'shopifyTitle': sp['title'], 'handle': sp['handle'], 'variants': sp['variants']}

catalogue = {
    'meta': {
        'merchant': 'Vaaradhi Farms',
        'priceSource': 'EkSecond public ordering link',
        'sourceUrl': EK['url'],
        'verifiedOn': EK['capturedOn'],
        'currency': 'INR',
        'notes': 'Displayed prices as captured on the verification date. Not synchronised with EkSecond. '
                 'Availability means "listed on the ordering page", not live stock. Subscription settings are proposed defaults.',
    },
    'categories': [{'id': c[0], 'name': c[1], 'shortName': c[2], 'sourceName': c[3], 'color': c[4]} for c in CATEGORIES],
    'products': products,
}
header = ('/* GENERATED by tools/build_catalogue.py from data/source/eksecond-2026-10-28.json.\n'
          '   Safe to hand-edit, but re-running the script overwrites this file.\n'
          '   Prices: EkSecond displayed prices, verified 2026-10-28. Subscription settings: PROPOSED defaults, not merchant-approved. */\n')
open(os.path.join(ROOT, 'data/catalogue.js'), 'w', encoding='utf-8', newline='\n').write(
    header + 'window.CATALOGUE = ' + json.dumps(catalogue, ensure_ascii=False, indent=1) + ';\n')
json.dump({'note': 'Shopify matches for curated products. Reference only; never shown to customers.', 'capturedOn': SH['capturedOn'], 'matches': reference},
          open(os.path.join(ROOT, 'data/source/shopify-matches.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)

print(f'products: {len(products)} | categories used: {len({p["category"] for p in products})} | '
      f'with brand image: {sum(1 for p in products if p["brandImage"])} | subscription-eligible (proposed): {sum(p["subscription"]["eligible"] for p in products)} | '
      f'shopify reference matches: {len(reference)}')
for p in problems: print('  !', p)
