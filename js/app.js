/* =====================================================================
   Product data lives in data/catalogue.js (EkSecond displayed prices, verified
   2026-10-28) and meal-plan concepts in data/plans.js. Edit those files, not this one.
   ===================================================================== */
const CFG = window.DEMO_CONFIG || {assetMode:'placeholder', brandAssets:{}};
const BRAND = CFG.assetMode === 'brand';
const CAT_LIST = window.CATALOGUE.categories.filter(c => window.CATALOGUE.products.some(p => p.category === c.id));
const CATMAP = Object.fromEntries(CAT_LIST.map(c => [c.id, c]));
const PRODUCTS = window.CATALOGUE.products.map(p => ({...p, cat: CATMAP[p.category].name, unit: p.variant || 'Pack size not listed'}));
const CATS = ['All', ...CAT_LIST.map(c => c.name)];
const CAT_SHORT = Object.fromEntries(CAT_LIST.map(c => [c.name, c.shortName]));
const CUSTOMERS = [
  ['me','Ananya Rao','Manikonda'],['c1','Rahul Kumar','Gachibowli'],['c2','Sneha Reddy','Kondapur'],['c3','Farhan Ali','Tolichowki'],
  ['c4','Priya Sharma','Narsingi'],['c5','Vikram Goud','Puppalaguda'],['c6','Meera Iyer','Financial District'],['c7','Arjun Varma','Kokapet'],
  ['c8','Lakshmi Devi','Manikonda'],['c9','Karthik Nair','Madhapur'],['c10','Divya Menon','Gachibowli'],['c11','Sameer Khan','Tolichowki'],
  ['c12','Pooja Agarwal','Jubilee Hills'],['c13','Ravi Teja','Kondapur'],['c14','Nandini Pillai','Narsingi'],['c15','Aditya Jain','Financial District'],
  ['c16','Swathi Kumari','Puppalaguda'],['c17','Imran Shaikh','Manikonda'],['c18','Harsha Vardhan','Kokapet'],['c19','Kavya Murthy','Madhapur'],
  ['c20','Suresh Babu','Manikonda'],['c21','Anjali Gupta','Jubilee Hills'],['c22','Rohit Bansal','Gachibowli'],['c23','Tejaswini Rao','Kondapur'],
  ['c24','Naveen Chandra','Narsingi'],
].map(([id,name,area])=>({id,name,area}));
const AREAS = ['Manikonda','Puppalaguda','Narsingi','Kokapet','Financial District','Gachibowli','Kondapur','Madhapur','Tolichowki','Jubilee Hills'];
const FREQ = {daily:'Daily', alternate:'Alternate days', weekdays:'Mon – Fri', weekends:'Sat & Sun', weekly:'Weekly', fortnightly:'Every 2 weeks', monthly:'Monthly'};
const PERMONTH = {daily:30, alternate:15, weekdays:22, weekends:8, weekly:4, fortnightly:2, monthly:1};
/* The schedule engine currently handles these. Weekly, fortnightly and monthly are modelled in the catalogue and arrive with the grocery-subscription work. */
const ENGINE_FREQS = ['daily','alternate','weekdays','weekends'];
const subFreqs = p => p && p.subscription && p.subscription.eligible ? p.subscription.frequencies.filter(f => ENGINE_FREQS.includes(f)) : [];
const CUTOFF = '9:00 PM';
const AV_COLORS = ['#E7F6EC|#0B5A2D','#EAF1FF|#2563EB','#FFF5D1|#7A5B00','#FDE8EA|#B4232F','#F1EAFE|#6D28D9','#E6F7F7|#0E7490'];

/* ---------- dates ---------- */
const DAY = 86400000;
const atMidnight = d => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const TODAY = atMidnight(new Date());
const addD = n => new Date(TODAY.getTime() + n*DAY + 3*3600000);
const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const parse = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d, 12); };
const plus = (s,n) => iso(new Date(parse(s).getTime() + n*DAY));
const diffDays = (a,b) => Math.round((parse(b) - parse(a)) / DAY);
const TDY = iso(addD(0)), TMR = iso(addD(1)), DAT = iso(addD(2));
const fmtD = s => parse(s).toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short'});
const fmtS = s => parse(s).toLocaleDateString('en-IN', {day:'numeric', month:'short'});

/* ---------- lookups + formatting ---------- */
const P = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
const C = Object.fromEntries(CUSTOMERS.map(c => [c.id, c]));
const rs = n => '₹' + Math.round(n).toLocaleString('en-IN');
const sgn = n => n > 0 ? '+' + rs(n) : n < 0 ? '−' + rs(-n) : '₹0';
const initials = id => C[id].name.split(' ').map(w => w[0]).join('').slice(0,2);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- state ---------- */
const KEY = 'vaaradhi-demo-v4';
let S;
const ui = {view:'customer', cTab:'shop', cCat:'All', q:'', mTab:'orders', sheet:null, cToast:null, mToast:null, demoOpen:false,
            confirmCancel:null, prevPrep:null, prevKpi:null, flash:{}, shownToast:{}};

function seed(){
  let s = 7; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const subs = []; let n = 1;
  const add = (cust, prod, freq, qty, startOff) => {
    const sub = {id:'s'+(n++), cust, prod, freq, qty, start:iso(addD(startOff)), pausedFrom:null, cancelledFrom:null, isNew:false};
    subs.push(sub); return sub;
  };
  add('me','desi-eggs-6-pcs','daily',1,-21); add('me','potato-500-g','alternate',1,-11); add('me','onion-1-kg','alternate',1,-11);
  const SEEDABLE = PRODUCTS.filter(p => subFreqs(p).length);
  CUSTOMERS.slice(1).forEach(c => {
    const k = 1 + Math.floor(r()*3), picks = new Set();
    while (picks.size < k) picks.add(SEEDABLE[Math.floor(r()*SEEDABLE.length)].id);
    picks.forEach(pid => { const fs = subFreqs(P[pid]); add(c.id, pid, fs[Math.floor(r()*fs.length)], (pid==='desi-eggs-6-pcs' && r() > .4) ? 2 : 1, -2 - Math.floor(r()*20)); });
  });
  const rahul = add('c1','desi-eggs-6-pcs','daily',2,1); rahul.isNew = true;
  const harshaSub = subs.find(x => x.cust === 'c18'); harshaSub.pausedFrom = iso(addD(-2));

  const st = {day:TDY, phase:'open', subs, vac:{c2:{from:TDY, to:iso(addD(3))}, c6:{from:TMR, to:iso(addD(7))}},
    ovr:{}, extras:[{id:1, cust:'c3', prod:'desi-eggs-6-pcs', qty:1}, {id:2, cust:'c12', prod:'apple-500-g', qty:1}],
    done:{}, meSettled:false, orders:[], cart:[], oseq:1043, snapshot:null, ledger:[], seq:0, feed:[], unread:0, simStart:Date.now(), lockedAt:null};
  S = st;
  const led = (date, text, amt, kind) => st.ledger.push({date, text, amt, kind, seq:st.seq++});
  led(iso(addD(-6)), 'Added to wallet via UPI', 3000, 'in');
  for (let d = -5; d <= 0; d++) {
    const day = iso(addD(d));
    subs.filter(x => x.cust === 'me' && delivers(x, day)).forEach(x => led(day, 'Delivered · ' + P[x.prod].name + ' × ' + x.qty, -x.qty*P[x.prod].price, 'out'));
  }
  st.feed = [
    {t:'7:31 PM', kind:'new',   text:`Rahul K. subscribed to Desi Eggs × 2 · Daily · starts ${fmtD(TMR)}`},
    {t:'6:52 PM', kind:'add',   text:'Pooja A. added Apple × 1 for tomorrow'},
    {t:'5:40 PM', kind:'pause', text:`Meera I. is away ${fmtS(TMR)} – ${fmtS(iso(addD(7)))}. Deliveries paused, no charge.`},
    {t:'4:12 PM', kind:'add',   text:'Farhan A. added Desi Eggs × 1 for tomorrow'},
    {t:'Yesterday', kind:'pause', text:`Harsha V. paused ${P[harshaSub.prod].name}`},
  ];
  const mk = (id, cust, items, status, t) => st.orders.push({id, cust, items, amt:orderAmt(items), status, t});
  mk(1038,'c8', [{prod:'mango-pickle-300-g',qty:1},{prod:'white-poha-500-g',qty:1}], 'delivered', '11:20 AM');
  mk(1039,'c11',[{prod:'sunflower-oil-1-litre',qty:1},{prod:'wheat-flour-1-kg',qty:1}], 'delivered', '1:05 PM');
  mk(1040,'c10',[{prod:'ragi-laddu-250-g',qty:2},{prod:'dates-250-g',qty:1}], 'out', '7:05 PM');
  mk(1041,'c9', [{prod:'ragi-idli-rava-500-g',qty:1},{prod:'desi-eggs-6-pcs',qty:1}], 'packed', '7:20 PM');
  mk(1042,'c19',[{prod:'white-sesame-oil-500-ml',qty:1},{prod:'jowar-flakes-150-g',qty:2}], 'placed', '7:38 PM');
  const k = st.orders[4];
  st.feed.unshift({t:'7:38 PM', kind:'order', text:`New order #1042 from Kavya M. · ${itemsText(k.items)} · ${rs(k.amt)} · Madhapur`});
  return st;
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
function load(){ try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.day === TDY) return s; } catch(e){} return null; }

/* ---------- subscription rules ---------- */
function freqOk(f, start, d){
  const dow = parse(d).getDay();
  if (f === 'daily') return true;
  if (f === 'weekdays') return dow >= 1 && dow <= 5;
  if (f === 'weekends') return dow === 0 || dow === 6;
  if (f === 'alternate') return diffDays(start, d) % 2 === 0;
  return false;
}
function delivers(s, d){ if (d < s.start) return false; if (s.cancelledFrom && d >= s.cancelledFrom) return false; return freqOk(s.freq, s.start, d); }
function pausedOn(s, d){
  if (s.pausedFrom && d >= s.pausedFrom) return true;
  const v = S.vac[s.cust];
  return !!(v && d >= v.from && (!v.to || d <= v.to));
}
function firstDelivery(s){ for (let i = 0; i < 14; i++){ const d = plus(s.start, i); if (delivers(s, d)) return d; } return s.start; }
const editFrom = () => S.phase === 'open' ? TMR : DAT;   // the 9 PM rule

function computeLines(){
  const out = [];
  for (const s of S.subs){
    if (!delivers(s, TMR)) continue;
    const o = S.ovr[s.id] || {}, qty = o.qty || s.qty;
    const status = pausedOn(s, TMR) ? 'paused' : o.skip ? 'skipped' : 'ok';
    out.push({cust:s.cust, prod:s.prod, qty, subId:s.id, amt:qty*P[s.prod].price, status, kind:'plan', freq:s.freq});
  }
  S.extras.forEach(x => out.push({cust:x.cust, prod:x.prod, qty:x.qty, xid:x.id, amt:x.qty*P[x.prod].price, status:'ok', kind:'extra'}));
  return out;
}
const lines = () => S.phase === 'open' ? computeLines() : S.snapshot;
const okLines = () => lines().filter(l => l.status === 'ok');
function stops(){
  const m = {};
  okLines().forEach(l => { (m[l.cust] = m[l.cust] || {cust:l.cust, area:C[l.cust].area, lines:[], amt:0}); m[l.cust].lines.push(l); m[l.cust].amt += l.amt; });
  return Object.values(m).sort((a,b) => AREAS.indexOf(a.area) - AREAS.indexOf(b.area) || (a.cust === 'me' ? -1 : b.cust === 'me' ? 1 : 0));
}
function prep(){ const m = {}; okLines().forEach(l => m[l.prod] = (m[l.prod] || 0) + l.qty); return m; }
function dayRevenue(d){ let amt = 0, n = 0; S.subs.forEach(s => { if (!s.isNew && delivers(s, d) && !pausedOn(s, d)) { amt += s.qty*P[s.prod].price; n++; } }); return {amt, n}; }
const balance = () => S.ledger.reduce((a, l) => a + l.amt, 0);

/* ---------- order now (one-time, same day) ---------- */
const FLOW = ['placed','accepted','packed','out','delivered'];
const OLBL = {placed:'New', accepted:'Accepted', packed:'Packed', out:'Out for delivery', delivered:'Delivered', cancelled:'Cancelled'};
const NEXT = {placed:'Accept order', accepted:'Mark packed', packed:'Send out', out:'Mark delivered'};
const CTITLE = {placed:'Waiting for Vaaradhi to accept', accepted:'Order accepted', packed:'Packed and ready', out:'On the way to you', delivered:'Delivered'};
const CTXT = {accepted:'Vaaradhi accepted your order and is packing it.', packed:'Your order is packed and waiting for the rider.', out:'Your order is on the way. About 20 min.', delivered:'Your order was delivered. Enjoy!'};
const orderAmt = items => items.reduce((a, i) => a + i.qty*P[i.prod].price, 0);
const itemsText = items => items.map(i => P[i.prod].name + ' × ' + i.qty).join(', ');
const isLive = o => o.status !== 'delivered' && o.status !== 'cancelled';
const nowOpen = () => S.phase !== 'locked';
const cartQty = id => (S.cart.find(c => c.prod === id) || {}).qty || 0;

/* ---------- sim clock ---------- */
function simMin(){
  if (S.phase === 'locked') return 21*60 + 1 + Math.floor((Date.now() - S.lockedAt) / 60000);
  if (S.phase === 'delivered') return null;
  return Math.min(20*60 + 58, 19*60 + 42 + Math.floor((Date.now() - S.simStart) / 60000));
}
function clock(){
  const m = simMin(); if (m == null) return '8:04 AM';
  let h = Math.floor(m/60) % 24; const mm = m % 60, ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return h + ':' + String(mm).padStart(2,'0') + ' ' + ap;
}
function leftText(){ const l = 21*60 - simMin(), h = Math.floor(l/60), mm = l % 60; return (h ? h + 'h ' : '') + mm + 'm left'; }

/* ---------- notifications ---------- */
let mTimer, cTimer;
function notify(text, kind, key){
  if (key && S.feed[0] && S.feed[0].key === key){ S.feed[0].text = text; S.feed[0].t = clock(); }
  else { S.feed.unshift({t:clock(), text, kind, key}); if (ui.view !== 'merchant') S.unread++; }
  ui.mToast = {text, kind, id:Date.now() + Math.random()};
  clearTimeout(mTimer); mTimer = setTimeout(() => { ui.mToast = null; render(); }, 4200);
}
function toastC(text){
  ui.cToast = {text, id:Date.now() + Math.random()};
  clearTimeout(cTimer); cTimer = setTimeout(() => { ui.cToast = null; render(); }, 3400);
}

/* ---------- icons ---------- */
const I = {
  home:'<path d="M3 11l9-7 9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  sun:'<path d="M3 18h18"/><path d="M7 18a5 5 0 0 1 10 0"/><path d="M12 5v3M5.2 9.2l2 2M18.8 9.2l-2 2"/>',
  wallet:'<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.2"/>',
  list:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M8.5 12h7M8.5 16h5"/>',
  truck:'<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.8-3.2 3.2-5 6-5s5.2 1.8 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.6M18 14.5c1.6.6 2.7 2 3 4.5"/>',
  receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  chart:'<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15l3.5-4 3 2.5L20 7"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  pin:'<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  down:'<path d="M6 9l6 6 6-6"/>',
  repeat:'<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  plane:'<path d="M10.5 13.5L3 11l1.5-1.5 7 1 4.5-4.5a2 2 0 0 1 3 3l-4.5 4.5 1 7L18 21l-2.5-7.5L12 17v3l-1.5 1.5-1-4-4-1L7 15h3z"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  bag:'<path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
};
const icon = (k, sz = 0) => `<svg ${sz ? `width="${sz}" height="${sz}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg>`;
const FEED_IC = {order:'bag', new:'repeat', add:'plus', pause:'plane', skip:'x', cancel:'x', lock:'lock', resume:'check'};
const nav = (tabs, cur, act, badges = {}) => `<nav class="nav">${tabs.map(([k,label,ic]) => `<button class="${cur===k?'on':''}" data-a="${act}" data-v="${k}">${icon(ic)}${label}${badges[k] ? `<i class="nb">${badges[k]}</i>` : ''}</button>`).join('')}</nav>`;
/* Product visual: Vaaradhi's photo in the local meeting copy (assetMode 'brand'), otherwise a neutral tile. */
function brandSrc(p){ const m = BRAND && CFG.brandAssets && CFG.brandAssets.productImages; return m && m[p.id] ? CFG.brandAssets.productImageDir + m[p.id] : null; }
const initialsOf = name => name.replace(/\(.*?\)/g, '').split(/\s+/).filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
function visual(p){ const src = brandSrc(p); return src ? `<img src="${src}" alt="" loading="lazy">` : `<span class="ph" style="--c:${CATMAP[p.category].color}" aria-hidden="true"><b>${initialsOf(p.name)}</b></span>`; }
function catVisual(name){ const c = CAT_LIST.find(x => x.name === name), p = BRAND && PRODUCTS.find(x => x.category === c.id && brandSrc(x));
  return p ? `<img src="${brandSrc(p)}" alt="">` : `<span class="ph" style="--c:${c.color}" aria-hidden="true"><b>${c.shortName[0]}</b></span>`; }
const thumb = (p, sz = '') => `<span class="th ${sz}">${visual(p)}</span>`;
const demoTag = () => '<span class="demo" title="Simulated for this demo. No real money moves.">Demo</span>';
const qbtn = (a, id, q, lt) => `<div class="qbtn ${lt ? 'lt' : ''}"><button data-a="${a}" data-v="${id}|-1" aria-label="Less">−</button><b>${q}</b><button data-a="${a}" data-v="${id}|1" aria-label="More">+</button></div>`;
function avatar(id){ const [bg, fg] = AV_COLORS[CUSTOMERS.findIndex(c => c.id === id) % AV_COLORS.length].split('|'); return `<span class="av" style="background:${bg};color:${fg}">${initials(id)}</span>`; }
function toastHTML(t, which){
  if (!t) return '';
  const still = ui.shownToast[which] === t.id ? ' still' : ''; ui.shownToast[which] = t.id;
  if (which === 'm') return `<div class="toast m${still}" role="status"><span class="ti">${icon(FEED_IC[t.kind] || 'bell', 16)}</span><div><small>Live update</small>${t.text}</div></div>`;
  return `<div class="toast c${still}" role="status">${t.text}</div>`;
}

/* =====================================================================
   CUSTOMER APP
   ===================================================================== */
function card(p, mine){
  const q = cartQty(p.id);
  const add = !nowOpen() ? `<button class="addbtn" disabled>ADD</button>`
    : q ? qbtn('cq', p.id, q) : `<button class="addbtn" data-a="cq" data-v="${p.id}|1">ADD</button>`;
  return `<div class="pc">
    <button class="pc-img" data-a="buy-open" data-v="${p.id}|now" aria-label="${p.name}">${visual(p)}${mine ? `<span class="pc-tag">${FREQ[mine.freq]} plan</span>` : ''}</button>
    <span class="pc-eta">${icon('clock', 11)}${nowOpen() ? '45 MINS' : 'OPENS 7 AM'}</span>
    <div class="pc-name">${p.name}</div><div class="pc-unit">${p.unit}</div>
    <div class="pc-row"><b>${rs(p.price)}</b>${add}</div>
    ${subFreqs(p).length ? `<button class="pc-sub" data-a="buy-open" data-v="${p.id}|sub">${icon('repeat', 12)}Subscribe</button>` : '<span class="pc-sub off">One-time purchase</span>'}</div>`;
}
function heroBanner(){
  const pill = S.phase === 'open' ? `Plan tomorrow · ${leftText()}` : S.phase === 'locked' ? 'Tomorrow is locked · packing' : 'Delivered at 7:12 AM';
  return `<button class="hb" data-a="ctab" data-v="tmr"><div class="hb-in"><span class="hb-pill">${pill}</span>
    <b>Your regular basket, on a schedule</b><span>Set it once. Skip or pause anytime.</span><i>See tomorrow's basket ›</i></div></button>`;
}
function shopBody(){
  const mine = {}; S.subs.forEach(s => { if (s.cust === 'me' && !s.cancelledFrom) mine[s.prod] = s; });
  const q = ui.q.trim().toLowerCase();
  let list;
  if (q){
    const hits = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
    list = `<div class="sec-h"><h3>Results for “${esc(ui.q.trim())}”</h3></div><div class="grid">${hits.map(p => card(p, mine[p.id])).join('') || '<div class="empty">Nothing matches that yet.</div>'}</div>`;
  } else if (ui.cCat !== 'All'){
    list = `<div class="sec-h"><h3>${ui.cCat}</h3><button data-a="cat" data-v="All">Show all</button></div><div class="grid">${PRODUCTS.filter(p => p.cat === ui.cCat).map(p => card(p, mine[p.id])).join('')}</div>`;
  } else {
    list = CATS.slice(1).map(c => `<div class="sec-h"><h3>${c}</h3><button data-a="cat" data-v="${c}">See all ›</button></div>
      <div class="rail">${PRODUCTS.filter(p => p.cat === c).map(p => card(p, mine[p.id])).join('')}</div>`).join('');
  }
  return `${q ? '' : heroBanner()}
    <div class="cats">${CATS.map(c => `<button class="cat ${ui.cCat === c && !q ? 'on' : ''}" data-a="cat" data-v="${c}"><span class="cat-i">${c === 'All' ? '<b>All</b>' : catVisual(c)}</span>${c === 'All' ? 'All' : CAT_SHORT[c]}</button>`).join('')}</div>
    ${list}<div style="height:${S.cart.length ? 90 : 20}px"></div>`;
}
function ordersBody(){
  const mine = S.orders.filter(o => o.cust === 'me').sort((a,b) => b.id - a.id);
  const active = mine.filter(isLive), past = mine.filter(o => !isLive(o));
  const track = o => { const i = FLOW.indexOf(o.status); return `<div class="tk">
      <div class="tk-top"><div><small>Order #${o.id} · ${o.t}</small><b>${CTITLE[o.status]}</b></div><span class="eta">${o.status === 'placed' ? 'Just now' : o.status === 'out' ? '~20 min' : '45 – 60 min'}</span></div>
      <div class="tk-bar">${FLOW.map((_,k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="tk-steps">${['Placed','Accepted','Packed','On the way','Delivered'].map((l,k) => `<span class="${k <= i ? 'on' : ''}">${l}</span>`).join('')}</div>
      <div class="tk-items">${o.items.map(it => `<span class="tk-it">${thumb(P[it.prod],'sm')}${P[it.prod].name.split(' ').slice(-2).join(' ')} × ${it.qty}</span>`).join('')}</div>
      <div class="tk-foot"><span>${rs(o.amt)} · paid from wallet</span>${o.status === 'placed' ? `<button class="lnk red" data-a="o-cancel" data-v="${o.id}">Cancel order</button>` : ''}</div></div>`; };
  return `${active.length ? '<div class="sh" style="padding-top:4px">On the way</div>' + active.map(track).join('')
      : `<div class="note" style="margin-top:4px">No orders on the way. ${nowOpen() ? 'Tap <b>ADD</b> on anything in Home to get it in 45 minutes.' : 'Same-day delivery opens again at 7:00 AM.'}</div>`}
    ${past.length ? '<div class="sh">Earlier today</div><div class="box">' + past.map(o => `<div class="row">${thumb(P[o.items[0].prod])}<div class="t"><b>#${o.id} · ${o.items.length} item${o.items.length > 1 ? 's' : ''}</b><small>${o.t} · ${OLBL[o.status]}</small></div><b>${rs(o.amt)}</b></div>`).join('') + '</div>' : ''}
    <div class="spacer"></div>`;
}
function vacRangeText(v){ return v.to ? `${fmtS(v.from)} – ${fmtS(v.to)}` : `from ${fmtS(v.from)} until you resume`; }
function tomorrowBody(){
  const open = S.phase === 'open', my = lines().filter(l => l.cust === 'me'), delivered = S.phase === 'delivered';
  const rows = my.map(l => {
    const p = P[l.prod], off = l.status !== 'ok';
    const sub = l.kind === 'extra' ? '<span class="chip b">Just tomorrow</span>' : FREQ[l.freq];
    let right;
    if (off) right = `<div class="rt"><span class="chip y">${l.status === 'paused' ? 'Paused' : 'Skipped'} · ₹0</span>${open && l.status === 'skipped' ? `<button class="lnk" data-a="t-skip" data-v="${l.subId}">Undo</button>` : ''}</div>`;
    else if (open) right = `<div class="rt">${qbtn(l.kind === 'extra' ? 'x-qty' : 't-qty', l.kind === 'extra' ? l.xid : l.subId, l.qty, true)}${l.kind === 'extra' ? `<button class="lnk red" data-a="x-del" data-v="${l.xid}">Remove</button>` : `<button class="lnk" data-a="t-skip" data-v="${l.subId}">Skip</button>`}</div>`;
    else right = `<div class="rt"><b>${rs(l.amt)}</b>${delivered ? '<span class="chip g">Delivered</span>' : `<small style="color:var(--muted);font-weight:600">× ${l.qty}</small>`}</div>`;
    return `<div class="row ${off ? 'off' : ''}">${thumb(p)}<div class="t"><b>${p.name}</b><small>${sub}${open && !off ? ` · ${rs(l.amt)}` : ''}</small></div>${right}</div>`;
  }).join('') || `<div class="row"><div class="t"><small>Nothing scheduled for tomorrow.</small></div></div>`;
  const charge = my.filter(l => l.status === 'ok').reduce((a,l) => a + l.amt, 0);
  const saved = my.filter(l => l.status !== 'ok').reduce((a,l) => a + l.amt, 0);
  const v = S.vac.me;
  const cd = open ? `<span class="cd">${leftText()} to edit</span>` : S.phase === 'locked' ? `<span class="cd lk">${icon('lock', 11)} Locked</span>` : '<span class="cd dn">Delivered</span>';
  const vac = v
    ? `<div class="vac on"><span class="vi">${icon('plane', 20)}</span><div><b>Vacation mode is on</b><small>${vacRangeText(v)}. Vaaradhi has been told and you won't be charged for these days.</small><button class="vb" data-a="vac-end">I'm back, resume</button></div></div>`
    : `<button class="vac" data-a="vac-open"><span class="vi">${icon('plane', 20)}</span><div><b>Going out of town?</b><small>Pause all deliveries for a few days. You pay nothing while you're away.</small></div></button>`;
  const plans = S.subs.filter(s => s.cust === 'me').map(s => {
    const p = P[s.prod];
    let st = ['Active','g'];
    if (s.cancelledFrom) st = ['Cancelled from ' + fmtS(s.cancelledFrom), 'r'];
    else if (s.pausedFrom) st = ['Paused from ' + fmtS(s.pausedFrom), 'y'];
    else if (v && (!v.to || v.to >= TMR)) st = ['Paused for vacation', 'y'];
    else if (s.start > TDY && s.isNew) st = ['Starts ' + fmtS(firstDelivery(s)), 'b'];
    const btns = s.cancelledFrom ? '' :
      `${s.pausedFrom ? `<button class="lnk" data-a="p-resume" data-v="${s.id}">Resume</button>` : `<button class="lnk" data-a="p-pause" data-v="${s.id}">Pause</button>`}
       <button class="lnk red" data-a="p-cancel" data-v="${s.id}">${ui.confirmCancel === s.id ? 'Tap to confirm' : 'Cancel'}</button>`;
    return `<div class="row">${thumb(p)}<div class="t"><b>${p.name} × ${s.qty}</b><small>${FREQ[s.freq]} · ${rs(s.qty*p.price)} a delivery</small><span class="chip ${st[1]}" style="margin-top:4px">${st[0]}</span></div><div class="rt">${btns}</div></div>`;
  }).join('');
  return `<div class="tm"><div class="tm-top"><div><small>Tomorrow · ${fmtD(TMR)}</small><b>6:30 – 8:00 AM</b></div>${cd}</div>
      <div class="tm-body">${rows}</div>
      <div class="tm-foot"><span>Tomorrow's charge</span><span>${rs(charge)}</span></div></div>
    ${saved ? `<div class="save">${rs(saved)} not charged because of skips or pauses</div>` : ''}
    ${vac}
    <div class="sh">My plans</div>
    <div class="box">${plans || '<div class="row"><div class="t"><small>No plans yet.</small></div></div>'}</div>
    <p class="fine">Change, skip or pause anything until ${CUTOFF} the night before. After that, changes apply from the following day.</p>
    <div class="spacer"></div>`;
}
function walletBody(){
  const charge = lines().filter(l => l.cust === 'me' && l.status === 'ok').reduce((a,l) => a + l.amt, 0);
  const sorted = [...S.ledger].sort((a,b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.seq - a.seq));
  let html = '', last = '';
  sorted.forEach(l => {
    if (l.date !== last){ last = l.date; html += `<div class="ld">${l.date === TDY ? 'Today' : l.date === iso(addD(-1)) ? 'Yesterday' : fmtD(l.date)}</div>`; }
    html += `<div class="lg"><span>${l.text}</span><span class="amt ${l.kind}">${sgn(l.amt)}</span></div>`;
  });
  return `<div class="wc"><small>Vaaradhi wallet balance ${demoTag()}</small><b>${rs(balance())}</b>
      <div class="wc-row"><span>${S.phase === 'delivered' ? 'Charged this morning' : 'Tomorrow\'s charge'}</span><span>${rs(charge)}</span></div></div>
    <div class="topups">${[500,1000,2000].map(a => `<button data-a="topup" data-v="${a}">+ ${rs(a)}</button>`).join('')}</div>
    <div class="note">Demo only: balances and top-ups are simulated and no real payment happens. In the proposed setup, customers are charged only on days something is delivered, paused or skipped days cost ₹0, and the balance is held by Vaaradhi Farms.</div>
    <div class="sh">History</div>
    <div class="box">${html}</div>
    <div class="spacer"></div>`;
}
function sheetHTML(){
  const sh = ui.sheet; if (!sh) return '';
  let inner = '', foot = '';
  if (sh.type === 'buy'){
    const p = P[sh.prod], q = sh.qty;
    const modes = [['now','Now', nowOpen() ? '45 – 60 min' : 'Closed now'], ['tmr','Tomorrow','6:30 – 8 AM'], ['sub','Subscribe','Repeat it']].filter(m => m[0] !== 'sub' || subFreqs(p).length);
    let body = '';
    if (sh.mode === 'now'){
      body = `<div class="fld r"><label>QUANTITY</label>${qbtn('s-qty','q',q)}</div>
        <div class="info">${icon('clock', 16)}${nowOpen() ? 'Arrives today in 45 – 60 min · Home, Manikonda' : 'Same-day delivery opens again at 7:00 AM'}</div>`;
      foot = `<button class="cta" data-a="cart-add" ${nowOpen() ? '' : 'disabled'}><span>${rs(p.price*q)}<small>TOTAL</small></span><span>Add to cart ›</span></button>`;
    } else if (sh.mode === 'tmr'){
      body = `<div class="fld r"><label>QUANTITY</label>${qbtn('s-qty','q',q)}</div>
        <div class="info">${icon('sun', 16)}${S.phase === 'open' ? `Tomorrow, ${fmtD(TMR)}, 6:30 – 8:00 AM with your usual basket` : `Tomorrow's basket is locked. Choose Subscribe to start from ${fmtD(DAT)}.`}</div>`;
      foot = `<button class="cta" data-a="add-go" ${S.phase !== 'open' ? 'disabled' : ''}><span>${rs(p.price*q)}<small>FOR TOMORROW</small></span><span>Add to tomorrow ›</span></button>`;
    } else {
      const starts = S.phase === 'open' ? [[TMR,'Tomorrow'],[DAT,fmtD(DAT)]] : [[DAT,fmtD(DAT)],[iso(addD(3)),fmtD(iso(addD(3)))]];
      body = `<div class="fld"><label>HOW OFTEN</label><div class="opts">${subFreqs(p).map(f => `<button class="${sh.freq === f ? 'on' : ''}" data-a="s-freq" data-v="${f}">${FREQ[f]}</button>`).join('')}</div></div>
        <div class="fld r"><label>QUANTITY</label>${qbtn('s-qty','q',q)}</div>
        <div class="fld"><label>START</label><div class="opts">${starts.map(([d,l]) => `<button class="${sh.start === d ? 'on' : ''}" data-a="s-start" data-v="${d}">${l}</button>`).join('')}</div></div>
        <div class="sumg"><div><span>Each delivery</span><b>${rs(p.price*q)}</b></div><div><span>About a month</span><b>${rs(p.price*q*PERMONTH[sh.freq])}</b></div></div>
        <div class="info">${icon('repeat', 16)}Delivered 6:30 – 8:00 AM. Skip or pause before ${CUTOFF} the night before. Pay only for days delivered.</div>`;
      foot = `<button class="cta c" data-a="sub-go">Start subscription</button>`;
    }
    inner = `<div class="ps-img">${visual(p)}<button class="x" data-a="close" aria-label="Close">×</button></div>
      <div class="ps-b"><div><div class="ps-name">${p.name}</div><div class="ps-meta"><span>${p.unit}</span><b>${rs(p.price)}</b></div></div>
      <div class="modes">${modes.map(([k,l,sub]) => `<button class="${sh.mode === k ? 'on' : ''}" data-a="mode" data-v="${k}"><b>${l}</b><small>${sub}</small></button>`).join('')}</div>
      ${body}</div>`;
  } else if (sh.type === 'cart'){
    const total = orderAmt(S.cart), bal = balance();
    inner = `<div class="sh-pad"><div class="sh-title">Your cart</div>
      <div class="info">${icon('clock', 16)}Delivery in 45 – 60 min · Home, Manikonda</div>
      <div class="box">${S.cart.map(c => { const p = P[c.prod]; return `<div class="row">${thumb(p)}<div class="t"><b>${p.name}</b><small>${p.unit}</small></div><div class="rt">${qbtn('c-qty', c.prod, c.qty, true)}<b>${rs(p.price*c.qty)}</b></div></div>`; }).join('')}</div>
      <div class="box bill"><div><span>Item total</span><span>${rs(total)}</span></div><div><span>Delivery fee</span><span class="free">FREE</span></div><div class="bt"><span>To pay</span><span>${rs(total)}</span></div></div>
      <div class="info">${icon('wallet', 16)}Paying from Vaaradhi wallet · balance ${rs(bal)}${bal < total ? ' · simulated UPI top-up' : ''} ${demoTag()}</div>
      <p class="fine" style="margin-top:0">You can cancel until Vaaradhi accepts your order.</p></div>`;
    foot = `<button class="cta" data-a="place" ${nowOpen() && S.cart.length ? '' : 'disabled'}><span>${rs(total)}<small>TOTAL</small></span><span>Place order ›</span></button>`;
  } else if (sh.type === 'vac'){
    const from = editFrom(), len = sh.len, days = len || 7;
    let n = 0, amt = 0;
    for (let i = 0; i < days; i++){ const d = plus(from, i); S.subs.forEach(s => { if (s.cust === 'me' && delivers(s,d) && !s.pausedFrom){ n++; amt += s.qty*P[s.prod].price; } }); }
    const to = len ? plus(from, len-1) : null;
    inner = `<div class="sh-pad"><div class="sh-title">Going out of town?</div>
      <div class="box" style="padding:14px;display:flex;flex-direction:column;gap:12px">
        <div class="fld"><label>PAUSE FOR</label><div class="opts">${[[3,'3 days'],[7,'1 week'],[14,'2 weeks'],[0,'Until I\'m back']].map(([k,l]) => `<button class="${len === k ? 'on' : ''}" data-a="vac-len" data-v="${k}">${l}</button>`).join('')}</div></div>
        <div class="sumg"><div><span>Paused</span><b style="font-size:15px">${to ? fmtS(from) + ' – ' + fmtS(to) : 'From ' + fmtS(from)}</b></div><div><span>${len ? 'Not charged' : 'Saved each week'}</span><b>${rs(amt)}</b></div></div></div>
      <div class="info">${icon('bell', 16)}${n} deliveries will be skipped. Vaaradhi is told right away, so nothing is packed for you.${S.phase !== 'open' ? ` Tomorrow is already locked, so the pause starts ${fmtD(DAT)}.` : ''}</div></div>`;
    foot = `<button class="cta c" data-a="vac-go">Pause deliveries</button>`;
  }
  return `<div class="scrim" data-a="close"></div><div class="sheet" role="dialog"><div class="sheet-sc">${inner}</div>${foot ? `<div class="sh-foot">${foot}</div>` : ''}</div>`;
}
function custHTML(){
  const t = ui.cTab;
  const head = t === 'shop'
    ? `<div class="ch"><div class="ch-top"><div><div class="ch-eta">${nowOpen() ? 'Delivery in <em>45 min</em>' : 'Closed · opens <em>7 AM</em>'}</div>
        <div class="ch-addr">${icon('pin', 13)}Home · Manikonda, Hyderabad${icon('down', 13)}</div></div><div class="ch-av">AR</div></div>
        <label class="search">${icon('search', 18)}<input id="q" type="search" placeholder="Search oils, millets, dals…" value="${esc(ui.q)}" autocomplete="off" aria-label="Search products"></label></div>`
    : `<div class="ct"><h2>${{orders:'Your orders', tmr:'Plans & tomorrow', wallet:'Wallet'}[t]}</h2><p>${{orders:'Same-day orders, tracked live', tmr:'Your morning deliveries from Vaaradhi', wallet:'Prepaid balance with Vaaradhi Farms'}[t]}</p></div>`;
  const body = t === 'shop' ? shopBody() : t === 'orders' ? ordersBody() : t === 'tmr' ? tomorrowBody() : walletBody();
  const n = S.cart.reduce((a,c) => a + c.qty, 0);
  const cart = t === 'shop' && n ? `<button class="cartbar" data-a="cart-open"><span class="cb-th">${S.cart.slice(0,3).map(c => `<span class="cbv">${visual(P[c.prod])}</span>`).join('')}</span>
      <span class="cb-t"><b>View cart</b><small>${n} item${n > 1 ? 's' : ''} · ${rs(orderAmt(S.cart))}</small></span><span class="cb-go">›</span></button>` : '';
  return `<div class="body" data-scroll="c-${t}">${head}${body}</div>${cart}
    ${nav([['shop','Home','home'],['orders','Orders','bag'],['tmr','Plans','sun'],['wallet','Wallet','wallet']], t, 'ctab', {orders:S.orders.filter(o => o.cust === 'me' && isLive(o)).length})}
    ${toastHTML(ui.cToast,'c')}${sheetHTML()}`;
}

/* =====================================================================
   VAARADHI (MERCHANT) APP
   ===================================================================== */
function trackChanges(pr, k){
  const now = Date.now();
  if (ui.prevPrep){
    new Set([...Object.keys(pr), ...Object.keys(ui.prevPrep)]).forEach(id => {
      const d = (pr[id]||0) - (ui.prevPrep[id]||0); if (d) ui.flash['p_'+id] = {d, until:now+3500};
    });
    Object.keys(k).forEach(id => { const d = k[id] - ui.prevKpi[id]; if (d) ui.flash['k_'+id] = {d, until:now+3500}; });
    if (Object.values(ui.flash).some(f => f.until === now + 3500)) setTimeout(render, 3600);
  }
  ui.prevPrep = pr; ui.prevKpi = k;
}
const fl = key => { const f = ui.flash[key]; return f && f.until > Date.now() ? f : null; };
const deltaHTML = (f, money) => f ? `<span class="delta ${f.d > 0 ? 'up' : ''}">${f.d > 0 ? '+' : '−'}${money ? rs(Math.abs(f.d)) : Math.abs(f.d)}</span>` : '';
function mOrders(){
  const all = [...S.orders].sort((a,b) => b.id - a.id);
  const live = all.filter(isLive), done = all.filter(o => o.status === 'delivered'), paid = all.filter(o => o.status !== 'cancelled');
  const its = o => `<div class="ord-its">${o.items.map(it => `<span class="tk-it">${thumb(P[it.prod],'sm')}${P[it.prod].name.split(' ').slice(-2).join(' ')} × ${it.qty}</span>`).join('')}</div>`;
  const card = o => `<div class="ord ${o.status === 'placed' ? 'new' : ''}">
      <div class="ord-top"><div style="display:flex;gap:10px;align-items:center">${avatar(o.cust)}<div><b>${C[o.cust].name}${o.cust === 'me' ? '<span class="you">demo</span>' : ''}</b><small>#${o.id} · ${C[o.cust].area} · ${o.t}</small></div></div>
        <div class="ord-amt">${rs(o.amt)}<br><span class="chip ${o.status === 'placed' ? 'y' : 'b'}">${o.status === 'placed' ? 'NEW · PAID' : OLBL[o.status]}</span></div></div>
      ${its(o)}
      <div class="ord-act"><button class="bigbtn ${o.status === 'placed' ? '' : 'dk'}" data-a="oadv" data-v="${o.id}">${NEXT[o.status]}</button></div></div>`;
  return `<div class="stats"><div class="stat"><span>Orders today</span><b>${paid.length}</b></div><div class="stat"><span>In progress</span><b>${live.length}</b></div><div class="stat"><span>Paid</span><b>${rs(paid.reduce((a,o) => a + o.amt, 0))}</b></div></div>
    <div class="sh">${nowOpen() ? 'Live orders · open till 9 PM' : 'Closed for tonight · opens 7 AM'}</div>
    ${live.length ? live.map(card).join('') : '<div class="note" style="margin-top:0">No open orders right now.</div>'}
    ${done.length ? '<div class="sh">Delivered today</div>' + done.map(o => `<div class="ord past"><div class="ord-top"><div style="display:flex;gap:10px;align-items:center">${avatar(o.cust)}<div><b>${C[o.cust].name}</b><small>#${o.id} · ${itemsText(o.items)}</small></div></div><div class="ord-amt">${rs(o.amt)}</div></div></div>`).join('') : ''}
    <p class="fine">Every order is paid in the app before you accept it. No cash on delivery and nothing to confirm on WhatsApp.</p><div class="spacer"></div>`;
}
function mToday(){
  const st = stops(), pr = prep(), items = Object.values(pr).reduce((a,b) => a+b, 0), rev = st.reduce((a,s) => a+s.amt, 0);
  const off = lines().filter(l => l.status !== 'ok'), offQty = off.reduce((a,l) => a+l.qty, 0), offAmt = off.reduce((a,l) => a+l.amt, 0);
  const sub = S.phase === 'open' ? `List locks at ${CUTOFF} · ${leftText()}` : S.phase === 'locked' ? 'Locked at 9:00 PM · pack by 6:00 AM' : 'All deliveries done';
  const kpi = (key, label, val, money) => { const f = fl('k_'+key); return `<div class="${f ? 'chg' : ''}"><span>${label}</span><b>${money ? rs(val) : val}</b>${deltaHTML(f, money)}</div>`; };
  const rows = PRODUCTS.filter(p => pr[p.id] || fl('p_'+p.id)).map(p => {
    const f = fl('p_'+p.id);
    return `<div class="row ${f ? 'chg' : ''}">${thumb(p)}<div class="t"><b>${p.name}</b><small>${p.unit}</small></div><div class="q">${deltaHTML(f)}× ${pr[p.id] || 0}</div></div>`;
  }).join('');
  return `<div class="mcard"><small>Tomorrow · ${fmtD(TMR)}</small><div class="big">${sub}</div>
      <div class="mstats">${kpi('stops','Deliveries',st.length)}${kpi('items','Items to pack',items)}${kpi('rev','Revenue',rev,true)}</div></div>
    ${offQty ? `<div class="saved"><b>${offQty} items not packed</b> because customers paused or skipped (${rs(offAmt)}). Nothing is made that won't be paid for.</div>` : ''}
    <div class="sh">Prep sheet</div>
    <div class="box prep">${rows}</div>
    <div class="sh">Live updates</div>
    <div class="box feed">${S.feed.slice(0,10).map(f => `<div class="fi ${f.kind}"><span class="d">${icon(FEED_IC[f.kind] || 'bell', 14)}</span><span class="tx">${f.text}</span><time>${f.t}</time></div>`).join('')}</div>
    <div class="spacer"></div>`;
}
function mRun(){
  const st = stops(), done = st.filter(s => S.done[s.cust]).length, open = S.phase === 'open';
  const groups = AREAS.map(a => [a, st.filter(s => s.area === a)]).filter(g => g[1].length);
  const away = [...new Set(lines().filter(l => l.status !== 'ok').map(l => l.cust))].filter(c => !st.find(s => s.cust === c));
  return `<div class="prog"><div class="pr"><span>${done} of ${st.length} delivered</span><span>${rs(st.filter(s => S.done[s.cust]).reduce((a,s) => a+s.amt, 0))}</span></div><div class="bar"><i style="width:${st.length ? done/st.length*100 : 0}%"></i></div>
      <small>${open ? `Preview. Customers can still make changes until ${CUTOFF}.` : S.phase === 'locked' ? 'Locked. Mark each stop as it\'s delivered.' : 'Morning run complete.'}</small></div>
    ${groups.map(([a, list]) => `<div class="area">${a}<span>${list.length} stop${list.length > 1 ? 's' : ''}</span></div>
      ${list.map(s => `<div class="stop ${s.cust === 'me' ? 'me' : ''} ${S.done[s.cust] ? 'done' : ''}">${avatar(s.cust)}<div class="t"><b>${C[s.cust].name}${s.cust === 'me' ? '<span class="you">demo</span>' : ''}</b>
        <small>${s.lines.map(l => P[l.prod].name + ' × ' + l.qty).join(', ')}</small></div>
        <div class="rt"><b>${rs(s.amt)}</b>${S.done[s.cust] ? '<span class="chip g">Delivered</span>' : `<button class="sbtn" data-a="deliver" data-v="${s.cust}" ${open ? 'disabled' : ''}>Mark delivered</button>`}</div></div>`).join('')}`).join('')}
    ${away.length ? `<div class="area">Not on tomorrow's run<span>${away.length}</span></div>${away.map(c => `<div class="stop away">${avatar(c)}<div class="t"><b>${C[c].name}</b><small>${C[c].area} · ${S.vac[c] ? 'away, paused by customer' : 'paused or skipped by customer'}</small></div><span class="chip y">₹0</span></div>`).join('')}` : ''}
    <div class="spacer"></div>`;
}
function mCustomers(){
  const list = CUSTOMERS.map(c => {
    const subs = S.subs.filter(s => s.cust === c.id && !s.cancelledFrom);
    const v = S.vac[c.id], vOn = v && (!v.to || v.to >= TMR);
    const allPaused = subs.length && subs.every(s => s.pausedFrom);
    const isNew = subs.some(s => s.isNew);
    const st = vOn ? [v.to ? 'Away till ' + fmtS(v.to) : 'Away', 'y'] : allPaused ? ['Paused','y'] : isNew ? ['New plan','b'] : subs.length ? ['Active','g'] : ['No plans','y'];
    return {c, subs, st};
  });
  const active = list.filter(x => x.st[1] !== 'y').length;
  return `<div class="stats"><div class="stat"><span>Subscribers</span><b>${list.length}</b></div><div class="stat"><span>Active</span><b>${active}</b></div><div class="stat"><span>Paused</span><b>${list.length - active}</b></div></div>
    <div class="sh">All customers</div>
    <div class="box">${list.map(({c, subs, st}) => `<div class="row">${avatar(c.id)}<div class="t"><b>${c.name}${c.id === 'me' ? '<span class="you">demo</span>' : ''}</b>
      <small>${c.area} · ${subs.map(s => P[s.prod].name.split(' ').slice(-2).join(' ') + ' × ' + s.qty).join(', ') || 'No active plans'}</small></div><span class="chip ${st[1]}">${st[0]}</span></div>`).join('')}</div>
    <div class="note">Bring your WhatsApp regulars onto the app and their orders show up here automatically.</div><div class="spacer"></div>`;
}
function mEarnings(){
  const start = iso(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1, 12));
  let mtd = 0, n = 0;
  for (let d = start; d <= TDY; d = plus(d, 1)){ const r = dayRevenue(d); mtd += r.amt; n += r.n; }
  const st = stops(), collected = st.filter(s => S.done[s.cust]).reduce((a,s) => a+s.amt, 0), expected = st.reduce((a,s) => a+s.amt, 0);
  const monthName = TODAY.toLocaleDateString('en-IN', {month:'long'});
  const inst = S.orders.filter(o => o.status !== 'cancelled'), instAmt = inst.reduce((a,o) => a + o.amt, 0);
  let setl = '';
  const ln = (a, b, amt, cls = '') => `<div class="row"><div class="t"><b>${a}</b><small>${b}</small></div><b class="amt ${cls}">${rs(amt)}</b></div>`;
  if (collected) setl += ln('Collected this morning', 'Settling to your account', collected);
  setl += ln('Today\'s one-time orders', 'Settling to your account', instAmt);
  setl += ln('Today\'s subscription deliveries', 'Settling to your account', dayRevenue(TDY).amt);
  for (let k = 1; k <= 5; k++){ const d = iso(addD(-k)); setl += ln(fmtD(d) + ' deliveries', 'Settled to your account', dayRevenue(d).amt, 'in'); }
  return `<div class="mcard"><small>App orders in ${monthName} ${demoTag()}</small><div class="big" style="font-size:34px;margin-bottom:4px">${rs(mtd + collected + instAmt)}</div>
      <small>${n + st.filter(s => S.done[s.cust]).length} subscription deliveries and ${inst.length} one-time orders</small></div>
    <div class="stats" style="grid-template-columns:1fr 1fr"><div class="stat"><span>Aggregator commission</span><b>₹0</b></div><div class="stat"><span>${S.phase === 'delivered' ? 'Collected today' : 'Tomorrow, expected'}</span><b>${rs(S.phase === 'delivered' ? collected : expected)}</b></div></div>
    <div class="sh">Collections · demo data</div>
    <div class="box">${setl}</div>
    <p class="fine">All figures on this screen are simulated sample data. No payment integration is connected. In the proposed setup, payments would settle to Vaaradhi's own payment-provider account, and Scribr would keep the records without holding funds.</p>
    <div class="spacer"></div>`;
}
function merchHTML(){
  const st = stops(), pr = prep();
  trackChanges(pr, {stops:st.length, items:Object.values(pr).reduce((a,b) => a+b, 0), rev:st.reduce((a,s) => a+s.amt, 0)});
  const pill = S.phase === 'open' ? ['Open',''] : S.phase === 'locked' ? ['Locked','lk'] : ['Run done','dn'];
  const t = ui.mTab;
  const body = t === 'orders' ? mOrders() : t === 'today' ? mToday() : t === 'run' ? mRun() : t === 'cust' ? mCustomers() : mEarnings();
  return `<div class="mh">${BRAND && CFG.brandAssets.logo ? `<span class="lg2 img"><img src="${CFG.brandAssets.logo}" alt="Vaaradhi Farms"></span>` : '<span class="lg2">VF</span>'}<div class="nm"><b>Vaaradhi Farms</b><small>Manikonda store · ${clock()}</small></div><span class="st-pill ${pill[1]}"><i></i>${pill[0]}</span></div>
    <div class="body mbody" data-scroll="m-${t}">${body}</div>
    ${nav([['orders','Orders','bag'],['today','Tomorrow','list'],['run','Run','truck'],['cust','Customers','people'],['earn','Earnings','chart']], t, 'mtab', {orders:S.orders.filter(o => o.status === 'placed').length})}
    ${toastHTML(ui.mToast,'m')}`;
}

/* =====================================================================
   RENDER + ACTIONS
   ===================================================================== */
function render(){
  const keep = {}; document.querySelectorAll('[data-scroll]').forEach(e => keep[e.dataset.scroll] = e.scrollTop);
  const a = document.activeElement, typing = a && a.id === 'q' ? a.selectionStart : null;
  document.getElementById('custApp').innerHTML = custHTML();
  document.getElementById('merchApp').innerHTML = merchHTML();
  document.querySelectorAll('[data-scroll]').forEach(e => { if (keep[e.dataset.scroll] != null) e.scrollTop = keep[e.dataset.scroll]; });
  if (typing != null){ const q = document.getElementById('q'); if (q){ q.focus(); q.setSelectionRange(typing, typing); } }
  document.body.dataset.view = ui.view;
  ['vCust','vMerch','vHow'].forEach((id,i) => document.getElementById(id).classList.toggle('on', ['customer','merchant','how'][i] === ui.view));
  const b = document.getElementById('bdg'); b.hidden = !S.unread; b.textContent = S.unread;
  document.getElementById('bLock').disabled = S.phase !== 'open';
  document.getElementById('bMorn').disabled = S.phase !== 'locked';
  document.getElementById('demoBtns').classList.toggle('open', ui.demoOpen);
  save();
}
function settle(){
  if (S.meSettled) return; S.meSettled = true;
  const mine = lines().filter(l => l.cust === 'me');
  mine.forEach(l => {
    const ok = l.status === 'ok';
    S.ledger.push({date:TMR, seq:S.seq++, amt: ok ? -l.amt : 0, kind: ok ? 'out' : 'zero',
      text: (ok ? 'Delivered' : l.status === 'paused' ? 'Paused, not charged' : 'Skipped, not charged') + ' · ' + P[l.prod].name + ' × ' + l.qty});
  });
  if (mine.some(l => l.status === 'ok')) toastC('Your Vaaradhi basket was delivered. Wallet updated.');
}
function finishRun(){
  S.phase = 'delivered'; settle();
  const st = stops();
  notify(`Morning run complete: ${st.length} deliveries, ${rs(st.reduce((a,s) => a+s.amt, 0))} collected into your payment account.`, 'lock');
}
const A = {
  view(v){ ui.view = v; ui.demoOpen = false; if (v === 'merchant') S.unread = 0; },
  demo(){ ui.demoOpen = !ui.demoOpen; },
  ctab(v){ ui.cTab = v; ui.sheet = null; ui.confirmCancel = null; },
  mtab(v){ ui.mTab = v; },
  cat(v){ ui.cCat = v; ui.q = ''; },
  close(){ ui.sheet = null; },
  'vac-open'(){ ui.sheet = {type:'vac', len:7}; },
  's-freq'(v){ ui.sheet.freq = v; },
  's-start'(v){ ui.sheet.start = v; },
  's-qty'(v){ ui.sheet.qty = Math.max(1, Math.min(6, ui.sheet.qty + +v.split('|')[1])); },
  'vac-len'(v){ ui.sheet.len = +v; },
  cq(v){
    if (!nowOpen()) return;
    const [prod, d] = v.split('|'), c = S.cart.find(x => x.prod === prod);
    if (c){ c.qty = Math.min(9, c.qty + +d); if (c.qty < 1) S.cart = S.cart.filter(x => x !== c); }
    else if (+d > 0) S.cart.push({prod, qty:1});
  },
  'sub-go'(){
    const sh = ui.sheet, p = P[sh.prod];
    const s = {id:'n'+Date.now(), cust:'me', prod:sh.prod, freq:sh.freq, qty:sh.qty, start:sh.start, pausedFrom:null, cancelledFrom:null, isNew:true};
    S.subs.push(s); ui.sheet = null;
    const fd = firstDelivery(s);
    notify(`Ananya R. subscribed to ${p.name} × ${s.qty} · ${FREQ[s.freq]} · starts ${fmtD(fd)}`, 'new');
    toastC(`Subscribed. First delivery ${fmtD(fd)}.`);
  },
  'add-go'(){
    if (S.phase !== 'open') return;
    const sh = ui.sheet; S.extras.push({id:Date.now(), cust:'me', prod:sh.prod, qty:sh.qty}); ui.sheet = null;
    notify(`Ananya R. added ${P[sh.prod].name} × ${sh.qty} for tomorrow`, 'add');
    toastC('Added to tomorrow\'s basket.');
  },
  'vac-go'(){
    const from = editFrom(), len = ui.sheet.len, to = len ? plus(from, len-1) : null;
    S.vac.me = {from, to}; ui.sheet = null;
    let n = 0; for (let i = 0; i < (len||7); i++){ const d = plus(from,i); S.subs.forEach(s => { if (s.cust === 'me' && delivers(s,d) && !s.pausedFrom) n++; }); }
    notify(`Ananya R. is away ${to ? fmtS(from)+' – '+fmtS(to) : 'from '+fmtS(from)+' until she resumes'}. ${n} deliveries removed${len ? '' : ' a week'}, no charge.`, 'pause');
    toastC(`Paused. Vaaradhi has been told and you won't be charged ${to ? 'from '+fmtS(from)+' to '+fmtS(to) : 'while you\'re away'}.`);
  },
  'vac-end'(){
    S.vac.me = null; const from = editFrom();
    notify(`Ananya R. is back. Deliveries resume ${fmtD(from)}.`, 'resume');
    toastC(`Welcome back. Deliveries resume ${fmtD(from)}.`);
  },
  't-qty'(v){
    if (S.phase !== 'open') return;
    const [id, d] = v.split('|'), s = S.subs.find(x => x.id === id), o = S.ovr[id] = S.ovr[id] || {};
    o.qty = Math.max(1, Math.min(6, (o.qty || s.qty) + +d)); o.skip = false;
    notify(`Ananya R. changed ${P[s.prod].name} to ${o.qty} for tomorrow`, 'add', 'q'+id);
  },
  'x-qty'(v){
    if (S.phase !== 'open') return;
    const [id, d] = v.split('|'), x = S.extras.find(e => String(e.id) === id);
    x.qty = Math.max(1, Math.min(6, x.qty + +d));
    notify(`Ananya R. changed ${P[x.prod].name} to ${x.qty} for tomorrow`, 'add', 'x'+id);
  },
  't-skip'(v){
    if (S.phase !== 'open') return;
    const s = S.subs.find(x => x.id === v), o = S.ovr[v] = S.ovr[v] || {}; o.skip = !o.skip;
    notify(o.skip ? `Ananya R. skipped ${P[s.prod].name} tomorrow` : `Ananya R. wants ${P[s.prod].name} tomorrow after all`, 'skip', 'k'+v);
  },
  'x-del'(v){
    if (S.phase !== 'open') return;
    const x = S.extras.find(e => String(e.id) === v); S.extras = S.extras.filter(e => e !== x);
    notify(`Ananya R. removed ${P[x.prod].name} from tomorrow`, 'skip');
  },
  'p-pause'(v){ const s = S.subs.find(x => x.id === v); s.pausedFrom = editFrom(); notify(`Ananya R. paused ${P[s.prod].name} from ${fmtD(s.pausedFrom)}`, 'pause'); toastC('Plan paused. Vaaradhi has been told.'); },
  'p-resume'(v){ const s = S.subs.find(x => x.id === v); s.pausedFrom = null; notify(`Ananya R. resumed ${P[s.prod].name} from ${fmtD(editFrom())}`, 'resume'); },
  'p-cancel'(v){
    if (ui.confirmCancel !== v){ ui.confirmCancel = v; return; }
    const s = S.subs.find(x => x.id === v); s.cancelledFrom = editFrom(); ui.confirmCancel = null;
    notify(`Ananya R. cancelled ${P[s.prod].name} from ${fmtD(s.cancelledFrom)}`, 'cancel'); toastC('Plan cancelled.');
  },
  'buy-open'(v){ const [prod, mode] = v.split('|'), fs = subFreqs(P[prod]); ui.sheet = {type:'buy', prod, mode: mode === 'sub' && !fs.length ? 'now' : mode, qty:1, freq: fs[0] || 'daily', start:editFrom()}; },
  mode(v){ ui.sheet.mode = v; },
  'cart-add'(){
    if (!nowOpen()) return;
    const sh = ui.sheet, ex = S.cart.find(c => c.prod === sh.prod);
    if (ex) ex.qty = Math.min(9, ex.qty + sh.qty); else S.cart.push({prod:sh.prod, qty:sh.qty});
    ui.sheet = null; toastC(`${P[sh.prod].name} added to cart.`);
  },
  'cart-open'(){ ui.sheet = {type:'cart'}; },
  'c-qty'(v){
    const [prod, d] = v.split('|'), c = S.cart.find(x => x.prod === prod); if (!c) return;
    c.qty = Math.min(9, c.qty + +d); if (c.qty < 1) S.cart = S.cart.filter(x => x !== c);
    if (!S.cart.length) ui.sheet = null;
  },
  place(){
    if (!nowOpen() || !S.cart.length) return;
    const items = S.cart.map(c => ({...c})), amt = orderAmt(items), id = S.oseq++, bal = balance();
    if (bal < amt) S.ledger.push({date:TDY, seq:S.seq++, text:'Added to wallet via UPI', amt:Math.ceil((amt - bal)/500)*500, kind:'in'});
    S.ledger.push({date:TDY, seq:S.seq++, text:`Order #${id} · ${itemsText(items)}`, amt:-amt, kind:'out'});
    S.orders.push({id, cust:'me', items, amt, status:'placed', t:clock()});
    S.cart = []; ui.sheet = null; ui.cTab = 'orders';
    notify(`New order #${id} from Ananya R. · ${itemsText(items)} · ${rs(amt)} · Manikonda`, 'order');
    toastC(`Order placed. ${rs(amt)} paid from your wallet.`);
  },
  'o-cancel'(v){
    const o = S.orders.find(x => String(x.id) === v); if (!o || o.status !== 'placed') return;
    o.status = 'cancelled';
    S.ledger.push({date:TDY, seq:S.seq++, text:`Refund · Order #${o.id}`, amt:o.amt, kind:'in'});
    notify(`Ananya R. cancelled order #${o.id} before it was accepted. ${rs(o.amt)} refunded.`, 'cancel');
    toastC('Order cancelled. Money is back in your wallet.');
  },
  oadv(v){
    const o = S.orders.find(x => String(x.id) === v); if (!o) return;
    const i = FLOW.indexOf(o.status); if (i < 0 || i >= FLOW.length - 1) return;
    o.status = FLOW[i + 1];
    if (o.cust === 'me') toastC(CTXT[o.status]);
  },
  topup(v){ const a = +v || 1000; S.ledger.push({date:TDY, seq:S.seq++, text:'Added to wallet via UPI', amt:a, kind:'in'}); toastC(`${rs(a)} added to your wallet.`); },
  lock(){
    if (S.phase !== 'open') return;
    S.snapshot = computeLines(); S.phase = 'locked'; S.lockedAt = Date.now(); ui.demoOpen = false; ui.sheet = null;
    const st = stops(), items = okLines().reduce((a,l) => a+l.qty, 0);
    notify(`Tomorrow's list is locked: ${st.length} deliveries, ${items} items, ${rs(st.reduce((a,s) => a+s.amt, 0))}.`, 'lock');
  },
  deliver(v){
    if (S.phase === 'open') return;
    S.done[v] = true; if (v === 'me') settle();
    if (stops().every(s => S.done[s.cust])) finishRun();
  },
  morning(){
    if (S.phase !== 'locked') return;
    stops().forEach(s => { S.done[s.cust] = true; });
    ui.demoOpen = false; finishRun();
  },
  reset(){ seed(); Object.assign(ui, {cTab:'shop', cCat:'All', q:'', mTab:'orders', sheet:null, cToast:null, mToast:null, demoOpen:false, confirmCancel:null, prevPrep:null, prevKpi:null, flash:{}}); },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const a = el.dataset.a;
  if (a !== 'p-cancel') ui.confirmCancel = null;
  if (A[a]) { A[a](el.dataset.v); render(); }
});
document.addEventListener('input', e => { if (e.target.id === 'q'){ ui.q = e.target.value; render(); } });

if (BRAND && CFG.brandAssets.logo){ const l = document.querySelector('.wm .logo'); l.classList.add('img'); l.innerHTML = `<img src="${CFG.brandAssets.logo}" alt="Vaaradhi Farms">`; }
S = load() || seed();
render();
setInterval(() => { if (S.phase !== 'delivered') render(); }, 30000);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
