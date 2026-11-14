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
const FREQ = {daily:'Daily', alternate:'Alternate days', days:'Selected days', weekly:'Weekly', fortnightly:'Every 2 weeks', monthly:'Monthly'};
/* Frequencies the schedule engine supports. 'monthly' stays in the catalogue as a proposed option but is not offered. */
const ENGINE_FREQS = ['daily','alternate','days','weekly','fortnightly'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], DOW_ORDER = [1,2,3,4,5,6,0];
const DAY_PRESETS = [['Weekdays',[1,2,3,4,5]], ['Weekends',[0,6]], ['Mon, Wed, Fri',[1,3,5]]];
function daysText(days){
  const k = [...days].sort().join(',');
  if (k === '1,2,3,4,5') return 'Mon – Fri'; if (k === '0,6') return 'Sat & Sun'; if (days.length === 7) return 'Every day';
  return DOW_ORDER.filter(d => days.includes(d)).map(d => DOW[d]).join(', ');
}
function freqLabel(s){
  const wd = DOW[parse(s.anchor || s.start).getDay()];
  return s.freq === 'days' ? daysText(s.days || []) : s.freq === 'weekly' ? 'Weekly on ' + wd : s.freq === 'fortnightly' ? 'Every 2 weeks on ' + wd : FREQ[s.freq] || s.freq;
}
const subFreqs = p => p && p.subscription && p.subscription.eligible ? p.subscription.frequencies.filter(f => ENGINE_FREQS.includes(f)) : [];
/* PROVISIONAL cutoff from data/config.js (local time, Asia/Kolkata assumed). */
const CUT_MIN = (() => { const [h, m] = String(CFG.subscriptionCutoff || '21:00').split(':').map(Number); return h*60 + (m || 0); })();
const fmtMin = (m, full) => { let h = Math.floor(m/60) % 24; const mm = m % 60, ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + (mm || full ? ':' + String(mm).padStart(2,'0') : '') + ' ' + ap; };
/* Every time in the app is India Standard Time, and says so. */
const CUTOFF = fmtMin(CUT_MIN) + ' IST';
const AV_COLORS = ['#E7F6EC|#0B5A2D','#EAF1FF|#2563EB','#FFF5D1|#7A5B00','#FDE8EA|#B4232F','#F1EAFE|#6D28D9','#E6F7F7|#0E7490'];

/* ---------- dates ---------- */
const DAY = 86400000;
/* Calendar dates follow Asia/Kolkata, whatever the device's own timezone. */
const TZ = 'Asia/Kolkata';
const istISO = (when = new Date()) => new Intl.DateTimeFormat('en-CA', {timeZone:TZ, year:'numeric', month:'2-digit', day:'2-digit'}).format(when);
const istMinutes = (when = new Date()) => { const [h, m] = new Intl.DateTimeFormat('en-GB', {timeZone:TZ, hour:'2-digit', minute:'2-digit', hourCycle:'h23'}).format(when).split(':').map(Number); return h*60 + m; };
/* Cutoff rule at a given minute of the day: before the cutoff, tomorrow is editable; at or after it, the earliest editable date is the day after tomorrow. */
const cutoffOpenAt = minutes => minutes < CUT_MIN;
const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const parse = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d, 12); };
const plus = (s,n) => iso(new Date(parse(s).getTime() + n*DAY));
const diffDays = (a,b) => Math.round((parse(b) - parse(a)) / DAY);
const TDY = istISO();
const TODAY = parse(TDY);
const addD = n => parse(plus(TDY, n));
const TMR = plus(TDY, 1), DAT = plus(TDY, 2);
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
const KEY = 'vaaradhi-demo-v10';
let S;
const ui = {view:'customer', cTab:'home', cCat:'All', q:'', subOnly:false, bname:null, confirmDel:null, mTab:'home', of:{type:'all', date:'today', status:'all'}, pf:'all', msheet:null, mConfirm:null, sheet:null, cToast:null, mToast:null, demoOpen:false,
            confirmCancel:null, prevPrep:null, prevKpi:null, flash:{}, shownToast:{}, wf:'all', wOpen:null, sf:'all', sq:'', cuf:'all', cuq:'', lastMin:null};

function seed(){
  let s = 7; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const subs = []; let n = 1;
  const add = (cust, prod, freq, qty, startOff, days) => {
    const start = iso(addD(startOff));
    const sub = {id:'s'+(n++), cust, prod, freq, days: freq === 'days' ? days || [1,2,3,4,5] : undefined, qty, start, anchor:start, skips:[], pausedFrom:null, cancelledFrom:null, isNew:false};
    subs.push(sub); return sub;
  };
  add('me','desi-eggs-6-pcs','daily',1,-21); add('me','potato-500-g','alternate',1,-11); add('me','onion-1-kg','alternate',1,-11);
  add('me','sona-masuri-rice-1-kg','weekly',1,-4);
  const SEEDABLE = PRODUCTS.filter(p => subFreqs(p).length);
  CUSTOMERS.slice(1).forEach(c => {
    const k = 1 + Math.floor(r()*3), picks = new Set();
    while (picks.size < k) picks.add(SEEDABLE[Math.floor(r()*SEEDABLE.length)].id);
    picks.forEach(pid => { const fs = subFreqs(P[pid]); add(c.id, pid, fs[Math.floor(r()*fs.length)], (pid==='desi-eggs-6-pcs' && r() > .4) ? 2 : 1, -2 - Math.floor(r()*20), DAY_PRESETS[Math.floor(r()*DAY_PRESETS.length)][1]); });
  });
  const rahul = add('c1','desi-eggs-6-pcs','daily',2,1); rahul.isNew = true;
  const harshaSub = subs.find(x => x.cust === 'c18'); harshaSub.pausedFrom = iso(addD(-2));

  const st = {day:TDY, phase:'open', subs, vac:{c2:{from:TDY, to:iso(addD(3))}, c6:{from:TMR, to:iso(addD(7))}},
    ovr:{}, extras:[{id:1, cust:'c3', prod:'desi-eggs-6-pcs', qty:1}, {id:2, cust:'c12', prod:'apple-500-g', qty:1}],
    done:{}, meSettled:false, orders:[], cart:[], baskets:[], mealInterest:[], mealSamples:[], oseq:1043, snapshot:null, ledger:[], seq:0, feed:[], unread:0, lockedAt:null, custom:[], meals:[]};
  S = st;
  const led = (date, type, amt, extra = {}) => st.ledger.push({date, type, amt, kind: amt > 0 ? 'in' : amt < 0 ? 'out' : 'zero', seq:st.seq++, ...extra});
  led(iso(addD(-6)), 'topup', 5000, {via:'UPI · simulated'});
  for (let d = -5; d <= 0; d++) {
    const day = iso(addD(d)), items = subs.filter(x => x.cust === 'me' && delivers(x, day)).map(x => ({prod:x.prod, qty:x.qty, amt:x.qty*P[x.prod].price, status:'ok'}));
    if (items.length) led(day, 'delivery', -items.reduce((a, i) => a + i.amt, 0), {items});
  }
  // Sample activity is timed a few minutes to a few hours before the real time now (IST).
  st.feed = [
    {t:ago(11),  kind:'new',   text:`Rahul K. subscribed to Desi Eggs × 2 · Daily · starts ${fmtD(TMR)}`},
    {t:ago(50),  kind:'add',   text:'Pooja A. added Apple × 1 for tomorrow'},
    {t:ago(122), kind:'pause', text:`Meera I. is away ${fmtS(TMR)} – ${fmtS(iso(addD(7)))}. Deliveries paused, no charge.`},
    {t:ago(210), kind:'add',   text:'Farhan A. added Desi Eggs × 1 for tomorrow'},
    {t:'Yesterday', kind:'pause', text:`Harsha V. paused ${P[harshaSub.prod].name}`},
  ];
  const mk = (id, cust, items, status, t, date = TDY) => st.orders.push({id, cust, items, amt:orderAmt(items), status, t, date});
  // The demo customer's earlier orders, for Order Again.
  mk(1017,'me',[{prod:'white-sesame-oil-500-ml',qty:1},{prod:'jowar-flakes-150-g',qty:1},{prod:'dates-250-g',qty:1}], 'delivered', '6:40 PM', iso(addD(-9)));
  mk(1024,'me',[{prod:'desi-eggs-6-pcs',qty:2},{prod:'onion-1-kg',qty:1},{prod:'ragi-idli-rava-500-g',qty:1}], 'delivered', '10:15 AM', iso(addD(-3)));
  st.orders.filter(o => o.cust === 'me').forEach(o => led(o.date, 'order', -o.amt, {ref:o.id, items:o.items.map(i => ({prod:i.prod, qty:i.qty, amt:i.qty*P[i.prod].price, status:'ok'}))}));
  // Illustrative breakfast-concept interest from sample customers. Seeded only when DEMO_CONFIG.sampleInterest is on
  // (the local meeting copy), and kept in its own list, apart from customer-submitted interest.
  if (CFG.sampleInterest) [['healthy-start','c4',[1,3,5],1,'delivery'], ['healthy-start','c8',[1,2,3,4,5,6],2,'delivery'], ['healthy-start','c17',[6,0],1,'pickup'],
   ['workday-breakfast','c10',[1,2,3,4,5],1,'delivery'], ['workday-breakfast','c22',[1,3,5],2,'either'],
   ['family-breakfast-box','c20',[0],4,'pickup'], ['family-breakfast-box','c13',[6,0],3,null], ['weekly-healthy-mix','c14',[1],2,'either']]
    .forEach(([planId, cust, days, servings, fulfil], i) => st.mealSamples.push({id:'mi-s' + i, planId, cust, days, servings, fulfil, at:TDY}));
  // A few sample plan changes, so the merchant's Plans screen shows upcoming changes.
  { const s5 = subs.find(x => x.cust === 'c5'); const v = {...s5, id:'s' + (n++), qty:s5.qty + 1, start:DAT, anchor:s5.anchor, skips:[], replaces:s5.id}; s5.cancelledFrom = DAT; s5.replacedBy = v.id; subs.push(v); }
  { const s7 = subs.find(x => x.cust === 'c7'); s7.cancelledFrom = plus(TDY, 3); }
  st.baskets.push({id:'b1', name:'Monthly staples', items:[{prod:'sunflower-oil-1-litre',qty:1},{prod:'sona-masuri-rice-1-kg',qty:2},{prod:'minapappu-500-g',qty:1},{prod:'wheat-flour-1-kg',qty:2}]});
  mk(1038,'c8', [{prod:'mango-pickle-300-g',qty:1},{prod:'white-poha-500-g',qty:1}], 'delivered', ago(502));
  mk(1039,'c11',[{prod:'sunflower-oil-1-litre',qty:1},{prod:'wheat-flour-1-kg',qty:1}], 'delivered', ago(397));
  mk(1040,'c10',[{prod:'ragi-laddu-250-g',qty:2},{prod:'dates-250-g',qty:1}], 'out', ago(37));
  mk(1041,'c9', [{prod:'ragi-idli-rava-500-g',qty:1},{prod:'desi-eggs-6-pcs',qty:1}], 'packed', ago(22));
  mk(1042,'c19',[{prod:'white-sesame-oil-500-ml',qty:1},{prod:'jowar-flakes-150-g',qty:2}], 'placed', ago(4));
  const k = st.orders.find(o => o.id === 1042);
  st.feed.unshift({t:ago(4), kind:'order', text:`New order #1042 from Kavya M. · ${itemsText(k.items)} · ${rs(k.amt)} · Madhapur`});
  // Demo stock: enough for tomorrow plus a margin, with a few products low, short or out, so the Stock tab has something to show.
  const need = {}; computeLines().filter(l => l.status === 'ok').forEach(l => need[l.prod] = (need[l.prod] || 0) + l.qty);
  st.stock = Object.fromEntries(PRODUCTS.map((p, i) => [p.id, {qty:(need[p.id] || 0) + 6 + (i * 7) % 23, low:5}]));
  st.stock['kaalabhat-black-rice-1-kg'].qty = 0; st.stock['nuvvula-undalu-250-g'].qty = 0;
  st.stock['gongura-pickle-300-g'].qty = 3; st.stock['chia-seeds-250-g'].qty = 4;
  // One product short for tomorrow: the busiest one outside the demo customer's own staples, which stay in stock.
  const shortId = Object.keys(need).filter(id => need[id] >= 2 && !['desi-eggs-6-pcs','onion-1-kg','potato-500-g'].includes(id)).sort((a, b) => need[b] - need[a] || a.localeCompare(b))[0];
  if (shortId) st.stock[shortId].qty = need[shortId] - 1;
  return st;
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
function load(){ try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.day === TDY) return s; } catch(e){} return null; }

/* ---------- subscription rules ---------- */
/* One rule for every frequency. `anchor` fixes the rhythm of alternate, weekly and fortnightly plans;
   `start` and `cancelledFrom` bound the dates a version of a plan is valid for. */
function freqOk(f, anchor, d, days){
  const dow = parse(d).getDay(), gap = diffDays(anchor, d);
  if (f === 'daily') return true;
  if (f === 'alternate') return gap % 2 === 0;
  if (f === 'days') return (days || []).includes(dow);
  if (f === 'weekly') return gap % 7 === 0;
  if (f === 'fortnightly') return gap % 14 === 0;
  if (f === 'weekdays') return dow >= 1 && dow <= 5;      // older saved plans
  if (f === 'weekends') return dow === 0 || dow === 6;
  return false;
}
function delivers(s, d){ if (d < s.start) return false; if (s.cancelledFrom && d >= s.cancelledFrom) return false; return freqOk(s.freq, s.anchor || s.start, d, s.days); }
/* Upcoming delivery dates from tomorrow, with their status. Tomorrow uses the locked list after the cutoff. */
function upcomingFor(s, n = 6){
  const out = [];
  for (let i = 1; i <= 120 && out.length < n; i++){
    const d = plus(TDY, i); if (!delivers(s, d)) continue;
    let status = pausedOn(s, d) ? 'paused' : (s.skips || []).includes(d) ? 'skipped' : 'scheduled';
    if (d === TMR && S.phase !== 'open'){ const l = lines().find(x => x.subId === s.id); status = l ? (l.status === 'ok' ? 'scheduled' : l.status) : status; }
    out.push({date:d, status, locked: d === TMR && S.phase !== 'open'});
  }
  return out;
}
const nextDelivery = s => (upcomingFor(s, 10).find(u => u.status === 'scheduled') || {}).date || null;
/* A changed plan and the version it replaces, newest first. Lets screens show dates either side of a pending change. */
function chainOf(s){ const out = [s]; let c = s; while (c.replaces){ c = S.subs.find(x => x.id === c.replaces); if (!c) break; out.push(c); } return out; }
function upcomingChain(s, n = 6){
  const vs = chainOf(s), out = [];
  for (let i = 1; i <= 120 && out.length < n; i++){
    const d = plus(TDY, i), v = vs.find(x => delivers(x, d)); if (!v) continue;
    const u = upcomingFor(v, 120).find(x => x.date === d); if (!u) continue;
    out.push({...u, subId:v.id, qty: (d === TMR && S.ovr[v.id] && S.ovr[v.id].qty) || v.qty});
  }
  return out;
}
const nextChain = s => (upcomingChain(s, 10).find(u => u.status === 'scheduled') || {}).date || null;
/* A saved change that hasn't started yet: the plan replaces an older version and starts after tomorrow. */
const pendingFrom = s => s.replaces && s.start > TMR ? s.start : null;
/* Stable plan order: next delivery first; ended or undated plans last; then product name; then id. */
const planOrder = (a, b) => { const na = nextChain(a) || '9999', nb = nextChain(b) || '9999'; return na < nb ? -1 : na > nb ? 1 : P[a.prod].name.localeCompare(P[b.prod].name) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); };
/* Breakfast-concept interest: separate from plans, orders and revenue. One record per customer per concept. */
const myInterest = planId => S.mealInterest.find(x => x.cust === 'me' && x.planId === planId) || null;
const servText = n => n + ' serving' + (n > 1 ? 's' : '');
const activeSubs = cust => S.subs.filter(s => s.cust === cust && !s.replacedBy);
function pausedOn(s, d){
  if (s.pausedFrom && d >= s.pausedFrom) return true;
  const v = S.vac[s.cust];
  return !!(v && d >= v.from && (!v.to || d <= v.to));
}
function firstDelivery(s){ for (let i = 0; i < 14; i++){ const d = plus(s.start, i); if (delivers(s, d)) return d; } return s.start; }
const editFrom = () => S.phase === 'open' ? TMR : DAT;   // the cutoff rule

function computeLines(){
  const out = [];
  for (const s of S.subs){
    if (!delivers(s, TMR)) continue;
    const o = S.ovr[s.id] || {}, qty = o.qty || s.qty;
    const status = pausedOn(s, TMR) ? 'paused' : (o.skip || (s.skips || []).includes(TMR)) ? 'skipped' : 'ok';
    out.push({cust:s.cust, prod:s.prod, qty, subId:s.id, amt:qty*P[s.prod].price, status, kind:'plan', freq:s.freq, freqText:freqLabel(s)});
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

/* ---------- stock (demo inventory, packs of the listed size) ---------- */
/* Breakfast plans are made to order, so they have no stock count. */
const stockOf = id => P[id] && P[id].meal ? Infinity : S.stock && S.stock[id] ? S.stock[id].qty : 0;
/* What tomorrow's deliveries that aren't delivered yet still need from stock. */
function stockNeed(){ const m = {}; if (S.phase === 'delivered') return m; okLines().forEach(l => { if (!S.done[l.cust]) m[l.prod] = (m[l.prod] || 0) + l.qty; }); return m; }
function stockState(id, need){
  const s = S.stock[id], n = need[id] || 0;
  if (s.qty <= 0) return ['out', 'Out of stock', 'r'];
  if (s.qty < n) return ['short', 'Short by ' + (n - s.qty), 'r'];
  if (s.qty <= s.low) return ['low', 'Low stock', 'y'];
  return ['ok', 'In stock', 'g'];
}
const STOCKED = () => PRODUCTS.filter(p => !p.meal);
function stockSummary(){ const need = stockNeed(), g = {need, out:[], short:[], low:[], ok:[]}; STOCKED().forEach(p => g[stockState(p.id, need)[0]].push(p.id)); return g; }
const takeStock = items => items.forEach(i => { const s = S.stock[i.prod]; if (s) s.qty = Math.max(0, s.qty - i.qty); });
const putBack = items => items.forEach(i => { const s = S.stock[i.prod]; if (s) s.qty += i.qty; });

/* ---------- products and breakfast plans that Vaaradhi adds in the demo ---------- */
/* Stored in S.custom (shop products) and S.meals (breakfast plans), and merged into PRODUCTS so that the shop, cart,
   subscriptions, prep sheet and wallet treat them like any catalogue product. Nothing is invented: every name, price
   and menu comes from what is typed into the merchant app. */
const MEAL_CAT = {id:'breakfast', name:'Breakfast plans', shortName:'Breakfast', color:'#D9860B'};
const forSale = p => !p.hidden;
function syncCustom(){
  for (let i = PRODUCTS.length - 1; i >= 0; i--) if (PRODUCTS[i].custom){ delete P[PRODUCTS[i].id]; PRODUCTS.splice(i, 1); }
  const ci = CAT_LIST.indexOf(MEAL_CAT), meals = S.meals || [];
  if (meals.length && ci < 0){ CAT_LIST.unshift(MEAL_CAT); CATMAP.breakfast = MEAL_CAT; }
  if (!meals.length && ci >= 0){ CAT_LIST.splice(ci, 1); delete CATMAP.breakfast; }
  [...meals, ...(S.custom || [])].forEach(x => {
    const p = {...x, custom:true, cat:(CATMAP[x.category] || MEAL_CAT).name, unit: x.meal ? '1 serving' : x.variant || 'Pack size not listed',
      subscription:{eligible:!!x.sub, frequencies: x.sub ? (x.meal ? ['days'] : [...ENGINE_FREQS]) : []}};
    PRODUCTS.push(p); P[p.id] = p;
  });
}
const mealDayOk = (p, d) => p.days.includes(parse(d).getDay());
/* Servings of a breakfast plan already booked for tomorrow (plans and one-time orders). */
const mealBooked = id => computeLines().filter(l => l.prod === id && l.status === 'ok').reduce((a, l) => a + l.qty, 0);
function mealTmrIssue(p, qty = 1){
  if (!mealDayOk(p, TMR)) return `${p.name} isn't served on ${DOW[parse(TMR).getDay()]}s.`;
  if (p.cap && mealBooked(p.id) + qty > p.cap) return `${p.name} is fully booked for tomorrow (${p.cap} servings a day).`;
  return '';
}

/* ---------- order now (one-time, same day) ---------- */
const FLOW = ['placed','accepted','packed','out','delivered'];
const OLBL = {placed:'New', accepted:'Accepted', packed:'Packed', out:'Out for delivery', delivered:'Delivered', cancelled:'Cancelled'};
const NEXT = {placed:'Accept order', accepted:'Mark packed', packed:'Send out', out:'Mark delivered'};
const CTITLE = {placed:'Waiting for Vaaradhi to accept', accepted:'Order accepted', packed:'Packed and ready', out:'On the way to you', delivered:'Delivered'};
const CTXT = {accepted:'Vaaradhi accepted your order and is packing it.', packed:'Your order is packed and waiting for the rider.', out:'Your order is on the way.', delivered:'Your order was delivered. Enjoy!'};
const orderAmt = items => items.reduce((a, i) => a + i.qty*P[i.prod].price, 0);
const itemsText = items => items.map(i => P[i.prod].name + ' × ' + i.qty).join(', ');
const isLive = o => o.status !== 'delivered' && o.status !== 'cancelled';
const nowOpen = () => S.phase !== 'locked';
const cartQty = id => (S.cart.find(c => c.prod === id) || {}).qty || 0;

/* ---------- clock ---------- */
/* The real time in India, so it matches any phone or laptop set to India time. */
const nowMin = () => istMinutes();
const clock = () => fmtMin(nowMin(), true);
const ago = k => fmtMin(Math.max(0, nowMin() - k), true);
function leftText(){ const l = CUT_MIN - nowMin(); if (l <= 0) return 'Demo: before cutoff'; const h = Math.floor(l/60), mm = l % 60; return (h ? h + 'h ' : '') + mm + 'm left'; }
/* The demo controls can move the day ahead of the real clock ("Skip past 9 PM", "Run morning deliveries").
   The clock always shows the real time; this note says when the screens show a later point of the day. */
function simNote(){
  const after = nowMin() >= CUT_MIN;
  if (S.phase === 'open' && after) return 'Demo shows before ' + CUTOFF;
  if (S.phase === 'locked' && !after) return 'Demo shows after ' + CUTOFF;
  if (S.phase === 'delivered') return 'Demo shows tomorrow morning';
  return '';
}

/* ---------- notifications ---------- */
let mTimer, cTimer;
function notify(text, kind, key){
  if (key && S.feed[0] && S.feed[0].key === key){ S.feed[0].text = text; S.feed[0].t = clock(); }
  else { S.feed.unshift({t:clock(), text, kind, key}); if (ui.view !== 'merchant') S.unread++; }
  ui.mToast = {text, kind, id:Date.now() + Math.random()};
  clearTimeout(mTimer); mTimer = setTimeout(() => { ui.mToast = null; render(); }, 4200);
}
function toastM(text){
  ui.mToast = {text, kind:'x', id:Date.now() + Math.random()};
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
  bowl:'<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M8 7.5c0-1.3 1-1.7 1-3M12 7.5c0-1.3 1-1.7 1-3M16 7.5c0-1.3 1-1.7 1-3"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  box:'<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
};
const icon = (k, sz = 0) => `<svg ${sz ? `width="${sz}" height="${sz}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg>`;
const FEED_IC = {order:'bag', new:'repeat', add:'plus', pause:'plane', skip:'x', cancel:'x', lock:'lock', resume:'check', interest:'bowl'};
const nav = (tabs, cur, act, badges = {}) => `<nav class="nav">${tabs.map(([k,label,ic]) => `<button class="${cur===k?'on':''}" data-a="${act}" data-v="${k}">${icon(ic)}${label}${badges[k] ? `<i class="nb">${badges[k]}</i>` : ''}</button>`).join('')}</nav>`;
/* Product photos: data/product-images.js (Vaaradhi's own photos where they exist, otherwise a labelled representative photo).
   A neutral tile is the fallback if a product has no photo. */
const IMG = window.PRODUCT_IMAGES || {};
const initialsOf = name => name.replace(/\(.*?\)/g, '').split(/\s+/).filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
function visual(p){
  const src = p.img || (IMG[p.id] && IMG[p.id].src);
  if (src) return `<img src="${src}" alt="" decoding="async">`;
  const c = (CATMAP[p.category] || MEAL_CAT).color;
  return `<span class="ph${p.meal ? ' meal' : ''}" style="--c:${c}" aria-hidden="true">${p.meal ? icon('bowl', 24) : `<b>${esc(initialsOf(p.name))}</b>`}</span>`;
}
function catVisual(c){ if (c === MEAL_CAT) return `<span class="ph meal" style="--c:${c.color}" aria-hidden="true">${icon('bowl', 22)}</span>`;
  const ps = PRODUCTS.filter(x => x.category === c.id && IMG[x.id]), p = ps.find(x => !IMG[x.id].representative) || ps[0];
  return p ? `<img src="${IMG[p.id].src}" alt="">` : `<span class="ph" style="--c:${c.color}" aria-hidden="true"><b>${c.shortName[0]}</b></span>`; }
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
const ESSENTIALS = (CFG.homeEssentials || []).filter(id => P[id]);
const mySubs = () => { const m = {}; activeSubs('me').forEach(s => { if (!s.cancelledFrom) m[s.prod] = s; }); return m; };
const dayLabel = d => d === TDY ? 'Today' : d === iso(addD(-1)) ? 'Yesterday' : fmtD(d);
function card(p, mine, layout){
  const q = cartQty(p.id), out = stockOf(p.id) <= 0;
  const add = p.meal ? (p.once ? `<button class="addbtn" data-a="buy-open" data-v="${p.id}|tmr" aria-label="Order ${esc(p.name)} for a day">ORDER</button>` : '')
    : !nowOpen() ? `<button class="addbtn" disabled title="Same-day ordering is closed for tonight">ADD</button>`
    : out ? '<span class="oos">Out of stock</span>'
    : q ? qbtn('cq', p.id, q) : `<button class="addbtn" data-a="cq" data-v="${p.id}|1" aria-label="Add ${esc(p.name)} to cart">ADD</button>`;
  const sub = subFreqs(p).length ? `<button class="pc-sub" data-a="buy-open" data-v="${p.id}|sub">${icon('repeat', 12)}Subscribe</button>` : '<span class="pc-sub off">One-time purchase</span>';
  const img = `<button class="pc-img" data-a="buy-open" data-v="${p.id}|${p.meal ? (p.once ? 'tmr' : 'sub') : 'now'}" aria-label="${esc(p.name)}, details">${visual(p)}${mine && layout !== 'row' ? `<span class="pc-tag">${freqLabel(mine)}</span>` : p.custom ? '<span class="pc-tag new">New</span>' : ''}</button>`;
  if (layout === 'row') return `<div class="pc pr${out ? ' is-out' : ''}" data-prod="${p.id}">${img}<div class="pr-b"><div class="pc-name">${p.name}</div>
    <div class="pc-unit">${p.unit}${mine ? ` · <span class="pr-mine">${icon('repeat', 11)}${freqLabel(mine)}</span>` : ''}</div><div class="pc-row"><b>${rs(p.price)}</b>${add}</div>${sub}</div></div>`;
  return `<div class="pc${out ? ' is-out' : ''}" data-prod="${p.id}">${img}<div class="pc-name">${p.name}</div><div class="pc-unit">${p.unit}</div><div class="pc-row"><b>${rs(p.price)}</b>${add}</div>${sub}</div>`;
}
function homeBody(){
  const my = lines().filter(l => l.cust === 'me'), okn = my.filter(l => l.status === 'ok'), mine = mySubs();
  const past = S.orders.filter(o => o.cust === 'me' && o.status === 'delivered');
  const again = S.baskets.length ? `${S.baskets.length} saved basket${S.baskets.length > 1 ? 's' : ''}` : past.length ? 'Reorder a past order' : 'Your past orders';
  const tmr = my.length ? `<button class="tstrip" data-a="ctab" data-v="sched"><span class="ts-i">${icon('sun', 18)}</span>
      <span class="ts-t"><b>Tomorrow · ${okn.length} item${okn.length === 1 ? '' : 's'} · ${rs(okn.reduce((a,l) => a + l.amt, 0))}</b>
      <small>${S.phase === 'open' ? `Change or skip until ${CUTOFF}` : S.phase === 'locked' ? 'Being prepared' : 'Delivered'}</small></span><span class="ts-go">›</span></button>` : '';
  return `<section class="hero2"><h1>Healthy habits, made easier.</h1><p>Shop everyday essentials, keep a regular basket, or explore a breakfast routine.</p></section>
    <div class="entries">
      <button class="entry e-meals" data-a="ctab" data-v="meals"><span class="ei">${icon('bowl', 22)}</span><span class="et"><b>Healthy Meal Plans</b><small>${liveMeals().length ? `${liveMeals().length} breakfast plan${liveMeals().length > 1 ? 's' : ''} to subscribe or order` : 'Preview a regular breakfast routine'}</small></span><span class="etag">${liveMeals().length ? 'New' : 'Concept'}</span></button>
      <button class="entry e-shop" data-a="ctab" data-v="shop"><span class="ei">${icon('bag', 22)}</span><span class="et"><b>Shop Groceries</b><small>${STOCKED().filter(forSale).length} essentials · same-day</small></span></button>
      <button class="entry e-again" data-a="ctab" data-v="orders"><span class="ei">${icon('repeat', 22)}</span><span class="et"><b>Order Again</b><small>${again}</small></span></button>
    </div>
    ${tmr}
    <div class="sec-h"><h3>Everyday essentials</h3><button data-a="ctab" data-v="shop">See all ›</button></div>
    <div class="rail">${ESSENTIALS.map(id => card(P[id], mine[id])).join('')}</div>
    <div style="height:${S.cart.length ? 96 : 24}px"></div>`;
}
function shopHead(){
  return `<div class="sh-head"><div class="ct2"><h2>Shop groceries</h2>${nowOpen() ? `<span class="sdd">${icon('truck', 13)}Same-day delivery</span>` : `<span class="sdd off">${icon('lock', 13)}Closed tonight</span>`}</div>
    <div class="srow"><label class="search">${icon('search', 18)}<input id="q" type="search" placeholder="Search oils, millets, dals…" value="${esc(ui.q)}" autocomplete="off" aria-label="Search products"></label>
    <button class="fchip ${ui.subOnly ? 'on' : ''}" data-a="sub-only" aria-pressed="${ui.subOnly}">${icon('repeat', 12)}Can subscribe</button></div></div>`;
}
/* Category rail on the left, products on the right. "All" lists every category in turn. */
function shopBody(){
  const mine = mySubs(), q = ui.q.trim().toLowerCase();
  const list = PRODUCTS.filter(p => forSale(p) && (!q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q))
    && (ui.cCat === 'All' || p.cat === ui.cCat) && (!ui.subOnly || subFreqs(p).length));
  const count = `<div class="rcount">${list.length} product${list.length === 1 ? '' : 's'}${ui.cCat !== 'All' ? ' in ' + ui.cCat : ''}${q ? ` for “${esc(ui.q.trim())}”` : ''}</div>`;
  const rows = ps => `<div class="plist-in">${ps.map(p => card(p, mine[p.id], 'row')).join('')}</div>`;
  let grid;
  if (!list.length) grid = `<div class="empty"><b>No products found</b><span>Try another word or clear the filters.</span><button class="lnk" data-a="clear-filters">Clear search and filters</button></div>`;
  else if (ui.cCat === 'All' && !q) grid = CAT_LIST.map(c => { const ps = list.filter(p => p.category === c.id); return ps.length ? `<div class="gh">${c.name}</div>${rows(ps)}` : ''; }).join('');
  else grid = rows(list);
  const rail = [{name:'All'}, ...CAT_LIST.filter(c => PRODUCTS.some(p => p.category === c.id && forSale(p)))].map(c => { const on = ui.cCat === c.name;
    return `<button class="vcat ${on ? 'on' : ''}" data-a="cat" data-v="${esc(c.name)}" aria-pressed="${on}"><span class="vc-i">${c.id ? catVisual(c) : `<span class="vc-all">${icon('bag', 22)}</span>`}</span><span class="vc-l">${c.id ? c.shortName : 'All'}</span></button>`; }).join('');
  return `<div class="shop-split"><nav class="vrail" data-scroll="c-rail" aria-label="Categories">${rail}</nav>
    <div class="plist" data-scroll="c-plist-${esc(ui.cCat)}">${count}${grid}<div style="height:${S.cart.length ? 96 : 24}px"></div></div></div>`;
}
function ordersBody(){
  const mine = S.orders.filter(o => o.cust === 'me').sort((a,b) => b.id - a.id);
  const active = mine.filter(isLive), past = mine.filter(o => o.status === 'delivered');
  const track = o => { const i = FLOW.indexOf(o.status); return `<div class="tk">
      <div class="tk-top"><div><small>Order #${o.id} · ${o.t} IST</small><b>${CTITLE[o.status]}</b></div><span class="eta">${o.status === 'placed' ? 'Awaiting' : o.status === 'out' ? 'On the way' : 'Today'}</span></div>
      <div class="tk-bar">${FLOW.map((_,k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="tk-steps">${['Placed','Accepted','Packed','On the way','Delivered'].map((l,k) => `<span class="${k <= i ? 'on' : ''}">${l}</span>`).join('')}</div>
      <div class="tk-items">${o.items.map(it => `<span class="tk-it">${thumb(P[it.prod],'sm')}${P[it.prod].name} × ${it.qty}</span>`).join('')}</div>
      <div class="tk-foot"><span>${rs(o.amt)} · paid from wallet ${demoTag()}</span>${o.status === 'placed' ? `<button class="lnk red" data-a="o-cancel" data-v="${o.id}">Cancel order</button>` : ''}</div></div>`; };
  const baskets = S.baskets.map(b => { const total = orderAmt(b.items), n = b.items.reduce((a,i) => a + i.qty, 0);
    return `<div class="bk"><div class="bk-top"><div><b>${esc(b.name)}</b><small>${n} item${n > 1 ? 's' : ''} · ${rs(total)}</small></div>
      <button class="lnk red" data-a="del-basket" data-v="${b.id}">${ui.confirmDel === b.id ? 'Tap to delete' : 'Delete'}</button></div>
      <div class="bk-th">${b.items.slice(0,5).map(i => thumb(P[i.prod],'sm')).join('')}${b.items.length > 5 ? `<span class="more">+${b.items.length - 5}</span>` : ''}</div>
      <div class="bk-items">${b.items.map(i => `${P[i.prod].name} × ${i.qty}`).join(' · ')}</div>
      <button class="btn2 pri" data-a="basket-cart" data-v="${b.id}" ${nowOpen() ? '' : 'disabled'}>${icon('repeat', 15)}Add all to cart</button></div>`; }).join('');
  return `${active.length ? '<div class="sh" style="padding-top:4px">On the way</div>' + active.map(track).join('')
      : `<div class="note" style="margin-top:4px">${nowOpen() ? 'No orders on the way. Tap <b>ADD</b> on anything in Shop for same-day delivery.' : 'Same-day ordering is closed for tonight.'}</div>`}
    <div class="sh">Saved baskets</div>
    ${baskets || '<div class="note" style="margin-top:0">Save a basket from your cart, then reorder it here in one tap.</div>'}
    <div class="sh">Previous orders</div>
    ${past.length ? '<div class="box">' + past.map(o => `<div class="row">${thumb(P[o.items[0].prod])}<div class="t"><b>#${o.id} · ${o.items.length} item${o.items.length > 1 ? 's' : ''} · ${rs(o.amt)}</b><small>${dayLabel(o.date)} · ${o.items.map(i => P[i.prod].name).join(', ')}</small></div>
      <div class="rt"><button class="sbtn2" data-a="reorder" data-v="${o.id}" ${nowOpen() ? '' : 'disabled'}>Reorder</button></div></div>`).join('') + '</div>'
      : '<div class="note" style="margin-top:0">Delivered orders will show here for one-tap reordering.</div>'}
    ${nowOpen() ? '' : '<p class="fine">Reordering opens again tomorrow, when same-day ordering reopens.</p>'}
    <div class="spacer"></div>`;
}
function vacRangeText(v){ return v.to ? `${fmtS(v.from)} – ${fmtS(v.to)}` : `from ${fmtS(v.from)} until you resume`; }
function nextEligible(s){
  for (let i = 0; i < 31; i++){ const d = plus(DAT, i); if (delivers(s, d) && !pausedOn(s, d) && !(s.skips || []).includes(d)) return d; }
  return null;
}
function tomorrowBody(){
  const open = S.phase === 'open', delivered = S.phase === 'delivered', my = lines().filter(l => l.cust === 'me');
  const rows = my.map(l => {
    const p = P[l.prod], off = l.status !== 'ok';
    const sub = l.kind === 'extra' ? '<span class="chip b">Just tomorrow</span>' : (l.freqText || FREQ[l.freq]);
    let right;
    if (off) right = `<div class="rt"><span class="chip y">${l.status === 'paused' ? 'Paused' : 'Skipped'} · ₹0</span>${open && l.status === 'skipped' ? `<button class="lnk" data-a="t-skip" data-v="${l.subId}">Undo</button>` : ''}</div>`;
    else if (!delivered) right = `<div class="rt"><small class="qcap">${l.kind === 'extra' ? 'Quantity' : 'Tomorrow only'}</small>${qbtn(l.kind === 'extra' ? 'x-qty' : 't-qty', l.kind === 'extra' ? l.xid : l.subId, l.qty, true)}${l.kind === 'extra' ? `<button class="lnk red" data-a="x-del" data-v="${l.xid}">Remove</button>` : `<button class="lnk" data-a="t-skip" data-v="${l.subId}">Skip</button>`}</div>`;
    else right = `<div class="rt"><b>${rs(l.amt)}</b><span class="chip g">Delivered</span></div>`;
    const reg = l.subId ? (S.subs.find(x => x.id === l.subId) || {}).qty : null;
    const diff = reg && l.qty !== reg && !off ? `<small class="qnote">Tomorrow only: ${l.qty} · regular ${reg}</small>` : '';
    return `<div class="row ${off ? 'off' : ''}">${thumb(p)}<div class="t"><b>${p.name}</b><small>${sub}${!off ? ` · ${rs(l.amt)}` : ''}</small>${diff}</div>${right}</div>`;
  }).join('') || `<div class="row"><div class="t"><small>Nothing scheduled for tomorrow.</small></div></div>`;
  const charge = my.filter(l => l.status === 'ok').reduce((a,l) => a + l.amt, 0);
  const saved = my.filter(l => l.status !== 'ok').reduce((a,l) => a + l.amt, 0);
  const v = S.vac.me;
  const cd = open ? `<span class="cd">Edit until ${CUTOFF}</span>` : S.phase === 'locked' ? `<span class="cd lk">${icon('lock', 11)} Being prepared</span>` : '<span class="cd dn">Delivered</span>';
  const vac = v
    ? `<div class="vac on"><span class="vi">${icon('plane', 20)}</span><div><b>Vacation mode is on · all plans paused</b><small>${vacRangeText(v)}. Vaaradhi has been told and you won't be charged for these days.</small><button class="vb" data-a="vac-end">I'm back, resume</button></div></div>`
    : `<button class="vac" data-a="vac-open"><span class="vi">${icon('plane', 20)}</span><div><b>Going out of town?</b><small>Vacation mode pauses <b>all ${activeSubs('me').filter(s => !s.cancelledFrom).length} of your plans</b> for a few days. To pause just one plan, use Manage.</small></div></button>`;
  const plans = activeSubs('me').slice().sort(planOrder).map(s => {
    const p = P[s.prod];
    let st = ['Active','g'];
    if (s.cancelledFrom) st = ['Cancelled from ' + fmtS(s.cancelledFrom), 'r'];
    else if (s.pausedFrom) st = ['Paused from ' + fmtS(s.pausedFrom), 'y'];
    else if (v && (!v.to || v.to >= TMR)) st = ['Paused for vacation', 'y'];
    else if (s.start > TDY && s.isNew) st = ['Starts ' + fmtS(firstDelivery(s)), 'b'];
    const skips = (s.skips || []).filter(d => d > TMR && !s.cancelledFrom).length;
    const nx = s.cancelledFrom ? null : nextChain(s), pend = pendingFrom(s), prev = pend ? S.subs.find(x => x.id === s.replaces) : null;
    if (pend && st[1] === 'g') st = ['Change starts ' + fmtS(pend), 'b'];
    return `<div class="row">${thumb(p)}<div class="t"><b>${p.name}</b><small>Regular: ${s.qty} per delivery · ${freqLabel(s)} · ${rs(s.qty*p.price)}</small>
      ${prev ? `<small class="qnote">Until ${fmtS(plus(pend, -1))}: ${prev.qty} × ${freqLabel(prev)}</small>` : ''}
      <small class="nx">${nx ? 'Next: ' + fmtD(nx) : s.cancelledFrom ? 'No more deliveries' : 'No delivery scheduled'}</small>
      <span class="chip ${st[1]}" style="margin-top:4px">${st[0]}</span>${skips ? ` <span class="chip y" style="margin-top:4px">${skips} skipped</span>` : ''}</div>
      <div class="rt">${s.cancelledFrom ? '' : `<button class="sbtn2" data-a="manage" data-v="${s.id}">Manage</button>`}</div></div>`;
  }).join('');
  return `<div class="tm"><div class="tm-top"><div><small>Tomorrow · ${fmtD(TMR)}</small><b>Your next delivery</b></div>${cd}</div>
      <div class="tm-body">${rows}</div>
      <div class="tm-foot"><span>Tomorrow's charge</span><span>${rs(charge)}</span></div></div>
    ${saved ? `<div class="save">${rs(saved)} not charged because of skips or pauses</div>` : ''}
    ${vac}
    <div class="sh">Recurring orders</div>
    <div class="box">${plans || '<div class="row"><div class="t"><small>No recurring orders yet. Tap Subscribe on an eligible product.</small></div></div>'}</div>
    <p class="fine">Change, skip or pause anything until ${CUTOFF} the day before. After that, changes apply from the next delivery.</p>
    <div class="spacer"></div>`;
}
const LTYPE = {delivery:['sun','Scheduled delivery'], order:['bag','Order'], topup:['plus','Money added'], refund:['repeat','Refund']};
const ledgerTitle = l => l.type === 'order' ? `Order #${l.ref}` : l.type === 'refund' ? `Refund · order #${l.ref}` : LTYPE[l.type][1];
function ledgerSub(l){
  if (l.type === 'topup') return l.via || 'UPI · simulated';
  if (l.type === 'refund') return 'Cancelled before Vaaradhi accepted it';
  const ok = l.items.filter(i => i.status === 'ok'), off = l.items.filter(i => i.status !== 'ok');
  return (ok.map(i => `${P[i.prod].name} × ${i.qty}`).join(', ') || 'Nothing delivered') + (off.length ? ` · ${off.length} not charged` : '');
}
function walletBody(){
  const charge = lines().filter(l => l.cust === 'me' && l.status === 'ok').reduce((a,l) => a + l.amt, 0);
  const asc = [...S.ledger].sort((a,b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.seq - b.seq);
  let run = 0; const balAt = {}; asc.forEach(l => { run += l.amt; balAt[l.seq] = run; });
  const m0 = TDY.slice(0, 7) + '-01', month = asc.filter(l => l.date >= m0);
  const spent = -month.reduce((a,l) => a + (l.type === 'topup' ? 0 : l.amt), 0);
  const added = month.filter(l => l.type === 'topup').reduce((a,l) => a + l.amt, 0);
  const notCharged = month.flatMap(l => l.items || []).filter(i => i.status !== 'ok').reduce((a,i) => a + i.amt, 0);
  const f = ui.wf, FIL = {all:() => true, delivery:l => l.type === 'delivery', order:l => l.type === 'order', money:l => l.type === 'topup' || l.type === 'refund'};
  let html = '', last = '';
  asc.slice().reverse().filter(FIL[f] || FIL.all).forEach(l => {
    if (l.date !== last){ last = l.date; html += `<div class="ld">${dayLabel(l.date)}</div>`; }
    const items = l.items && l.items.length, open = items && ui.wOpen === l.seq;
    html += `<button class="lgr" data-a="w-open" data-v="${l.seq}" data-type="${l.type}" ${items ? `aria-expanded="${open}"` : 'tabindex="-1"'}><span class="lic ${l.type}">${icon(LTYPE[l.type][0], 16)}</span>
      <span class="lgt"><b>${ledgerTitle(l)}</b><small>${ledgerSub(l)}</small></span><span class="lgv"><b class="amt ${l.kind}">${sgn(l.amt)}</b><small>Balance ${rs(balAt[l.seq])}</small></span></button>`;
    if (open) html += `<div class="lgx">${l.items.map(i => `<div class="lgx-r ${i.status === 'ok' ? '' : 'off'}">${thumb(P[i.prod], 'sm')}<span>${P[i.prod].name} × ${i.qty}</span><b>${i.status === 'ok' ? rs(i.amt) : (i.status === 'paused' ? 'Paused' : 'Skipped') + ' · ₹0'}</b></div>`).join('')}</div>`;
  });
  const chip = (v, l) => `<button class="cchip sm ${f === v ? 'on' : ''}" data-a="wf" data-v="${v}" aria-pressed="${f === v}">${l}</button>`;
  return `<div class="wc"><small>Vaaradhi wallet balance ${demoTag()}</small><b>${rs(balance())}</b>
      <div class="wc-row"><span>${S.phase === 'delivered' ? 'Charged this morning' : 'Tomorrow\'s charge'}</span><span>${rs(charge)}</span></div></div>
    <div class="topups">${[500,1000,2000].map(a => `<button data-a="topup" data-v="${a}">+ ${rs(a)}</button>`).join('')}</div>
    <div class="note">Demo only: balances and top-ups are simulated and no real payment happens. In the proposed setup, customers are charged only on days something is delivered, paused or skipped days cost ₹0, and the balance is held by Vaaradhi Farms.</div>
    <div class="sh">This month</div>
    <div class="wsum"><div><span>Spent</span><b>${rs(spent)}</b></div><div><span>Added</span><b>${rs(added)}</b></div><div class="g"><span>Not charged</span><b>${rs(notCharged)}</b><small>skips & pauses</small></div></div>
    <div class="sh">History</div>
    <div class="chips wf">${chip('all','All')}${chip('delivery','Deliveries')}${chip('order','Orders')}${chip('money','Top-ups & refunds')}</div>
    <div class="box lbox">${html || '<div class="row"><div class="t"><small>Nothing here yet.</small></div></div>'}</div>
    <p class="fine">Tap a delivery or order to see each item.</p>
    <div class="spacer"></div>`;
}
/* Breakfast plans Vaaradhi has put on sale, and the concepts not launched yet (customers can still share interest in those). */
const liveMeals = () => PRODUCTS.filter(p => p.meal && forSale(p));
const openConcepts = () => window.MEAL_PLANS.plans.filter(c => !(S.meals || []).some(m => m.from === c.id && !m.hidden));
function mealsBody(){
  const MP = window.MEAL_PLANS, live = liveMeals(), concepts = openConcepts(), mine = mySubs();
  const sched = p => p.schedule === 'weekdays' ? 'Weekdays' : p.schedule === 'weekly' ? 'Once a week' : 'You choose the days';
  const serv = p => p.servingsOptions.length > 1 ? `${p.servingsOptions[0]}–${p.servingsOptions[p.servingsOptions.length - 1]} servings` : `${p.servingsOptions[0]} serving`;
  const liveCard = p => { const s = mine[p.id];
    return `<div class="mp live" data-meal="${p.id}"><div class="mp-top"><span class="th lg">${visual(p)}</span><div><b>${p.name}</b><small>${daysText(p.days)}</small></div><span class="mp-price">${rs(p.price)}<small>per serving</small></span></div>
      <div class="mp-menu"><span>What's included</span>${esc(p.desc)}</div>
      ${s ? `<div class="mp-mine">${icon('repeat', 15)}<span>Subscribed: <b>${s.qty} × ${freqLabel(s)}</b></span></div>` : ''}
      <div class="two-btn">${p.sub ? `<button class="btn2 ${s ? '' : 'pri'}" data-a="${s ? 'manage' : 'buy-open'}" data-v="${s ? s.id : p.id + '|sub'}">${icon('repeat', 15)}${s ? 'Manage' : 'Subscribe'}</button>` : ''}
        ${p.once ? `<button class="btn2" data-a="buy-open" data-v="${p.id}|tmr">Order for tomorrow</button>` : ''}</div></div>`; };
  const conceptCard = p => { const mi = myInterest(p.id); return `<div class="mp ${mi ? 'done' : ''}">
      <div class="mp-top"><span class="ei">${icon('bowl', 20)}</span><div><b>${p.name}</b><small>${p.summary}</small></div></div>
      <div class="mp-chips"><span class="chip g">${sched(p)}</span><span class="chip b">${serv(p)}</span></div>
      <div class="mp-tbc">${icon('clock', 14)}${MP.unconfirmedLabel}</div>
      ${mi ? `<div class="mp-mine">${icon('check', 15)}<span>Interest shared: <b>${daysText(mi.days)} · ${servText(mi.servings)}${mi.fulfil ? ' · ' + FUL[mi.fulfil] : ''}</b></span></div>
        <div class="two-btn"><button class="btn2" data-a="meal-open" data-v="${p.id}">Edit preferences</button><button class="btn2 danger" data-a="meal-withdraw" data-v="${p.id}">${ui.confirmWd === p.id ? 'Tap again to withdraw' : 'Withdraw'}</button></div>`
        : `<button class="btn2 pri" data-a="meal-open" data-v="${p.id}">Share my preferences</button>`}</div>`; };
  return `${live.length ? `<div class="sh" style="padding-top:6px">Available now · ${live.length}</div>${live.map(liveCard).join('')}
      <p class="fine" style="margin:0 16px 4px">Subscribe for the days you want, or order a single breakfast for tomorrow. Change or skip until ${CUTOFF} the day before.</p>` : ''}
    ${concepts.length ? `${live.length ? '<div class="sh">Coming soon · tell Vaaradhi what you\'d like</div>' : ''}
    <div class="mp-intro"><span class="etag">Concept preview</span><p><b>Healthy breakfast, made a regular habit.</b> Scribr proposes exploring flexible healthy-breakfast plans that could make it easier for Vaaradhi customers to enjoy their favourites regularly. Menu, pricing and availability would be defined with Vaaradhi Farms.</p></div>
    ${concepts.map(conceptCard).join('')}
    <p class="fine">Sharing preferences is an expression of interest only. It is not an order or a subscription, nothing is charged, and Vaaradhi Farms has not confirmed any of these plans.</p>` : ''}
    <div class="spacer"></div>`;
}
function sheetHTML(){
  const sh = ui.sheet; if (!sh) return '';
  let inner = '', foot = '';
  if (sh.type === 'buy'){
    const p = P[sh.prod], q = sh.qty;
    const modes = (p.meal ? [p.once && ['tmr','Tomorrow','One breakfast'], p.sub && ['sub','Subscribe','Your days']].filter(Boolean)
      : [['now','Today', nowOpen() ? 'Same-day' : 'Closed now'], ['tmr','Tomorrow','Next delivery'], ['sub','Subscribe','Repeat it']]).filter(m => m[0] !== 'sub' || subFreqs(p).length);
    let body = '';
    if (sh.mode === 'now'){
      const out = stockOf(p.id) <= 0;
      body = `<div class="fld r"><label>QUANTITY</label>${qbtn('s-qty','q',q)}</div>
        <div class="info ${out ? 'warn' : ''}">${icon(out ? 'x' : 'truck', 16)}${out ? 'Out of stock right now. You can still subscribe or add it for tomorrow.' : nowOpen() ? 'Same-day delivery · Home, Manikonda' : 'Same-day ordering is closed for tonight. It reopens tomorrow.'}</div>`;
      foot = `<button class="cta" data-a="cart-add" ${nowOpen() && !out ? '' : 'disabled'}><span>${rs(p.price*q)}<small>TOTAL</small></span><span>Add to cart ›</span></button>`;
    } else if (sh.mode === 'tmr'){
      const issue = p.meal && S.phase === 'open' ? mealTmrIssue(p, q) : '';
      body = `<div class="fld r"><label>${p.meal ? 'SERVINGS' : 'QUANTITY'}</label>${qbtn('s-qty','q',q)}</div>
        <div class="info ${issue ? 'warn' : ''}">${icon(issue ? 'x' : 'sun', 16)}${issue || (S.phase === 'open' ? `Added to your delivery on ${fmtD(TMR)}, with your regular basket` : `Changes for ${fmtD(TMR)} closed at ${CUTOFF}. ${subFreqs(p).length ? `Choose Subscribe to start from ${fmtD(DAT)}.` : p.meal ? 'Orders for the day after open tomorrow.' : 'Order it for same-day delivery tomorrow instead.'}`)}</div>`;
      foot = `<button class="cta" data-a="add-go" ${S.phase !== 'open' || issue ? 'disabled' : ''}><span>${rs(p.price*q)}<small>FOR TOMORROW</small></span><span>Add to tomorrow ›</span></button>`;
    } else {
      const draft = draftSub(sh), dates = draft ? upcomingFor(draft, 4).map(u => fmtS(u.date)) : [];
      const month = draft ? countIn(draft, 30) : 0;
      body = `<div class="fld"><label>HOW OFTEN</label><div class="opts">${subFreqs(p).map(f => `<button class="${sh.freq === f ? 'on' : ''}" data-a="s-freq" data-v="${f}" aria-pressed="${sh.freq === f}">${FREQ[f]}</button>`).join('')}</div></div>
        ${sh.freq === 'days' ? dayPicker(sh.days, 's-day', p.meal ? null : 's-preset', p.meal ? p.days : null) : ''}
        ${p.meal ? `<div class="info">${icon('bowl', 16)}<span>Served on ${daysText(p.days)}.</span></div>` : ''}
        <div class="fld r"><label>${p.meal ? 'SERVINGS PER DAY' : 'QUANTITY'}</label>${qbtn('s-qty','q',q)}</div>
        <div class="fld"><label>${sh.freq === 'weekly' || sh.freq === 'fortnightly' ? 'FIRST DELIVERY (SETS THE DAY)' : 'START'}</label><div class="opts">${startOptions().map(d => `<button class="${sh.start === d ? 'on' : ''}" data-a="s-start" data-v="${d}">${d === TMR ? 'Tomorrow' : fmtD(d)}</button>`).join('')}</div></div>
        ${draft ? `<div class="info">${icon('sun', 16)}<span>Next deliveries: <b>${dates.join(', ')}</b></span></div>` : `<div class="info warn">${icon('x', 16)}Choose at least one day.</div>`}
        <div class="sumg"><div><span>Each delivery</span><b>${rs(p.price*q)}</b></div><div><span>Next 30 days</span><b>${month} × ${rs(p.price*q)}</b></div></div>
        <div class="info">${icon('repeat', 16)}Skip or pause before ${CUTOFF} the day before. Pay only for days delivered.</div>`;
      foot = `<button class="cta c" data-a="sub-go" ${draft ? '' : 'disabled'}>Start subscription</button>`;
    }
    inner = `<div class="ps-img">${visual(p)}${IMG[p.id] && IMG[p.id].representative ? '<span class="rep">Representative photo</span>' : ''}<button class="x" data-a="close" aria-label="Close">×</button></div>
      <div class="ps-b"><div><div class="ps-cat">${p.cat}</div><div class="ps-name">${p.name}</div><div class="ps-meta"><span>${p.unit}${subFreqs(p).length || p.meal ? '' : ' · one-time purchase'}</span><b>${rs(p.price)}</b></div>
        ${p.meal ? `<div class="mp-menu" style="margin-top:8px"><span>What's included</span>${esc(p.desc)}</div>` : ''}</div>
      <div class="modes" role="tablist">${modes.map(([k,l,sub]) => `<button class="${sh.mode === k ? 'on' : ''}" data-a="mode" data-v="${k}" role="tab" aria-selected="${sh.mode === k}"><b>${l}</b><small>${sub}</small></button>`).join('')}</div>
      ${body}</div>`;
  } else if (sh.type === 'cart'){
    const total = orderAmt(S.cart), bal = balance();
    const def = `My basket ${S.baskets.length + 1}`;
    inner = `<div class="sh-pad"><div class="sh-title">Your cart</div>
      <div class="info">${icon('truck', 16)}Same-day delivery · Home, Manikonda</div>
      <div class="box">${S.cart.map(c => { const p = P[c.prod]; return `<div class="row">${thumb(p)}<div class="t"><b>${p.name}</b><small>${p.unit} · ${rs(p.price)}</small></div><div class="rt">${qbtn('c-qty', c.prod, c.qty, true)}<b>${rs(p.price*c.qty)}</b></div></div>`; }).join('')}</div>
      <div class="box bill"><div><span>Item total</span><span>${rs(total)}</span></div><div class="bt"><span>To pay</span><span>${rs(total)}</span></div></div>
      <div class="savebk"><label for="bname">Save this basket to reorder in one tap</label><div class="sb-row"><input id="bname" maxlength="30" value="${esc(ui.bname != null ? ui.bname : def)}" autocomplete="off"><button class="btn2" data-a="save-basket">Save</button></div></div>
      <div class="info">${icon('wallet', 16)}Paying from Vaaradhi wallet · balance ${rs(bal)}${bal < total ? ' · simulated UPI top-up' : ''} ${demoTag()}</div>
      <p class="fine" style="margin-top:0">You can cancel until Vaaradhi accepts your order.</p></div>`;
    foot = `<button class="cta" data-a="place" ${nowOpen() && S.cart.length ? '' : 'disabled'}><span>${rs(total)}<small>TOTAL</small></span><span>Place order ›</span></button>`;
  } else if (sh.type === 'manage'){
    const s = S.subs.find(x => x.id === sh.subId), p = P[s.prod], ups = upcomingChain(s, 6), pend = pendingFrom(s), prev = pend ? S.subs.find(x => x.id === s.replaces) : null;
    const tOnly = S.ovr[s.id] && S.ovr[s.id].qty && S.ovr[s.id].qty !== s.qty ? S.ovr[s.id].qty : null;
    const draft = {...s, freq:sh.freq, days:sh.days, qty:sh.qty};
    const changed = sh.freq !== s.freq || sh.qty !== s.qty || (sh.freq === 'days' && daysText(sh.days || []) !== daysText(s.days || []));
    const valid = sh.freq !== 'days' || (sh.days && sh.days.length);
    inner = `<div class="sh-pad"><div class="mg-head">${thumb(p,'lg')}<div><div class="sh-title" style="padding:0">${p.name}</div><small>Regular: ${s.qty} per delivery · ${freqLabel(s)}${s.pausedFrom ? ' · paused' : ''}</small></div>
        <button class="x sm" data-a="close" aria-label="Close">×</button></div>
      ${pend ? `<div class="info">${icon('sun', 16)}<span>Your change starts <b>${fmtD(pend)}</b>. Until then: ${prev.qty} × ${freqLabel(prev)}.</span></div>` : ''}
      ${tOnly ? `<div class="info">${icon('sun', 16)}<span>Tomorrow only: <b>${tOnly}</b> (set on the Schedule screen). Your regular quantity stays ${s.qty}.</span></div>` : ''}
      <div class="sh" style="padding:4px 16px 0">Upcoming deliveries</div>
      <div class="box">${ups.map(u => `<div class="row up"><div class="t"><b>${fmtD(u.date)}</b><small>${u.status === 'scheduled' ? `${u.qty} × ${p.name}${pend && u.date === pend ? ' · change starts' : ''}` : u.status === 'paused' ? 'Paused' : 'Skipped · not charged'}</small></div>
        <div class="rt">${u.locked ? `<span class="chip k">${icon('lock', 11)} Being prepared</span>` : u.status === 'paused' ? '<span class="chip y">Paused</span>'
          : `<button class="sbtn2 ${u.status === 'skipped' ? 'on' : ''}" data-a="skip-on" data-v="${u.subId}|${u.date}">${u.status === 'skipped' ? 'Undo skip' : 'Skip'}</button>`}</div></div>`).join('') || '<div class="row"><div class="t"><small>No upcoming deliveries.</small></div></div>'}</div>
      <div class="sh" style="padding:4px 16px 0">Change this plan</div>
      <div class="box" style="padding:14px;display:flex;flex-direction:column;gap:12px">
        <div class="fld"><label>HOW OFTEN</label><div class="opts">${subFreqs(p).map(f => `<button class="${sh.freq === f ? 'on' : ''}" data-a="m-freq" data-v="${f}" aria-pressed="${sh.freq === f}">${FREQ[f]}</button>`).join('')}</div></div>
        ${sh.freq === 'days' ? dayPicker(sh.days, 'm-day', p.meal ? null : 'm-preset', p.meal ? p.days : null) : ''}
        <div class="fld r"><label>REGULAR QUANTITY PER DELIVERY</label>${qbtn('m-qty','q',sh.qty)}</div>
        <small class="eff">${changed ? `Changes apply from ${fmtD(effFrom(s))}${valid ? ` · ${freqLabel(draft)}` : ''}.` : `Changes apply from ${fmtD(effFrom(s))}.`}</small>
        <button class="btn2 pri" data-a="m-save" ${changed && valid ? '' : 'disabled'}>Save changes</button></div>
      <div class="two-btn" style="padding:0 14px">${s.pausedFrom ? `<button class="btn2" data-a="p-resume" data-v="${s.id}">Resume plan</button>` : `<button class="btn2" data-a="p-pause" data-v="${s.id}">Pause plan</button>`}
        <button class="btn2 danger" data-a="p-cancel" data-v="${s.id}">${ui.confirmCancel === s.id ? 'Tap again to cancel' : 'Cancel plan'}</button></div>
      <p class="fine" style="margin-top:0">Skip, pause or change before ${CUTOFF} the day before. Pausing or cancelling takes effect from ${fmtD(editFrom())}.</p></div>`;
  } else if (sh.type === 'meal'){
    const MP = window.MEAL_PLANS, p = MP.plans.find(x => x.id === sh.planId), mine = myInterest(p.id), weekly = p.schedule === 'weekly';
    const tbc = ['Menu', 'Price', 'Portion size', 'Ingredients and allergens', 'Delivery or pickup, and availability'];
    if (sh.done){
      inner = `<div class="sh-pad"><div class="mg-head"><span class="ok-ic">${icon('check', 22)}</span><div><div class="sh-title" style="padding:0">Interest recorded</div><small>${p.name} · concept preview</small></div></div>
        <div class="box" style="padding:14px"><div class="row" style="padding:0 0 8px"><div class="t"><b>Preferred days</b><small>${daysText(mine.days)}</small></div></div>
          <div class="row" style="padding:8px 0"><div class="t"><b>Servings</b><small>${servText(mine.servings)} (indicative)</small></div></div>
          <div class="row" style="padding:8px 0 0"><div class="t"><b>Delivery or pickup</b><small>${mine.fulfil ? FUL[mine.fulfil] + ' (a preference, to be confirmed by Vaaradhi)' : 'No preference given'}</small></div></div></div>
        <div class="info">${icon('bell', 16)}<span><b>This is not an order.</b> Nothing is charged, no delivery is scheduled, and Vaaradhi Farms has not confirmed this plan. Your preferences help decide whether to offer it.</span></div></div>`;
      foot = `<div class="two-btn"><button class="btn2" data-a="meal-edit">Edit preferences</button><button class="btn2 pri" data-a="close">Done</button></div>`;
    } else {
      const same = mine && mine.servings === sh.servings && daysText(mine.days) === daysText(sh.days) && (mine.fulfil || null) === (sh.fulfil || null);
      const ok = sh.days.length > 0;
      inner = `<div class="sh-pad"><div class="mg-head"><span class="ok-ic meal">${icon('bowl', 22)}</span><div><div class="sh-title" style="padding:0">${p.name}</div><small>${p.summary}</small></div>
          <button class="x sm" data-a="close" aria-label="Close">×</button></div>
        <div class="box tbc"><div class="ic-sub" style="padding:12px 0 4px">To be confirmed with Vaaradhi Farms</div>${tbc.map(t => `<div class="row"><div class="t"><b>${t}</b></div><span class="chip y">To be confirmed</span></div>`).join('')}</div>
        <div class="sh" style="padding:4px 16px 0">Your preferences</div>
        <div class="box" style="padding:14px;display:flex;flex-direction:column;gap:12px">
          ${weekly ? `<div class="fld"><label>WHICH DAY OF THE WEEK</label><div class="opts days">${DOW_ORDER.map(d => `<button class="${sh.days.includes(d) ? 'on' : ''}" data-a="meal-day" data-v="${d}" aria-pressed="${sh.days.includes(d)}">${DOW[d]}</button>`).join('')}</div></div>`
                   : dayPicker(sh.days, 'meal-day', 'meal-preset')}
          <div class="fld"><label>SERVINGS (INDICATIVE)</label><div class="opts">${p.servingsOptions.map(n => `<button class="${sh.servings === n ? 'on' : ''}" data-a="meal-serv" data-v="${n}" aria-pressed="${sh.servings === n}">${servText(n)}</button>`).join('')}</div></div>
          <div class="fld"><label>DELIVERY OR PICKUP (OPTIONAL)</label><div class="opts">${['delivery','pickup','either'].map(f => `<button class="${sh.fulfil === f ? 'on' : ''}" data-a="meal-ful" data-v="${f}" aria-pressed="${sh.fulfil === f}">${FUL[f]}</button>`).join('')}</div>
            <small class="eff">A preference only. Vaaradhi Farms would confirm which options, if any, can be offered.</small></div>
          ${ok ? `<div class="info" style="margin:0">${icon('sun', 16)}<span>${daysText(sh.days)} · ${servText(sh.servings)}${sh.fulfil ? ' · ' + FUL[sh.fulfil] : ''}</span></div>` : `<div class="info warn" style="margin:0">${icon('x', 16)}Choose at least one day.</div>`}
        </div>
        <div class="info">${icon('bell', 16)}<span>This shares your interest with Vaaradhi Farms. <b>It is not an order or a subscription</b>, and nothing is charged.</span></div></div>`;
      foot = `<button class="cta c" data-a="meal-submit" ${ok && !same ? '' : 'disabled'}>${same ? 'Preferences already shared' : mine ? 'Update my interest' : 'Share my interest'}</button>`;
    }
  } else if (sh.type === 'cutoff'){
    const s = sh.subId ? S.subs.find(x => x.id === sh.subId) : null, next = s ? nextEligible(s) : null, p = P[sh.prod];
    inner = `<div class="sh-pad"><div class="sh-title">Tomorrow's delivery is being prepared</div>
      <div class="info">${icon('lock', 16)}Changes for ${fmtD(TMR)} closed at ${CUTOFF}. ${p.name} will arrive as planned.</div>
      ${next ? `<div class="info">${icon('sun', 16)}<span>Next delivery you can change: <b>${fmtD(next)}</b></span></div>`
             : s ? '' : `<div class="info">${icon('bag', 16)}This one-time item is already packed into tomorrow's delivery.</div>`}</div>`;
    foot = next ? `<div class="two-btn"><button class="btn2" data-a="close">Keep as planned</button><button class="btn2 pri" data-a="skip-date" data-v="${s.id}|${next}">Skip ${fmtS(next)} instead</button></div>`
                : `<button class="cta c" data-a="close">OK</button>`;
  } else if (sh.type === 'vac'){
    const from = editFrom(), len = sh.len, days = len || 7;
    let n = 0, amt = 0;
    for (let i = 0; i < days; i++){ const d = plus(from, i); S.subs.forEach(s => { if (s.cust === 'me' && delivers(s,d) && !s.pausedFrom){ n++; amt += s.qty*P[s.prod].price; } }); }
    const to = len ? plus(from, len-1) : null;
    const allPlans = activeSubs('me').filter(s => !s.cancelledFrom);
    inner = `<div class="sh-pad"><div class="sh-title">Pause all your plans?</div>
      <div class="info">${icon('plane', 16)}<span>Vacation mode pauses <b>all ${allPlans.length} plans</b>: ${allPlans.map(s => P[s.prod].name).join(', ')}. To pause just one, close this and use <b>Manage</b> on that plan.</span></div>
      <div class="box" style="padding:14px;display:flex;flex-direction:column;gap:12px">
        <div class="fld"><label>PAUSE FOR</label><div class="opts">${[[3,'3 days'],[7,'1 week'],[14,'2 weeks'],[0,'Until I\'m back']].map(([k,l]) => `<button class="${len === k ? 'on' : ''}" data-a="vac-len" data-v="${k}">${l}</button>`).join('')}</div></div>
        <div class="sumg"><div><span>Paused</span><b style="font-size:15px">${to ? fmtS(from) + ' – ' + fmtS(to) : 'From ' + fmtS(from)}</b></div><div><span>${len ? 'Not charged' : 'Saved each week'}</span><b>${rs(amt)}</b></div></div></div>
      <div class="info">${icon('bell', 16)}${n} deliveries will be skipped. Vaaradhi is told right away, so nothing is packed for you.${S.phase !== 'open' ? ` Tomorrow is already being prepared, so the pause starts ${fmtD(DAT)}.` : ''}</div></div>`;
    foot = `<button class="cta c" data-a="vac-go">Pause all plans</button>`;
  }
  return `<div class="scrim" data-a="close"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet-sc">${inner}</div>${foot ? `<div class="sh-foot">${foot}</div>` : ''}</div>`;
}
function custHTML(){
  const t = ui.cTab;
  const logo = BRAND && CFG.brandAssets.logo;
  let head;
  if (t === 'home') head = `<div class="hh"><div class="hh-top"><div class="hh-brand">${logo ? `<img class="hh-logo" src="${logo}" alt="Vaaradhi Farms">` : '<b class="hh-name">Vaaradhi Farms</b>'}
      <span class="ch-addr">${icon('pin', 13)}Home · Manikonda, Hyderabad</span></div><div class="ch-av" aria-label="Ananya Rao">AR</div></div>
      <button class="search sfake" data-a="go-search">${icon('search', 18)}<span>Search oils, millets, dals…</span></button></div>`;
  else if (t === 'shop') head = shopHead();
  else if (t === 'meals') head = `<div class="ct ctb"><button class="back" data-a="ctab" data-v="home" aria-label="Back to Home">${icon('back', 20)}</button><div><h2>Healthy Meal Plans</h2><p>${liveMeals().length ? 'Subscribe, or order for a day' : 'Concept preview · ' + window.MEAL_PLANS.unconfirmedLabel.toLowerCase()}</p></div></div>`;
  else head = `<div class="ct"><h2>${{orders:'Orders', sched:'Your schedule', wallet:'Wallet'}[t]}</h2><p>${{orders:'Track today\'s orders and order again', sched:'Recurring deliveries and tomorrow\'s basket', wallet:'Prepaid balance with Vaaradhi Farms'}[t]}</p></div>`;
  const body = t === 'home' ? homeBody() : t === 'shop' ? shopBody() : t === 'orders' ? ordersBody() : t === 'sched' ? tomorrowBody() : t === 'meals' ? mealsBody() : walletBody();
  const n = S.cart.reduce((a,c) => a + c.qty, 0);
  const cart = (t === 'home' || t === 'shop') && n ? `<button class="cartbar" data-a="cart-open"><span class="cb-th">${S.cart.slice(0,3).map(c => `<span class="cbv">${visual(P[c.prod])}</span>`).join('')}</span>
      <span class="cb-t"><b>View cart</b><small>${n} item${n > 1 ? 's' : ''} · ${rs(orderAmt(S.cart))}</small></span><span class="cb-go">›</span></button>` : '';
  return `<div class="body${t === 'shop' ? ' shopbody' : ''}" data-scroll="c-${t}">${head}${body}</div>${cart}
    ${nav([['home','Home','home'],['shop','Shop','bag'],['orders','Orders','receipt'],['sched','Schedule','sun'],['wallet','Wallet','wallet']], t === 'meals' ? 'home' : t, 'ctab', {orders:S.orders.filter(o => o.cust === 'me' && isLive(o)).length})}
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
const backBar = (to, title, sub) => `<div class="ctb mback"><button class="back" data-a="mtab" data-v="${to}" aria-label="Back">${icon('back', 20)}</button><div><b>${title}</b><small>${sub}</small></div></div>`;

/* ---------- shared merchant data ---------- */
/* Every plan a customer currently has (the newest version of each), with its status for the merchant. */
function planStatus(s){
  if (s.cancelledFrom) return s.cancelledFrom <= TMR ? ['ended', 'Ended', 'r'] : ['changes', 'Ends ' + fmtS(s.cancelledFrom), 'y'];
  const pend = pendingFrom(s); if (pend) return ['changes', 'Changes ' + fmtS(pend), 'b'];
  if (s.pausedFrom) return s.pausedFrom > TMR ? ['changes', 'Pauses ' + fmtS(s.pausedFrom), 'y'] : ['paused', 'Paused', 'y'];
  const v = S.vac[s.cust];
  if (v && (!v.to || v.to >= TMR)) return v.from <= TMR ? ['paused', v.to ? 'Away till ' + fmtS(v.to) : 'Away', 'y'] : ['changes', 'Away from ' + fmtS(v.from), 'y'];
  if (s.start > TMR) return ['changes', 'Starts ' + fmtS(s.start), 'b'];
  return ['active', 'Active', 'g'];
}
function planRows(){
  return S.subs.filter(s => !s.replacedBy).map(s => ({s, st:planStatus(s), group:planStatus(s)[0]}))
    .sort((a, b) => C[a.s.cust].name.localeCompare(C[b.s.cust].name) || planOrder(a.s, b.s));
}
/* One-time orders plus tomorrow's recurring deliveries (one per customer stop). Recurring deliveries are
   calculated from plans, so only tomorrow's exist; past recurring deliveries are not stored as orders. */
const OGROUP = {placed:'open', accepted:'open', packed:'open', out:'open', scheduled:'open', preparing:'open', delivered:'done', cancelled:'cancelled'};
function opsItems(){
  const one = S.orders.map(o => ({kind:'one', id:o.id, cust:o.cust, items:o.items, amt:o.amt, status:o.status, date:o.date, t:o.t}));
  const rec = stops().map(s => ({kind:'rec', id:'r-' + s.cust, cust:s.cust, items:s.lines.map(l => ({prod:l.prod, qty:l.qty, extra:l.kind === 'extra'})), amt:s.amt,
    status: S.done[s.cust] ? 'delivered' : S.phase === 'open' ? 'scheduled' : 'preparing', date:TMR}));
  return [...one, ...rec];
}
/* What customers changed for tomorrow, read from tomorrow's list (the locked snapshot after the cutoff). */
function tomorrowChanges(){
  const out = [];
  lines().forEach(l => {
    const p = P[l.prod].name, s = l.subId ? S.subs.find(x => x.id === l.subId) : null;
    if (l.status === 'skipped') out.push({k:'skip', cust:l.cust, text:`${p} × ${l.qty} skipped`, d:-l.qty});
    else if (l.status === 'paused') out.push({k:'pause', cust:l.cust, text:`${p} × ${l.qty} paused${S.vac[l.cust] ? ' (vacation)' : ''}`, d:-l.qty});
    else if (l.kind === 'extra') out.push({k:'add', cust:l.cust, text:`${p} × ${l.qty} one-time add-on`, d:l.qty});
    else if (s){
      if (l.qty !== s.qty) out.push({k:'qty', cust:l.cust, text:`${p}: ${l.qty} instead of ${s.qty} (tomorrow only)`, d:l.qty - s.qty});
      if (s.start === TMR && s.replaces){ const prev = S.subs.find(x => x.id === s.replaces); out.push({k:'change', cust:l.cust, text:`${p}: plan changed, now ${s.qty} × ${freqLabel(s)}`, d: prev ? s.qty - prev.qty : 0}); }
      else if (s.start === TMR && s.isNew) out.push({k:'new', cust:l.cust, text:`${p} × ${l.qty} new plan, first delivery`, d:l.qty});
    }
  });
  S.subs.filter(s => s.cancelledFrom === TMR && !s.replacedBy && TMR >= s.start && freqOk(s.freq, s.anchor || s.start, TMR, s.days))
    .forEach(s => out.push({k:'cancel', cust:s.cust, text:`${P[s.prod].name} × ${s.qty} plan cancelled`, d:-s.qty}));
  return out;
}
const allInterest = () => [...(S.mealSamples || []).map(x => ({...x, sample:true})), ...S.mealInterest];
const FUL = {delivery:'Delivery', pickup:'Pickup', either:'Either / no preference'};

/* ---------- Overview ---------- */
/* Top to bottom: the day at a glance, what to act on now (big coloured tiles), shortcuts, today's one-time orders as
   one progress bar, recurring plans, then demo insights and links. Every figure links to the screen behind it. */
function mHome(){
  const today = S.orders.filter(o => o.date === TDY && o.status !== 'cancelled');
  const newO = today.filter(o => o.status === 'placed'), prog = today.filter(o => ['accepted','packed','out'].includes(o.status)), doneO = today.filter(o => o.status === 'delivered');
  const st = stops(), items = Object.values(prep()).reduce((a, b) => a + b, 0), rows = planRows(), cnt = g => rows.filter(r => r.group === g).length;
  const ch = tomorrowChanges(), mi = allInterest().length, inv = stockSummary(), pl = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const head = S.phase === 'open' ? `Tomorrow's list locks at ${CUTOFF}` : S.phase === 'locked' ? `Locked at ${CUTOFF} · ready to pack` : 'Morning run done';
  const pill = simNote() || (S.phase === 'open' ? leftText() : '');
  const tile = (cls, n, label, sub, a, v) => `<button class="att ${cls}" data-a="${a}" data-v="${v}"><b>${n}</b><span class="at-l">${label}</span><small>${sub}</small><i>›</i></button>`;
  const stockN = inv.short.length + inv.out.length;
  const tiles = [
    newO.length && tile('new', newO.length, newO.length === 1 ? 'New order' : 'New orders', newO.slice(0, 2).map(o => `#${o.id} ${C[o.cust].name.split(' ')[0]} · ${rs(o.amt)}`).join(', ') + ' · accept now', 'mtab', 'orders'),
    stockN && tile('warn', stockN, 'Stock alerts', [inv.short.length && `${inv.short.length} short for tomorrow`, inv.out.length && `${inv.out.length} out of stock`].filter(Boolean).join(' · '), 'sf-go', 'attn'),
    prog.length && tile('inprog', prog.length, 'In progress', 'One-time orders being packed or delivered', 'mtab', 'orders'),
    ch.length && tile('tchg', ch.length, ch.length === 1 ? 'Change for tomorrow' : 'Changes for tomorrow', 'Skips, pauses, add-ons and new plans', 'mtab', 'today'),
  ].filter(Boolean);
  const subCust = new Set(rows.filter(r => r.group !== 'ended').map(r => r.s.cust));
  const byCust = {}; S.orders.filter(o => o.status !== 'cancelled').forEach(o => byCust[o.cust] = (byCust[o.cust] || 0) + 1);
  const repeat = new Set([...subCust, ...Object.keys(byCust).filter(c => byCust[c] >= 2)]);
  const prodPlans = {}; rows.filter(r => r.group !== 'ended').forEach(r => prodPlans[r.s.prod] = (prodPlans[r.s.prod] || 0) + 1);
  const top = Object.entries(prodPlans).sort((a, b) => b[1] - a[1] || P[a[0]].name.localeCompare(P[b[0]].name)).slice(0, 3);
  const kpi = (k, label, val, a, v) => `<button class="kpi" data-kpi="${k}" data-a="${a}" data-v="${v}"><b>${val}</b><span>${label}</span></button>`;
  const seg = (k, label) => `<button class="seg3b ${k}" data-kpi="${k}" data-a="mplans" data-v="${k}"><b>${cnt(k)}</b><span>${label}</span></button>`;
  const link = (ic, k, a, v, title, sub, badge = '') => `<button class="row lrow" ${k ? `data-kpi="${k}"` : ''} data-a="${a}" data-v="${v}"><span class="lri">${icon(ic, 17)}</span><span class="t"><b>${title}</b><small>${sub}</small></span>${badge}<i>›</i></button>`;
  const qa = (ic, label, a, v = '') => `<button class="qa" data-a="${a}" ${v ? `data-v="${v}"` : ''}><span>${icon(ic, 20)}</span>${label}</button>`;
  const segs = [['new', newO.length, 'New'], ['inprog', prog.length, 'In progress'], ['done', doneO.length, 'Delivered']];
  const bar = today.length ? segs.filter(x => x[1]).map(([k, n]) => `<i class="${k}" style="flex:${n}"></i>`).join('') : '<i class="none" style="flex:1"></i>';
  const paid = today.reduce((a, o) => a + o.amt, 0), meals = liveMeals();
  return `<div class="mcard ov"><div class="ov-top"><small>${fmtD(TDY)}</small>${pill ? `<span class="ov-pill">${icon('clock', 12)}${pill}</span>` : ''}</div>
      <div class="big">${head}</div>
      <div class="kpis">${kpi('orders', 'Orders today', today.length, 'mtab', 'orders')}${kpi('stops', 'Deliveries tomorrow', st.length, 'mtab', 'today')}${kpi('items', 'Items to pack', items, 'mtab', 'today')}</div></div>
    <div class="sh">Needs attention${tiles.length ? ' · ' + tiles.length : ''}</div>
    ${tiles.length ? `<div class="atts">${tiles.join('')}</div>` : `<div class="allgood">${icon('check', 18)}<span><b>All caught up</b>Nothing needs attention right now.</span></div>`}
    ${cnt('changes') ? `<button class="mini-alert" data-a="mplans" data-v="changes">${icon('repeat', 15)}<span>${pl(cnt('changes'), 'plan')} with upcoming changes</span><i>›</i></button>` : ''}
    <div class="qas">${qa('plus', 'Add product', 'np-open')}${qa('bowl', 'Breakfast plan', 'bf-new')}${qa('box', 'Stock', 'mtab', 'stock')}${qa('truck', 'Delivery run', 'mtab', 'run')}</div>
    <div class="sh">Today's one-time orders</div>
    <button class="obar" data-a="mtab" data-v="orders"><span class="ob-top"><b>${today.length} order${today.length === 1 ? '' : 's'}</b><span>${rs(paid)} paid ${demoTag()}</span></span>
      <span class="ob-bar">${bar}</span>
      <span class="ob-leg">${segs.map(([k, n, l]) => `<span class="${k}"><i></i>${l} <b>${n}</b></span>`).join('')}</span></button>
    <div class="sh">Recurring plans</div>
    <div class="seg3">${seg('active', 'Active')}${seg('paused', 'Paused')}${seg('changes', 'Changing soon')}</div>
    <div class="topprod"><span>Most subscribed</span>${top.map(([id, n]) => `<span class="chip k2">${P[id].name} · ${n}</span>`).join('') || '<span class="chip k2">None yet</span>'}</div>
    <div class="sh">Repeat ordering ${demoTag()}</div>
    <div class="mini3"><div><b>${repeat.size}<small>/${CUSTOMERS.length}</small></b><span>Repeat customers</span></div><div><b>${Math.round(subCust.size / CUSTOMERS.length * 100)}%</b><span>Customers on a plan</span></div><div><b>${doneO.length}<small>/${today.length}</small></b><span>Orders done today</span></div></div>
    <p class="fine">Demo data: these figures come from the sample customers in this prototype. They are not Vaaradhi's results or a forecast. Repeat customers have an active plan or 2+ one-time orders.</p>
    <div class="box links" style="margin-top:12px">
      ${link('box', 'stock', 'mtab', 'stock', 'Stock', `${inv.ok.length} in stock · ${inv.low.length} low · ${inv.short.length} short · ${inv.out.length} out`)}
      ${link('bowl', 'bfplans', 'mtab', 'bf', 'Breakfast plans', meals.length ? `${meals.length} on sale` : 'None on sale yet · add one')}
      ${link('bell', 'interest', 'mtab', 'interest', 'Breakfast plan interest', 'Proposed, not orders', `<b class="lrn">${mi}</b>`)}
      ${link('wallet', '', 'mtab', 'earn', 'Earnings & collections', 'Simulated figures only')}
    </div>
    <div class="spacer"></div>`;
}

/* ---------- Orders ---------- */
/* One row of date tabs (Today: one-time orders; Tomorrow: recurring deliveries; Earlier: past one-time orders),
   a summary strip, status chips, then orders grouped by what to do next. Each card has a coloured status edge and one action. */
function mOrders(){
  const f = ui.of, all = opsItems();
  const inDate = (o, dt) => dt === 'all' || (dt === 'today' && o.date === TDY) || (dt === 'tomorrow' && o.date === TMR) || (dt === 'earlier' && o.date < TDY);
  const base = all.filter(o => (f.type === 'all' || o.kind === f.type) && inDate(o, f.date));
  const list = base.filter(o => f.status === 'all' || OGROUP[o.status] === f.status)
    .sort((a, b) => (OGROUP[a.status] === 'open' ? 0 : 1) - (OGROUP[b.status] === 'open' ? 0 : 1) || (a.status === 'placed' ? -1 : 0) - (b.status === 'placed' ? -1 : 0) || (b.date > a.date ? 1 : b.date < a.date ? -1 : 0) || (String(b.id) > String(a.id) ? 1 : -1));
  const today = S.orders.filter(o => o.date === TDY), paid = today.filter(o => o.status !== 'cancelled');
  const n = g => base.filter(o => g === 'all' || OGROUP[o.status] === g).length;
  const dn = dt => all.filter(o => (f.type === 'all' || o.kind === f.type) && inDate(o, dt)).length;
  const tab = (v, l) => `<button class="otab ${f.date === v ? 'on' : ''}" data-a="of" data-v="date:${v}" aria-pressed="${f.date === v}">${l}<i>${dn(v)}</i></button>`;
  const schip = (v, l) => `<button class="ostat ${v} ${f.status === v ? 'on' : ''}" data-a="of" data-v="status:${v}" aria-pressed="${f.status === v}">${v === 'all' ? '' : '<i></i>'}${l} <b>${n(v)}</b></button>`;
  const stLbl = o => o.kind === 'rec' ? {scheduled:'Scheduled', preparing:'Preparing', delivered:'Delivered'}[o.status] : o.status === 'placed' ? 'New · paid' : OLBL[o.status];
  const stCls = o => o.status === 'placed' ? 'y' : o.status === 'delivered' ? 'g' : o.status === 'cancelled' ? 'r' : o.kind === 'rec' ? 'g' : 'b';
  const steps = o => { const i = FLOW.indexOf(o.status); return `<span class="osteps" role="img" aria-label="Step ${i + 1} of ${FLOW.length}: ${OLBL[o.status]}">${FLOW.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</span>`; };
  const its = o => `<div class="ord-line"><span class="ord-th">${o.items.slice(0, 3).map(it => thumb(P[it.prod], 'xs')).join('')}</span><span class="ord-tx">${o.items.map(it => `${P[it.prod].name} × ${it.qty}${it.extra ? ' <em class="addon">add-on</em>' : ''}`).join(', ')}</span></div>`;
  const meta = o => o.kind === 'one' ? `#${o.id} · ${o.date === TDY ? '' : dayLabel(o.date) + ', '}${o.t} IST · ${C[o.cust].area}` : `Recurring plan · ${C[o.cust].area}`;
  const card = o => `<div class="ord s-${o.status} ${o.status === 'placed' ? 'new' : ''} ${OGROUP[o.status] !== 'open' ? 'past' : ''}" data-kind="${o.kind}" data-oid="${o.id}">
      <div class="ord-top">${avatar(o.cust)}<div class="ord-who"><b>${C[o.cust].name}${o.cust === 'me' ? '<span class="you">demo</span>' : ''}</b><small>${meta(o)}</small></div>
        <div class="ord-amt"><b>${rs(o.amt)}</b><span class="chip ${stCls(o)}">${stLbl(o)}</span></div></div>
      ${its(o)}
      ${o.kind === 'one' && NEXT[o.status] ? (o.status === 'placed' ? `<button class="bigbtn" data-a="oadv" data-v="${o.id}">${NEXT[o.status]}</button>`
        : `<div class="ord-act">${steps(o)}<button class="sbtn" data-a="oadv" data-v="${o.id}">${NEXT[o.status]}</button></div>`) : ''}</div>`;
  const GROUPS = [['new', 'New · accept to start', o => o.kind === 'one' && o.status === 'placed'], ['inprog', 'In progress', o => o.kind === 'one' && ['accepted','packed','out'].includes(o.status)],
    ['rec', 'Recurring deliveries · ' + fmtD(TMR), o => o.kind === 'rec' && o.status !== 'delivered'], ['done', 'Delivered', o => o.status === 'delivered'], ['cancelled', 'Cancelled', o => o.status === 'cancelled']];
  const body = GROUPS.map(([k, h, fn]) => { const g = list.filter(fn); return g.length ? `<div class="sh og ${k}"><i></i>${h} · ${g.length}</div>${g.map(card).join('')}` : ''; }).join('');
  const recNote = (f.type === 'rec' && f.date !== 'tomorrow' && f.date !== 'all') ? `Recurring deliveries are listed for tomorrow (${fmtD(TMR)}). Past recurring deliveries aren't kept as order records in this demo.`
    : f.date === 'tomorrow' && f.type === 'one' ? 'No orders match these filters. One-time orders are same-day, so none exist for tomorrow.' : 'No orders match these filters.';
  const st = stops(), tItems = Object.values(prep()).reduce((a, b) => a + b, 0);
  const strip = f.date === 'tomorrow'
    ? `<div class="osum"><div><b>${st.length}</b><span>Stops</span></div><div><b>${tItems}</b><span>Items</span></div><div><b>${rs(st.reduce((a, x) => a + x.amt, 0))}</b><span>Value ${demoTag()}</span></div></div>
       <div class="two-btn" style="padding:10px 14px 0"><button class="btn2" data-a="mtab" data-v="today">${icon('list', 15)}Prep sheet</button><button class="btn2 pri" data-a="mtab" data-v="run">${icon('truck', 15)}Delivery run</button></div>`
    : `<div class="osum"><div class="y"><b>${today.filter(o => o.status === 'placed').length}</b><span>New</span></div><div class="b"><b>${today.filter(o => ['accepted','packed','out'].includes(o.status)).length}</b><span>In progress</span></div><div><b>${rs(paid.reduce((a,o) => a + o.amt, 0))}</b><span>Paid today ${demoTag()}</span></div></div>`;
  return `<div class="otabs">${tab('today', 'Today')}${tab('tomorrow', 'Tomorrow')}${tab('earlier', 'Earlier')}${tab('all', 'All')}</div>
    ${strip}
    <div class="ostats">${schip('all', 'All')}${schip('open', 'Open')}${schip('done', 'Delivered')}${schip('cancelled', 'Cancelled')}</div>
    <div class="tog">${['all','one','rec'].map(v => `<button class="${f.type === v ? 'on' : ''}" data-a="of" data-v="type:${v}" aria-pressed="${f.type === v}">${{all:'All types', one:'One-time', rec:'Recurring'}[v]}</button>`).join('')}</div>
    ${list.length ? body : `<div class="note" style="margin-top:12px">${recNote}</div>`}
    <p class="fine">${nowOpen() ? 'Same-day ordering is open.' : 'Same-day ordering is closed for tonight.'} One-time orders are paid in the app before you accept them (simulated). Recurring deliveries come from customers' plans and are marked delivered on the delivery run. Times are IST.</p><div class="spacer"></div>`;
}

/* ---------- Tomorrow's preparation ---------- */
function mToday(){
  const st = stops(), pr = prep(), items = Object.values(pr).reduce((a,b) => a+b, 0), rev = st.reduce((a,s) => a+s.amt, 0);
  const ok = okLines(), split = {}; ok.forEach(l => { const x = split[l.prod] = split[l.prod] || {plan:0, extra:0}; x[l.kind === 'extra' ? 'extra' : 'plan'] += l.qty; });
  const off = lines().filter(l => l.status !== 'ok'), offQty = off.reduce((a,l) => a+l.qty, 0), offAmt = off.reduce((a,l) => a+l.amt, 0);
  const ch = tomorrowChanges();
  const sub = S.phase === 'open' ? `List locks at ${CUTOFF} · ${leftText()}` : S.phase === 'locked' ? `Locked at ${CUTOFF} · ready to pack` : 'All deliveries done';
  const kpi = (key, label, val, money) => { const f = fl('k_'+key); return `<div class="${f ? 'chg' : ''}"><span>${label}</span><b>${money ? rs(val) : val}</b>${deltaHTML(f, money)}</div>`; };
  const rows = PRODUCTS.filter(p => pr[p.id] || fl('p_'+p.id)).map(p => {
    const f = fl('p_'+p.id), sp = split[p.id] || {plan:0, extra:0};
    const short = Math.max(0, (pr[p.id] || 0) - stockOf(p.id));
    return `<div class="row ${f ? 'chg' : ''}" data-prod="${p.id}">${thumb(p)}<div class="t"><b>${p.name}</b><small>${p.unit} · <span class="bd">${sp.plan} from plans${sp.extra ? ` + ${sp.extra} one-time` : ''}</span></small>${short && S.phase !== 'delivered' ? `<button class="chip r" data-a="stock-open" data-v="${p.id}">Short by ${short} in stock</button>` : ''}</div><div class="q">${deltaHTML(f)}× ${pr[p.id] || 0}</div></div>`;
  }).join('') || '<div class="row"><div class="t"><small>Nothing to prepare for tomorrow.</small></div></div>';
  return `<div class="mcard"><small>Tomorrow · ${fmtD(TMR)}</small><div class="big">${sub}</div>
      <div class="mstats">${kpi('stops','Deliveries',st.length)}${kpi('items','Items to pack',items)}${kpi('rev','Value (demo)',rev,true)}</div></div>
    <button class="intcard" data-a="mtab" data-v="run" style="background:#fff"><span class="ei">${icon('truck', 20)}</span><span class="t"><b>Delivery run · ${st.length} stops</b><small>Grouped by area</small></span><span class="cb-go">›</span></button>
    ${offQty ? `<div class="saved"><b>${offQty} items not packed</b> because customers paused or skipped (${rs(offAmt)}). Nothing is made that won't be paid for.</div>` : ''}
    <div class="sh">Prep sheet · ${items} items</div>
    <div class="box prep">${rows}</div>
    <div class="sh">Customer changes for tomorrow · ${ch.length}</div>
    <div class="box">${ch.map(c => `<div class="row chg-row" data-k="${c.k}">${avatar(c.cust)}<div class="t"><b>${C[c.cust].name}</b><small>${c.text}</small></div>${c.d ? `<span class="chip ${c.d > 0 ? 'g' : 'y'}">${c.d > 0 ? '+' : '−'}${Math.abs(c.d)}</span>` : ''}</div>`).join('') || '<div class="row"><div class="t"><small>No changes for tomorrow.</small></div></div>'}</div>
    <p class="fine">Includes recurring plans and one-time add-ons due tomorrow. ${S.phase === 'open' ? `Customers can still change tomorrow until ${CUTOFF}.` : 'Locked at the cutoff; later changes apply from the day after.'} Breakfast-plan interest is not included: it is proposed demand, not orders.</p>
    <div class="sh">Live updates · times in IST</div>
    <div class="box feed">${S.feed.slice(0,10).map(f => `<div class="fi ${f.kind}"><span class="d">${icon(FEED_IC[f.kind] || 'bell', 14)}</span><span class="tx">${f.text}</span><time>${f.t}</time></div>`).join('')}</div>
    <div class="spacer"></div>`;
}

/* ---------- Delivery run ---------- */
function mRun(){
  const st = stops(), done = st.filter(s => S.done[s.cust]).length, open = S.phase === 'open';
  const groups = AREAS.map(a => [a, st.filter(s => s.area === a)]).filter(g => g[1].length);
  const away = [...new Set(lines().filter(l => l.status !== 'ok').map(l => l.cust))].filter(c => !st.find(s => s.cust === c));
  return `${backBar('today', 'Delivery run', 'Tomorrow · ' + fmtD(TMR))}
    <div class="prog"><div class="pr"><span>${done} of ${st.length} delivered</span><span>${rs(st.filter(s => S.done[s.cust]).reduce((a,s) => a+s.amt, 0))}</span></div><div class="bar"><i style="width:${st.length ? done/st.length*100 : 0}%"></i></div>
      <small>${open ? `Preview. Customers can still make changes until ${CUTOFF}.` : S.phase === 'locked' ? 'Locked. Mark each stop as it\'s delivered.' : 'Morning run complete.'}</small></div>
    ${groups.map(([a, list]) => `<div class="area">${a}<span>${list.length} stop${list.length > 1 ? 's' : ''}</span></div>
      ${list.map(s => `<div class="stop ${s.cust === 'me' ? 'me' : ''} ${S.done[s.cust] ? 'done' : ''}">${avatar(s.cust)}<div class="t"><b>${C[s.cust].name}${s.cust === 'me' ? '<span class="you">demo</span>' : ''}</b>
        <small>${s.lines.map(l => P[l.prod].name + ' × ' + l.qty).join(', ')}</small></div>
        <div class="rt"><b>${rs(s.amt)}</b>${S.done[s.cust] ? '<span class="chip g">Delivered</span>' : `<button class="sbtn" data-a="deliver" data-v="${s.cust}" ${open ? 'disabled' : ''}>Mark delivered</button>`}</div></div>`).join('')}`).join('')}
    ${away.length ? `<div class="area">Not on tomorrow's run<span>${away.length}</span></div>${away.map(c => `<div class="stop away">${avatar(c)}<div class="t"><b>${C[c].name}</b><small>${C[c].area} · ${S.vac[c] ? 'away, paused by customer' : 'paused or skipped by customer'}</small></div><span class="chip y">₹0</span></div>`).join('')}` : ''}
    <div class="spacer"></div>`;
}

/* ---------- Plans (subscription management) ---------- */
function mPlans(){
  const rows = planRows(), f = ui.pf, cnt = g => rows.filter(r => r.group === g).length;
  const list = rows.filter(r => f === 'all' || r.group === f);
  const chip = (v, l, n) => `<button class="cchip sm ${f === v ? 'on' : ''}" data-a="mplans" data-v="${v}" aria-pressed="${f === v}">${l} · ${n}</button>`;
  return `<div class="pseg"><button class="on" data-a="mtab" data-v="plans">Customer plans</button><button data-a="mtab" data-v="bf">Breakfast plans${liveMeals().length ? ` <i>${liveMeals().length}</i>` : ''}</button></div>
    <div class="stats"><div class="stat"><span>Active</span><b>${cnt('active')}</b></div><div class="stat"><span>Paused</span><b>${cnt('paused')}</b></div><div class="stat"><span>Changing</span><b>${cnt('changes')}</b></div></div>
    <div class="mfilters"><div class="chips">${chip('all','All',rows.length)}${chip('active','Active',cnt('active'))}${chip('paused','Paused',cnt('paused'))}${chip('changes','Changes',cnt('changes'))}${chip('ended','Ended',cnt('ended'))}</div></div>
    <div class="box" style="margin-top:10px">${list.map(({s, st}) => { const p = P[s.prod], nx = nextChain(s), pend = pendingFrom(s), prev = pend ? S.subs.find(x => x.id === s.replaces) : null;
      return `<button class="row plrow" data-a="mplan" data-v="${s.id}" data-group="${planStatus(s)[0]}">${avatar(s.cust)}<span class="t"><b>${C[s.cust].name} · ${p.name}</b>
        <small>Regular: ${s.qty} per delivery · ${freqLabel(s)}</small>
        ${prev ? `<small class="qnote">From ${fmtS(pend)}: ${prev.qty} → ${s.qty} × ${freqLabel(s)}</small>` : ''}
        <small class="nx">${nx ? 'Next: ' + fmtD(nx) : 'No upcoming delivery'}</small></span><span class="chip ${st[2]}">${st[1]}</span></button>`; }).join('') || '<div class="row"><div class="t"><small>No plans in this group.</small></div></div>'}</div>
    <p class="fine">Plan changes start from the next editable date and never rewrite past deliveries or charges.</p><div class="spacer"></div>`;
}
function mSheetHTML(){
  const sh = ui.msheet; if (!sh) return '';
  let inner = '', foot = '';
  if (sh.type === 'plan'){
    const s = S.subs.find(x => x.id === sh.subId); if (!s) return '';
    const p = P[s.prod], st = planStatus(s), ups = upcomingChain(s, 6), pend = pendingFrom(s), prev = pend ? S.subs.find(x => x.id === s.replaces) : null, ended = st[0] === 'ended' || !!s.cancelledFrom;
    inner = `<div class="sh-pad"><div class="mg-head">${avatar(s.cust)}<div><div class="sh-title" style="padding:0">${C[s.cust].name}</div><small>${C[s.cust].area} · ${p.name}</small></div><button class="x sm" data-a="mclose" aria-label="Close">×</button></div>
      <div class="box" style="padding:12px 14px;display:flex;flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>Regular: ${s.qty} × ${freqLabel(s)}</b><span class="chip ${st[2]}">${st[1]}</span></div>
        <small class="punit">${rs(s.qty * p.price)} per delivery · started ${fmtS(chainOf(s).slice(-1)[0].start)}</small></div>
      ${prev ? `<div class="info">${icon('sun', 16)}<span>Customer's change starts <b>${fmtD(pend)}</b>. Until then: ${prev.qty} × ${freqLabel(prev)}.</span></div>` : ''}
      <div class="sh" style="padding:4px 16px 0">Upcoming deliveries</div>
      <div class="box">${ups.map(u => `<div class="row up"><div class="t"><b>${fmtD(u.date)}</b><small>${u.status === 'scheduled' ? `${u.qty} × ${p.name}` : u.status === 'paused' ? 'Paused' : 'Skipped by customer'}</small></div>${u.locked ? `<span class="chip k">${icon('lock', 11)} Being prepared</span>` : `<span class="chip ${u.status === 'scheduled' ? 'g' : 'y'}">${u.status === 'scheduled' ? 'Scheduled' : u.status === 'paused' ? 'Paused' : 'Skipped'}</span>`}</div>`).join('') || '<div class="row"><div class="t"><small>No upcoming deliveries.</small></div></div>'}</div>
      ${ended ? '' : `<p class="fine" style="margin-top:0">Pausing or cancelling here applies from ${fmtD(effFrom(s))}. The customer sees the change in their app. Past deliveries and charges are not changed.</p>`}</div>`;
    foot = ended ? `<button class="cta c" data-a="mclose">Close</button>`
      : `<div class="two-btn">${s.pausedFrom ? `<button class="btn2" data-a="mp-resume" data-v="${s.id}">Resume plan</button>` : `<button class="btn2" data-a="mp-pause" data-v="${s.id}">Pause plan</button>`}
         <button class="btn2 danger" data-a="mp-cancel" data-v="${s.id}">${ui.mConfirm === s.id ? 'Tap again to cancel' : 'Cancel plan'}</button></div>`;
  } else if (sh.type === 'cust'){
    const x = custInfo(C[sh.cust]), c = x.c, mi = allInterest().filter(i => i.cust === c.id);
    const spend = x.orders.filter(o => o.date >= TDY.slice(0, 7) + '-01').reduce((a, o) => a + o.amt, 0);
    inner = `<div class="sh-pad"><div class="mg-head">${avatar(c.id)}<div><div class="sh-title" style="padding:0">${c.name}</div><small>${c.area} · <span class="chip ${x.st[2]}">${x.st[1]}</span></small></div><button class="x sm" data-a="mclose" aria-label="Close">×</button></div>
      <div class="sumg" style="margin:0 14px"><div><span>Next delivery</span><b>${x.next ? fmtS(x.next) : '—'}</b></div><div><span>One-time orders this month ${demoTag()}</span><b>${rs(spend)}</b></div></div>
      ${x.away ? `<div class="info">${icon('plane', 16)}<span>Away ${vacRangeText(x.away)}. Deliveries are paused and not charged.</span></div>` : ''}
      <div class="sh" style="padding:4px 16px 0">Regular plans · ${x.subs.length}</div>
      <div class="box">${x.subs.map(s => { const ps = planStatus(s), nx = nextChain(s);
        return `<button class="row plrow" data-a="mplan" data-v="${s.id}">${thumb(P[s.prod])}<span class="t"><b>${P[s.prod].name}</b><small>${s.qty} × ${freqLabel(s)}${nx ? ' · next ' + fmtS(nx) : ''}</small></span><span class="chip ${ps[2]}">${ps[1]}</span></button>`; }).join('') || '<div class="row"><div class="t"><small>No regular plans.</small></div></div>'}</div>
      <div class="sh" style="padding:4px 16px 0">Recent one-time orders</div>
      <div class="box">${x.orders.slice(0, 3).map(o => `<div class="row"><div class="t"><b>#${o.id} · ${rs(o.amt)}</b><small>${dayLabel(o.date)} · ${itemsText(o.items)}</small></div><span class="chip ${o.status === 'delivered' ? 'g' : 'b'}">${OLBL[o.status]}</span></div>`).join('') || '<div class="row"><div class="t"><small>No one-time orders.</small></div></div>'}</div>
      ${mi.length ? `<div class="info">${icon('bowl', 16)}<span>Interested in ${mi.map(i => window.MEAL_PLANS.plans.find(p => p.id === i.planId).name).join(', ')}. Proposed demand, not an order.</span></div>` : ''}
      <p class="fine" style="margin-top:0">Sample customer data. Tap a plan to pause, resume or cancel it.</p></div>`;
    foot = `<button class="cta c" data-a="mclose">Close</button>`;
  } else if (sh.type === 'stock'){
    const p = P[sh.prod], s = S.stock[p.id], need = stockNeed(), st = stockState(p.id, need);
    const sold = S.orders.filter(o => o.date === TDY && o.status !== 'cancelled').reduce((a, o) => a + o.items.filter(i => i.prod === p.id).reduce((k, i) => k + i.qty, 0), 0);
    inner = `<div class="sh-pad"><div class="mg-head">${thumb(p, 'lg')}<div><div class="sh-title" style="padding:0">${p.name}</div><small>${p.unit} · ${p.cat} · ${rs(p.price)}${p.custom ? ' · <span class="chip b">Added by you</span>' : ''}${p.hidden ? ' <span class="chip k2">Not in shop</span>' : ''}</small></div><button class="x sm" data-a="mclose" aria-label="Close">×</button></div>
      <div class="box stk"><div><span>In stock (packs)</span><b class="stq ${st[0]}">${s.qty}</b><span class="chip ${st[2]}">${st[1]}</span></div>${qbtn('st-adj', p.id, s.qty)}</div>
      <div class="box" style="padding:14px;display:flex;flex-direction:column;gap:12px">
        <div class="fld"><label>NEW STOCK RECEIVED</label><div class="opts">${[6, 12, 24].map(k => `<button data-a="st-adj" data-v="${p.id}|${k}">+ ${k}</button>`).join('')}</div></div>
        <div class="fld r"><label>LOW-STOCK ALERT AT</label>${qbtn('st-low', p.id, s.low, true)}</div></div>
      <div class="sumg" style="margin:0 14px"><div><span>Needed for tomorrow</span><b>${need[p.id] || 0}</b></div><div><span>Sold today (one-time)</span><b>${sold}</b></div></div>
      ${s.qty > 0 ? `<div style="padding:0 14px"><button class="btn2 danger" style="width:100%" data-a="st-out" data-v="${p.id}">Mark out of stock</button></div>` : '<div class="info">Out of stock: customers can\'t add it to a same-day cart until you add stock.</div>'}
      ${p.custom ? `<div style="padding:0 14px"><button class="btn2" style="width:100%" data-a="np-hide" data-v="${p.id}">${p.hidden ? 'Show in shop again' : 'Remove from shop'}</button></div>` : ''}
      <p class="fine" style="margin-top:0">Demo stock only. Changes here don't update EkSecond or the website.</p></div>`;
    foot = `<button class="cta c" data-a="mclose">Done</button>`;
  } else if (sh.type === 'newprod'){
    inner = prodForm(sh);
    foot = `<button class="cta c" data-a="np-save" data-valid ${formValid(sh) ? '' : 'disabled'}>Add to shop</button>`;
  } else if (sh.type === 'bf'){
    inner = bfForm(sh);
    foot = `<button class="cta c" data-a="bf-save" data-valid ${formValid(sh) ? '' : 'disabled'}>${sh.id ? 'Save changes' : 'Put on sale'}</button>`;
  }
  return `<div class="scrim" data-a="mclose"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet-sc">${inner}</div>${foot ? `<div class="sh-foot">${foot}</div>` : ''}</div>`;
}

/* ---------- Customers ---------- */
/* What a merchant needs about each customer: where, their status, what they get regularly, and when they last ordered. */
function custInfo(c){
  const subs = S.subs.filter(s => s.cust === c.id && !s.replacedBy && !(s.cancelledFrom && s.cancelledFrom <= TMR)).sort(planOrder);
  const v = S.vac[c.id], away = v && (!v.to || v.to >= TMR) ? v : null;
  const running = subs.filter(s => !s.pausedFrom || s.pausedFrom > TMR);
  const next = subs.map(nextChain).filter(Boolean).sort()[0] || null;
  const orders = S.orders.filter(o => o.cust === c.id && o.status !== 'cancelled').sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.id - a.id));
  const st = away ? ['away', away.to ? 'Away till ' + fmtS(away.to) : 'Away', 'y'] : subs.length && !running.length ? ['away', 'Paused', 'y']
    : subs.some(s => s.isNew) ? ['plan', 'New plan', 'b'] : subs.length ? ['plan', 'On a plan', 'g'] : orders.length ? ['none', 'One-time only', 'k2'] : ['none', 'No orders yet', 'k2'];
  return {c, subs, away, next, orders, st};
}
function mCustomers(){
  const all = CUSTOMERS.map(custInfo), f = ui.cuf, q = (ui.cuq || '').trim().toLowerCase();
  const n = g => all.filter(x => g === 'all' || x.st[0] === g).length;
  const list = all.filter(x => (f === 'all' || x.st[0] === f) && (!q || x.c.name.toLowerCase().includes(q) || x.c.area.toLowerCase().includes(q)));
  const chip = (v, l) => `<button class="cchip sm ${f === v ? 'on' : ''}" data-a="cuf" data-v="${v}" aria-pressed="${f === v}">${l} · ${n(v)}</button>`;
  const sub = x => x.subs.length ? `${x.subs.length} plan${x.subs.length > 1 ? 's' : ''}${x.next ? ' · next ' + fmtS(x.next) : ''}` : x.orders.length ? `Last order ${dayLabel(x.orders[0].date).toLowerCase()}` : 'No orders yet';
  return `<div class="mfilters"><label class="search sm">${icon('search', 16)}<input id="cuq" type="search" placeholder="Search name or area" value="${esc(ui.cuq || '')}" autocomplete="off" aria-label="Search customers"></label>
      <div class="chips">${chip('all', 'All')}${chip('plan', 'On a plan')}${chip('away', 'Away or paused')}${chip('none', 'No plan')}</div></div>
    <button class="intcard" data-a="mtab" data-v="interest"><span class="ei">${icon('bowl', 20)}</span><span class="t"><b>Breakfast plan interest · ${allInterest().length} responses</b><small>Proposed demand, not orders</small></span><span class="cb-go">›</span></button>
    <div class="sh">${list.length} customer${list.length === 1 ? '' : 's'}</div>
    <div class="box">${list.map(x => `<button class="row curow" data-a="cust-open" data-v="${x.c.id}" data-group="${x.st[0]}">${avatar(x.c.id)}<span class="t"><b>${x.c.name}${x.c.id === 'me' ? '<span class="you">demo</span>' : ''}</b>
      <small>${x.c.area} · ${sub(x)}</small></span><span class="chip ${x.st[2]}">${x.st[1]}</span></button>`).join('') || '<div class="row"><div class="t"><small>No customers match.</small></div></div>'}</div>
    <div class="note">Customers, plans and orders here are sample data for the demo. Tap a customer for their plans and recent orders.</div><div class="spacer"></div>`;
}

/* ---------- Stock (demo inventory) ---------- */
/* Demo stock: one number per product, in packs of the listed size. */
function mStock(){
  const sum = stockSummary(), f = ui.sf, q = (ui.sq || '').trim().toLowerCase();
  const attn = id => stockState(id, sum.need)[0] !== 'ok';
  const list = STOCKED().filter(p => (!q || p.name.toLowerCase().includes(q)) && (f === 'all' || (f === 'attn' && attn(p.id)) || (f === 'out' && stockOf(p.id) <= 0)));
  const chip = (v, l, k) => `<button class="cchip sm ${f === v ? 'on' : ''}" data-a="sf" data-v="${v}" aria-pressed="${f === v}">${l} · ${k}</button>`;
  const row = p => { const s = S.stock[p.id], st = stockState(p.id, sum.need), need = sum.need[p.id] || 0;
    return `<button class="row strow" data-a="stock-open" data-v="${p.id}" data-state="${st[0]}">${thumb(p)}<span class="t"><b>${p.name}${p.custom ? ' <span class="chip b">New</span>' : ''}</b><small>${p.unit}${need ? ` · <span class="bd">${need} needed tomorrow</span>` : ''}</small></span>
      <span class="rt"><b class="stq ${st[0]}">${s.qty}</b><span class="chip ${st[2]}">${p.hidden ? 'Not in shop' : st[1]}</span></span></button>`; };
  const groups = CAT_LIST.map(c => [c, list.filter(p => p.category === c.id)]).filter(g => g[1].length);
  return `<button class="addrow" data-a="np-open">${icon('plus', 18)}<span><b>Add a product</b><small>Name, category, pack size, price and opening stock</small></span></button>
    <div class="stats"><button class="stat" data-a="sf" data-v="out"><span>Out of stock</span><b class="${sum.out.length ? 'red' : ''}">${sum.out.length}</b></button><button class="stat" data-a="sf" data-v="attn"><span>Short for tomorrow</span><b class="${sum.short.length ? 'red' : ''}">${sum.short.length}</b></button><button class="stat" data-a="sf" data-v="attn"><span>Low stock</span><b>${sum.low.length}</b></button></div>
    <div class="mfilters"><label class="search sm">${icon('search', 16)}<input id="sq" type="search" placeholder="Search products" value="${esc(ui.sq || '')}" autocomplete="off" aria-label="Search stock"></label>
      <div class="chips">${chip('all', 'All', STOCKED().length)}${chip('attn', 'Needs attention', sum.out.length + sum.short.length + sum.low.length)}${chip('out', 'Out of stock', sum.out.length)}</div></div>
    ${groups.length ? groups.map(([c, ps]) => `<div class="sh">${c.name}</div><div class="box">${ps.map(row).join('')}</div>`).join('') : '<div class="note">No products match.</div>'}
    <p class="fine">Demo stock levels (sample data), counted in packs of the listed size. Not connected to EkSecond or vaaradhifarms.com. Stock goes down when a one-time order is placed and when a delivery is marked delivered; a cancelled order puts it back. Out-of-stock products can't be added to a same-day cart.</p><div class="spacer"></div>`;
}

/* ---------- Earnings (simulated) ---------- */
function mEarnings(){
  const start = iso(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1, 12));
  let mtd = 0, n = 0;
  for (let d = start; d <= TDY; d = plus(d, 1)){ const r = dayRevenue(d); mtd += r.amt; n += r.n; }
  const st = stops(), collected = st.filter(s => S.done[s.cust]).reduce((a,s) => a+s.amt, 0), expected = st.reduce((a,s) => a+s.amt, 0);
  const monthName = TODAY.toLocaleDateString('en-IN', {month:'long'});
  const inst = S.orders.filter(o => o.date === TDY && o.status !== 'cancelled'), instAmt = inst.reduce((a,o) => a + o.amt, 0);
  let setl = '';
  const ln = (a, b, amt, cls = '') => `<div class="row"><div class="t"><b>${a}</b><small>${b}</small></div><b class="amt ${cls}">${rs(amt)}</b></div>`;
  if (collected) setl += ln('Collected this morning', 'Settling to your account', collected);
  setl += ln('Today\'s one-time orders', 'Settling to your account', instAmt);
  setl += ln('Today\'s subscription deliveries', 'Settling to your account', dayRevenue(TDY).amt);
  for (let k = 1; k <= 5; k++){ const d = iso(addD(-k)); setl += ln(fmtD(d) + ' deliveries', 'Settled to your account', dayRevenue(d).amt, 'in'); }
  return `${backBar('home', 'Earnings & collections', 'Simulated figures only')}
    <div class="mcard"><small>App orders in ${monthName} ${demoTag()}</small><div class="big" style="font-size:34px;margin-bottom:4px">${rs(mtd + collected + instAmt)}</div>
      <small>${n + st.filter(s => S.done[s.cust]).length} subscription deliveries and ${inst.length} one-time orders</small></div>
    <div class="stats" style="grid-template-columns:1fr 1fr"><div class="stat"><span>Aggregator commission</span><b>₹0</b></div><div class="stat"><span>${S.phase === 'delivered' ? 'Collected today' : 'Tomorrow, expected'}</span><b>${rs(S.phase === 'delivered' ? collected : expected)}</b></div></div>
    <div class="sh">Collections · demo data</div>
    <div class="box">${setl}</div>
    <p class="fine">All figures on this screen are simulated sample data. No payment integration is connected. In the proposed setup, payments would settle to Vaaradhi's own payment-provider account, and Scribr would keep the records without holding funds.</p>
    <div class="spacer"></div>`;
}

/* ---------- Breakfast-plan interest (proposed demand) ---------- */
function mInterest(){
  const MP = window.MEAL_PLANS, all = allInterest(), demo = S.mealInterest.length, samples = all.length - demo;
  const fulTxt = x => x.fulfil ? FUL[x.fulfil] : 'No delivery/pickup preference';
  return `${backBar('cust', 'Breakfast plan interest', 'Scribr\'s proposed concepts · expressions of interest')}
    <div class="intwarn">${icon('bell', 16)}<span><b>Proposed demand, not confirmed orders.</b> Nobody has paid, and no delivery or preparation is scheduled. These responses are not counted in Orders, Tomorrow, Run or Earnings.</span></div>
    <button class="addrow" data-a="mtab" data-v="bf">${icon('bowl', 18)}<span><b>Breakfast plans you sell</b><small>Launch a concept with your own menu and price, or add a new plan</small></span></button>
    <div class="stats"><div class="stat"><span>Responses</span><b>${all.length}</b></div><div class="stat"><span>From this demo</span><b>${demo}</b></div><div class="stat"><span>Sample</span><b>${samples}</b></div></div>
    ${all.length ? '' : '<div class="note">No responses yet. They appear here when customers share preferences under Healthy Meal Plans in the customer app.</div>'}
    ${MP.plans.map(p => {
      const rs_ = all.filter(x => x.planId === p.id);
      const dc = DOW_ORDER.map(d => [d, rs_.filter(x => x.days.includes(d)).length]), max = Math.max(1, ...dc.map(x => x[1]));
      const sv = {}; rs_.forEach(x => sv[x.servings] = (sv[x.servings] || 0) + 1);
      const fu = {}; rs_.forEach(x => { const k = x.fulfil || 'none'; fu[k] = (fu[k] || 0) + 1; });
      return `<div class="ic" data-plan="${p.id}"><div class="ic-top"><b>${p.name}</b><span class="chip y">${rs_.length} interested</span></div>
        <div class="ic-sub">Preferred days</div>
        <div class="dbars" role="img" aria-label="Preferred days for ${p.name}: ${dc.map(([d, n]) => DOW[d] + ' ' + n).join(', ')}">${dc.map(([d, n]) => `<div class="db"><em>${n}</em><i style="height:${Math.round(n / max * 100)}%"></i><span>${DOW[d]}</span></div>`).join('')}</div>
        <div class="ic-sub">Indicative servings</div>
        <div class="mp-chips">${Object.keys(sv).sort((a, b) => a - b).map(k => `<span class="chip b">${servText(+k)} · ${sv[k]}</span>`).join('') || '<small class="punit">No responses yet</small>'}</div>
        <div class="ic-sub">Delivery or pickup preference <span class="tbc-mini">to be confirmed by Vaaradhi</span></div>
        <div class="mp-chips">${['delivery','pickup','either','none'].filter(k => fu[k]).map(k => `<span class="chip k2">${k === 'none' ? 'Not given' : FUL[k]} · ${fu[k]}</span>`).join('') || '<small class="punit">No responses yet</small>'}</div>
        ${rs_.length ? `<div class="ic-list">${rs_.map(x => `<div class="row">${avatar(x.cust)}<div class="t"><b>${C[x.cust].name}</b><small>${daysText(x.days)} · ${servText(x.servings)} · ${fulTxt(x)}</small></div><span class="chip ${x.sample ? 'k2' : 'g'}">${x.sample ? 'Sample' : 'This demo'}</span></div>`).join('')}</div>` : ''}
        <div class="mp-tbc" style="margin-top:8px">${icon('clock', 13)}${MP.unconfirmedLabel}</div></div>`;
    }).join('')}
    <p class="fine">${samples ? '"Sample" responses are illustrative data created for this demo, not real Vaaradhi customers, and are stored separately from customer submissions. ' : ''}"This demo" responses were submitted in the customer app during this session. Delivery or pickup is a customer preference only; Vaaradhi has not confirmed which options would be offered.</p>
    <div class="spacer"></div>`;
}

/* ---------- Breakfast plans Vaaradhi sells (subscription or a single day) ---------- */
function mBreakfast(){
  const meals = PRODUCTS.filter(p => p.meal), concepts = openConcepts(), all = allInterest(), pr = prep();
  const subsOf = id => S.subs.filter(s => s.prod === id && !s.replacedBy && !(s.cancelledFrom && s.cancelledFrom <= TMR));
  const card = p => { const subs = subsOf(p.id), tmr = pr[p.id] || 0;
    return `<div class="bfc ${p.hidden ? 'off' : ''}" data-meal="${p.id}"><div class="bfc-top"><span class="th lg">${visual(p)}</span><div class="t"><b>${p.name}</b><small>${daysText(p.days)} · ${rs(p.price)} per serving</small></div>
        <span class="chip ${p.hidden ? 'k2' : 'g'}">${p.hidden ? 'Not on sale' : 'On sale'}</span></div>
      <div class="mp-menu"><span>What's included</span>${esc(p.desc)}</div>
      <div class="bfc-chips">${p.sub ? `<span class="chip b">${icon('repeat', 11)}Subscription</span>` : ''}${p.once ? '<span class="chip b">Order for a day</span>' : ''}<span class="chip k2">${p.cap ? p.cap + ' servings a day max' : 'No daily limit'}</span></div>
      <div class="bfc-stats"><div><b>${subs.length}</b><span>Subscribers</span></div><div><b>${tmr}${p.cap ? `<small>/${p.cap}</small>` : ''}</b><span>Servings tomorrow</span></div></div>
      <div class="two-btn"><button class="btn2" data-a="bf-edit" data-v="${p.id}">Edit</button><button class="btn2 ${p.hidden ? 'pri' : ''}" data-a="bf-hide" data-v="${p.id}">${p.hidden ? 'Put on sale' : 'Stop selling'}</button></div></div>`; };
  return `<div class="pseg"><button data-a="mtab" data-v="plans">Customer plans</button><button class="on" data-a="mtab" data-v="bf">Breakfast plans</button></div>
    <button class="addrow" data-a="bf-new">${icon('plus', 18)}<span><b>New breakfast plan</b><small>Set the menu, price and days. Customers can subscribe or order for a day.</small></span></button>
    <div class="sh">Your breakfast plans · ${meals.length}</div>
    ${meals.length ? meals.map(card).join('') : '<div class="note" style="margin-top:0">No breakfast plans on sale yet. Add one, or launch a concept below once the menu and price are decided.</div>'}
    ${concepts.length ? `<div class="sh">Concepts · customers can share interest</div>
    <div class="box">${concepts.map(c => { const n = all.filter(x => x.planId === c.id).length;
      return `<div class="row"><span class="lri">${icon('bowl', 17)}</span><div class="t"><b>${c.name}</b><small>${n} interested · ${window.MEAL_PLANS.unconfirmedLabel.toLowerCase()}</small></div><button class="sbtn2" data-a="bf-new" data-v="${c.id}">Launch</button></div>`; }).join('')}</div>
    <button class="intcard" data-a="mtab" data-v="interest"><span class="ei">${icon('bowl', 20)}</span><span class="t"><b>See interest · ${all.length} responses</b><small>Preferred days and servings for each concept</small></span><span class="cb-go">›</span></button>` : ''}
    <p class="fine">Breakfast plans you add here are saved in this demo only and appear in the customer app right away, under Healthy Meal Plans and in Shop. They are made to order, so they have no stock count; set a daily limit if the kitchen has one. Subscriptions and orders follow the same ${CUTOFF} cutoff as groceries.</p>
    <div class="spacer"></div>`;
}

/* ---------- Add a product / breakfast plan (merchant forms) ---------- */
const clean = v => String(v || '').replace(/[<>"]/g, '').replace(/\s+/g, ' ').trim();
const priceOk = v => /^\d{1,5}(\.\d{1,2})?$/.test(String(v || '').trim()) && +v > 0;
function formValid(sh){
  if (sh.type === 'newprod') return !!clean(sh.name) && priceOk(sh.price) && !!CATMAP[sh.cat] && sh.cat !== 'breakfast';
  if (sh.type === 'bf') return !!clean(sh.name) && !!clean(sh.desc) && priceOk(sh.price) && sh.days.length > 0 && (sh.sub || sh.once);
  return false;
}
const tgl = (a, on, label, sub) => `<button class="tgl ${on ? 'on' : ''}" data-a="${a}" aria-pressed="${on}"><i></i><span><b>${label}</b><small>${sub}</small></span></button>`;
function prodForm(sh){
  return `<div class="sh-pad"><div class="mg-head"><span class="ok-ic">${icon('plus', 22)}</span><div><div class="sh-title" style="padding:0">Add a product</div><small>It appears in the customer shop right away</small></div><button class="x sm" data-a="mclose" aria-label="Close">×</button></div>
    <div class="box frm">
      <div class="fld"><label for="f-name">PRODUCT NAME</label><input id="f-name" data-f="name" maxlength="40" placeholder="e.g. Foxtail Millet Rava" value="${esc(sh.name)}" autocomplete="off"></div>
      <div class="fld"><label for="f-cat">CATEGORY</label><select id="f-cat" data-f="cat">${CAT_LIST.filter(c => c !== MEAL_CAT).map(c => `<option value="${c.id}" ${sh.cat === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
      <div class="frow"><div class="fld"><label for="f-unit">PACK SIZE</label><input id="f-unit" data-f="unit" maxlength="20" placeholder="e.g. 500 g" value="${esc(sh.unit)}" autocomplete="off"></div>
        <div class="fld"><label for="f-price">PRICE (₹)</label><input id="f-price" data-f="price" inputmode="decimal" maxlength="8" placeholder="e.g. 120" value="${esc(sh.price)}" autocomplete="off"></div></div>
      <div class="fld r"><label>OPENING STOCK (PACKS)</label>${qbtn('np-qty', 'q', sh.qty, true)}</div>
      <div class="opts">${[6, 12, 24].map(k => `<button data-a="np-qty" data-v="q|${k}">+ ${k}</button>`).join('')}</div>
      ${tgl('np-sub', sh.sub, 'Customers can subscribe', 'Daily, alternate days, selected days, weekly or every 2 weeks')}
      <div class="fld"><label>PHOTO (OPTIONAL)</label><div class="photo-row"><span class="th lg">${sh.img ? `<img src="${sh.img}" alt="">` : `<span class="ph" style="--c:${(CATMAP[sh.cat] || {}).color || '#888'}"><b>${esc(initialsOf(clean(sh.name) || '?'))}</b></span>`}</span>
        <label class="btn2 file">${icon('plus', 15)}${sh.img ? 'Change photo' : 'Add photo'}<input id="f-photo" type="file" accept="image/*" hidden></label>${sh.img ? '<button class="lnk red" data-a="np-nophoto">Remove</button>' : ''}</div></div>
    </div>
    <p class="fine" style="margin-top:0">Saved in this demo only. It doesn't change EkSecond or vaaradhifarms.com.</p></div>`;
}
function bfForm(sh){
  const concept = sh.from ? window.MEAL_PLANS.plans.find(c => c.id === sh.from) : null;
  return `<div class="sh-pad"><div class="mg-head"><span class="ok-ic meal">${icon('bowl', 22)}</span><div><div class="sh-title" style="padding:0">${sh.id ? 'Edit breakfast plan' : concept ? 'Launch ' + concept.name : 'New breakfast plan'}</div><small>Customers see it under Healthy Meal Plans and in Shop</small></div><button class="x sm" data-a="mclose" aria-label="Close">×</button></div>
    ${concept && !sh.id ? `<div class="info">${icon('bell', 16)}<span>This concept had no menu or price. Enter Vaaradhi's own menu and price to put it on sale.</span></div>` : ''}
    <div class="box frm">
      <div class="fld"><label for="f-name">PLAN NAME</label><input id="f-name" data-f="name" maxlength="40" placeholder="e.g. Millet Breakfast" value="${esc(sh.name)}" autocomplete="off"></div>
      <div class="fld"><label for="f-desc">WHAT'S INCLUDED (MENU)</label><textarea id="f-desc" data-f="desc" maxlength="200" rows="3" placeholder="e.g. Ragi idli (3), peanut chutney, fruit cup">${esc(sh.desc)}</textarea></div>
      <div class="fld"><label for="f-price">PRICE PER SERVING (₹)</label><input id="f-price" data-f="price" inputmode="decimal" maxlength="8" placeholder="e.g. 120" value="${esc(sh.price)}" autocomplete="off"></div>
      ${dayPicker(sh.days, 'bf-day', 'bf-preset').replace('WHICH DAYS', 'DAYS IT IS SERVED')}
      <div class="fld"><label>CUSTOMERS CAN</label>
        ${tgl('bf-sub', sh.sub, 'Subscribe', 'Repeat on the days they choose, until they pause or cancel')}
        ${tgl('bf-once', sh.once, 'Order for a day', 'A single breakfast for tomorrow, added to their next delivery')}</div>
      <div class="fld r"><label>DAILY LIMIT (SERVINGS)</label>${qbtn('bf-cap', 'q', sh.cap || '∞', true)}</div>
      <small class="eff">${sh.cap ? `Orders stop once ${sh.cap} servings are booked for a day.` : 'No limit. Use − / + to set the most the kitchen can make in a day.'}</small>
    </div>
    <p class="fine" style="margin-top:0">Saved in this demo only. ${sh.id ? 'A new price applies to deliveries not yet locked.' : ''}</p></div>`;
}
function merchHTML(){
  const st = stops(), pr = prep();
  trackChanges(pr, {stops:st.length, items:Object.values(pr).reduce((a,b) => a+b, 0), rev:st.reduce((a,s) => a+s.amt, 0)});
  const pill = S.phase === 'open' ? ['Open',''] : S.phase === 'locked' ? ['Locked','lk'] : ['Run done','dn'];
  const t = ui.mTab;
  const VIEWS = {home:mHome, orders:mOrders, today:mToday, run:mRun, plans:mPlans, cust:mCustomers, stock:mStock, interest:mInterest, earn:mEarnings, bf:mBreakfast};
  const body = (VIEWS[t] || mHome)();
  const navOn = {run:'today', interest:'cust', earn:'home', bf:'plans'}[t] || t, inv = stockSummary(), sn = simNote();
  return `<div class="mh">${BRAND && CFG.brandAssets.logo ? `<span class="lg2 img"><img src="${CFG.brandAssets.logo}" alt="Vaaradhi Farms"></span>` : '<span class="lg2">VF</span>'}<div class="nm"><b>Vaaradhi Farms</b><small>Manikonda store · <span class="clk">${clock()} IST</span></small>${sn ? `<em class="simn">${sn}</em>` : ''}</div><span class="st-pill ${pill[1]}"><i></i>${pill[0]}</span></div>
    <div class="body mbody" data-scroll="m-${t}">${body}</div>
    ${nav([['home','Overview','chart'],['orders','Orders','bag'],['today','Tomorrow','list'],['plans','Plans','repeat'],['cust','Customers','people'],['stock','Stock','box']], navOn, 'mtab', {orders:S.orders.filter(o => o.date === TDY && o.status === 'placed').length, stock:inv.out.length + inv.short.length})}
    ${toastHTML(ui.mToast,'m')}${mSheetHTML()}`;
}

/* =====================================================================
   RENDER + ACTIONS
   ===================================================================== */
function render(){
  const keep = {}; document.querySelectorAll('[data-scroll]').forEach(e => keep[e.dataset.scroll] = e.scrollTop);
  const a = document.activeElement, fid = a && a.id && /^(q|sq|cuq|bname|f-.+)$/.test(a.id) && a.type !== 'file' ? a.id : (ui.focusQ ? 'q' : null), caret = a && a.id === fid ? a.selectionStart : null;
  ui.focusQ = false;
  document.getElementById('custApp').innerHTML = custHTML();
  document.getElementById('merchApp').innerHTML = merchHTML();
  document.querySelectorAll('[data-scroll]').forEach(e => { if (keep[e.dataset.scroll] != null) e.scrollTop = keep[e.dataset.scroll]; });
  if (fid){ const el = document.getElementById(fid); if (el){ el.focus(); const c = caret != null ? caret : el.value.length; try { el.setSelectionRange(c, c); } catch(e){} } }
  document.querySelectorAll('.cutoff-label').forEach(e => e.textContent = CUTOFF);
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
  if (!mine.length) return;
  const items = mine.map(l => ({prod:l.prod, qty:l.qty, amt:l.amt, status:l.status}));
  const amt = -items.filter(i => i.status === 'ok').reduce((a,i) => a + i.amt, 0);
  S.ledger.push({date:TMR, seq:S.seq++, type:'delivery', amt, kind: amt ? 'out' : 'zero', items});
  if (amt) toastC('Your Vaaradhi basket was delivered. Wallet updated.');
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
  'go-search'(){ ui.cTab = 'shop'; ui.focusQ = true; },
  'sub-only'(){ ui.subOnly = !ui.subOnly; },
  'clear-filters'(){ ui.q = ''; ui.cCat = 'All'; ui.subOnly = false; },
  'save-basket'(){
    if (!S.cart.length) return;
    const el = document.getElementById('bname'), name = ((el && el.value) || '').trim().slice(0, 30) || `My basket ${S.baskets.length + 1}`;
    S.baskets.push({id:'b' + Date.now(), name, items:S.cart.map(c => ({...c}))}); ui.bname = null;
    toastC(`Saved “${name}”. Find it under Orders, Saved baskets.`);
  },
  'basket-cart'(v){ const b = S.baskets.find(x => x.id === v); if (b) addItemsToCart(b.items); },
  reorder(v){ const o = S.orders.find(x => String(x.id) === v); if (o) addItemsToCart(o.items); },
  'del-basket'(v){ if (ui.confirmDel !== v){ ui.confirmDel = v; return; } S.baskets = S.baskets.filter(b => b.id !== v); ui.confirmDel = null; toastC('Basket deleted.'); },
  'meal-open'(v){
    const p = window.MEAL_PLANS.plans.find(x => x.id === v); if (!p) return;
    const mine = myInterest(v);
    ui.sheet = {type:'meal', planId:v, done:false, days: mine ? mine.days.slice() : (p.schedule === 'weekly' ? [p.days[0]] : p.days.slice()), servings: mine ? mine.servings : p.servingsOptions[0], fulfil: mine ? mine.fulfil || null : null};
  },
  'meal-day'(v){
    const p = window.MEAL_PLANS.plans.find(x => x.id === ui.sheet.planId), d = +v;
    if (p.schedule === 'weekly'){ ui.sheet.days = [d]; return; }
    const ds = new Set(ui.sheet.days); ds.has(d) ? ds.delete(d) : ds.add(d); ui.sheet.days = [...ds];
  },
  'meal-preset'(v){ ui.sheet.days = DAY_PRESETS[+v][1].slice(); },
  'meal-serv'(v){ const p = window.MEAL_PLANS.plans.find(x => x.id === ui.sheet.planId); if (p.servingsOptions.includes(+v)) ui.sheet.servings = +v; },
  'meal-edit'(){ ui.sheet.done = false; },
  'meal-ful'(v){ if (!FUL[v]) return; ui.sheet.fulfil = ui.sheet.fulfil === v ? null : v; },
  'meal-submit'(){
    const sh = ui.sheet; if (!sh || sh.type !== 'meal' || sh.done) return;
    const p = window.MEAL_PLANS.plans.find(x => x.id === sh.planId); if (!p || !sh.days.length || !p.servingsOptions.includes(sh.servings)) return;
    const days = DOW_ORDER.filter(d => sh.days.includes(d)), mine = myInterest(p.id);
    const fulfil = FUL[sh.fulfil] ? sh.fulfil : null;
    if (mine && mine.servings === sh.servings && daysText(mine.days) === daysText(days) && (mine.fulfil || null) === fulfil){ sh.done = true; return; }   // nothing new: no duplicate
    if (mine) Object.assign(mine, {days, servings:sh.servings, fulfil, at:TDY});
    else S.mealInterest.push({id:'mi' + Date.now(), planId:p.id, cust:'me', days, servings:sh.servings, fulfil, at:TDY});
    notify(`Ananya R. ${mine ? 'updated' : 'shared'} interest in ${p.name}: ${daysText(days)}, ${servText(sh.servings)}${fulfil ? ', prefers ' + FUL[fulfil].toLowerCase() : ''} (not an order)`, 'interest', 'mi' + p.id);
    sh.done = true;
  },
  'meal-withdraw'(v){
    if (ui.confirmWd !== v){ ui.confirmWd = v; return; }
    const mine = myInterest(v), p = window.MEAL_PLANS.plans.find(x => x.id === v); ui.confirmWd = null; if (!mine) return;
    S.mealInterest = S.mealInterest.filter(x => x !== mine);
    notify(`Ananya R. withdrew interest in ${p.name}`, 'interest');
    toastC('Interest withdrawn.');
  },
  'skip-date'(v){
    const [id, d] = v.split('|'), s = S.subs.find(x => x.id === id); if (!s || d <= TMR) return;
    s.skips = [...new Set([...(s.skips || []), d])]; ui.sheet = null;
    notify(`Ananya R. will skip ${P[s.prod].name} on ${fmtD(d)}`, 'skip');
    toastC(`Skipped ${fmtD(d)}. Tomorrow arrives as planned.`);
  },
  mtab(v){ ui.mTab = v; ui.msheet = null; },
  wf(v){ ui.wf = v; ui.wOpen = null; },
  'w-open'(v){ ui.wOpen = ui.wOpen === +v ? null : +v; },
  cuf(v){ ui.cuf = v; },
  'cust-open'(v){ if (C[v]) ui.msheet = {type:'cust', cust:v}; },
  sf(v){ ui.sf = v; },
  'sf-go'(v){ ui.mTab = 'stock'; ui.sf = v; ui.msheet = null; },
  'stock-open'(v){ if (S.stock[v]) ui.msheet = {type:'stock', prod:v}; },
  'st-adj'(v){ const [id, d] = v.split('|'), s = S.stock[id]; if (s) s.qty = Math.max(0, Math.min(999, s.qty + +d)); },
  'st-low'(v){ const [id, d] = v.split('|'), s = S.stock[id]; if (s) s.low = Math.max(0, Math.min(50, s.low + +d)); },
  'st-out'(v){ const s = S.stock[v]; if (s) s.qty = 0; },
  of(v){ const [k, val] = v.split(':'); if (ui.of[k] !== undefined) ui.of[k] = val; },
  mplans(v){ ui.mTab = 'plans'; ui.pf = v; ui.msheet = null; },
  mplan(v){ if (S.subs.find(x => x.id === v)) ui.msheet = {type:'plan', subId:v}; },
  mclose(){ ui.msheet = null; },
  'mp-pause'(v){
    const s = S.subs.find(x => x.id === v); if (!s || s.cancelledFrom) return;
    s.pausedFrom = effFrom(s);
    notify(`You paused ${C[s.cust].name}'s ${P[s.prod].name} from ${fmtD(s.pausedFrom)}`, 'pause');
    if (s.cust === 'me') toastC(`Vaaradhi paused your ${P[s.prod].name} from ${fmtD(s.pausedFrom)}.`);
  },
  'mp-resume'(v){
    const s = S.subs.find(x => x.id === v); if (!s) return;
    s.pausedFrom = null;
    notify(`You resumed ${C[s.cust].name}'s ${P[s.prod].name} from ${fmtD(effFrom(s))}`, 'resume');
    if (s.cust === 'me') toastC(`Vaaradhi resumed your ${P[s.prod].name}.`);
  },
  'mp-cancel'(v){
    if (ui.mConfirm !== v){ ui.mConfirm = v; return; }
    const s = S.subs.find(x => x.id === v); ui.mConfirm = null; if (!s || s.cancelledFrom) return;
    s.cancelledFrom = effFrom(s);
    notify(`You cancelled ${C[s.cust].name}'s ${P[s.prod].name} from ${fmtD(s.cancelledFrom)}`, 'cancel');
    if (s.cust === 'me') toastC(`Vaaradhi cancelled your ${P[s.prod].name} from ${fmtD(s.cancelledFrom)}.`);
  },
  cat(v){ ui.cCat = v; ui.q = ''; ui.cTab = 'shop'; },
  close(){ ui.sheet = null; },
  'vac-open'(){ ui.sheet = {type:'vac', len:7}; },
  's-freq'(v){ ui.sheet.freq = v; },
  's-start'(v){ ui.sheet.start = v; },
  's-qty'(v){ ui.sheet.qty = Math.max(1, Math.min(6, ui.sheet.qty + +v.split('|')[1])); },
  's-day'(v){ const d = +v, ds = new Set(ui.sheet.days || []), p = P[ui.sheet.prod]; if (p && p.meal && !p.days.includes(d)) return; ds.has(d) ? ds.delete(d) : ds.add(d); ui.sheet.days = [...ds]; },
  's-preset'(v){ ui.sheet.days = DAY_PRESETS[+v][1].slice(); },
  manage(v){ const s = S.subs.find(x => x.id === v); if (!s) return; ui.sheet = {type:'manage', subId:v, freq:s.freq, days:(s.days || [1,2,3,4,5]).slice(), qty:s.qty}; },
  'm-freq'(v){ ui.sheet.freq = v; },
  'm-day'(v){ const d = +v, ds = new Set(ui.sheet.days || []), sp = S.subs.find(x => x.id === ui.sheet.subId); if (sp && P[sp.prod].meal && !P[sp.prod].days.includes(d)) return; ds.has(d) ? ds.delete(d) : ds.add(d); ui.sheet.days = [...ds]; },
  'm-preset'(v){ ui.sheet.days = DAY_PRESETS[+v][1].slice(); },
  'm-qty'(v){ ui.sheet.qty = Math.max(1, Math.min(6, ui.sheet.qty + +v.split('|')[1])); },
  'm-save'(){
    const sh = ui.sheet, s = S.subs.find(x => x.id === sh.subId); if (!s) return;
    if (!subFreqs(P[s.prod]).includes(sh.freq)){ toastC('That schedule isn\'t available for this product.'); return; }
    if (sh.freq === 'days' && !(sh.days && sh.days.length)){ toastC('Choose at least one day.'); return; }
    const n = amendSub(s, {freq:sh.freq, days: sh.freq === 'days' ? sh.days.slice().sort() : undefined, qty:sh.qty});
    ui.sheet = {type:'manage', subId:n.id, freq:n.freq, days:(n.days || [1,2,3,4,5]).slice(), qty:n.qty};
    notify(`Ananya R. changed ${P[n.prod].name} to ${n.qty} × ${freqLabel(n)} from ${fmtD(n.start)}`, 'add');
    toastC(`Saved. Applies from ${fmtD(n.start)}.`);
  },
  'skip-on'(v){
    const [id, d] = v.split('|'), s = S.subs.find(x => x.id === id); if (!s || d < TMR) return;
    if (d === TMR && S.phase !== 'open'){ ui.sheet = {type:'cutoff', subId:id, prod:s.prod}; return; }
    if (!delivers(s, d)){ toastC('There is no delivery on that date.'); return; }
    const on = (s.skips || []).includes(d);
    s.skips = on ? s.skips.filter(x => x !== d) : [...(s.skips || []), d];
    notify(on ? `Ananya R. wants ${P[s.prod].name} on ${fmtD(d)} after all` : `Ananya R. will skip ${P[s.prod].name} on ${fmtD(d)}`, 'skip', 'k' + id + d);
  },
  'vac-len'(v){ ui.sheet.len = +v; },
  cq(v){
    if (!nowOpen()) return;
    const [prod, d] = v.split('|'), c = S.cart.find(x => x.prod === prod); if (!P[prod] || P[prod].meal) return;
    if (+d > 0 && cartQty(prod) >= stockOf(prod)){ toastC(stockOf(prod) ? `Only ${stockOf(prod)} ${P[prod].name} in stock.` : `${P[prod].name} is out of stock.`); return; }
    if (c){ c.qty = Math.min(9, c.qty + +d); if (c.qty < 1) S.cart = S.cart.filter(x => x !== c); }
    else if (+d > 0) S.cart.push({prod, qty:1});
  },
  'sub-go'(){
    const sh = ui.sheet, p = P[sh.prod];
    if (!subFreqs(p).includes(sh.freq)){ toastC(`${p.name} can't be subscribed on that schedule.`); return; }
    const draft = draftSub(sh); if (!draft){ toastC('Choose at least one day.'); return; }
    if (sh.start < editFrom()){ toastC(`The earliest start is ${fmtD(editFrom())}.`); return; }
    if (p.meal && p.cap && S.phase === 'open' && delivers(draft, TMR) && mealBooked(p.id) + draft.qty > p.cap){ toastC(`${p.name} is fully booked for tomorrow. Start from ${fmtD(DAT)} instead.`); return; }
    const s = {...draft, id:'n'+Date.now(), isNew:true};
    S.subs.push(s); ui.sheet = null;
    const fd = firstDelivery(s);
    notify(`Ananya R. subscribed to ${p.name} × ${s.qty} · ${freqLabel(s)} · starts ${fmtD(fd)}`, 'new');
    toastC(`Subscribed. First delivery ${fmtD(fd)}.`);
  },
  'add-go'(){
    if (S.phase !== 'open') return;
    const sh = ui.sheet, p = P[sh.prod], issue = p.meal ? mealTmrIssue(p, sh.qty) : ''; if (issue){ toastC(issue); return; }
    S.extras.push({id:Date.now(), cust:'me', prod:sh.prod, qty:sh.qty}); ui.sheet = null;
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
    const [id, d] = v.split('|'), s = S.subs.find(x => x.id === id);
    if (S.phase !== 'open'){ ui.sheet = {type:'cutoff', subId:id, prod:s.prod}; return; }
    const o = S.ovr[id] = S.ovr[id] || {};
    o.qty = Math.max(1, Math.min(6, (o.qty || s.qty) + +d)); if ((s.skips || []).includes(TMR)) s.skips = s.skips.filter(x => x !== TMR);
    notify(`Ananya R. changed ${P[s.prod].name} to ${o.qty} for tomorrow`, 'add', 'q'+id);
  },
  'x-qty'(v){
    const [id, d] = v.split('|'), x = S.extras.find(e => String(e.id) === id);
    if (S.phase !== 'open'){ ui.sheet = {type:'cutoff', prod:x.prod}; return; }
    x.qty = Math.max(1, Math.min(6, x.qty + +d));
    notify(`Ananya R. changed ${P[x.prod].name} to ${x.qty} for tomorrow`, 'add', 'x'+id);
  },
  't-skip'(v){
    const s = S.subs.find(x => x.id === v);
    if (S.phase !== 'open'){ ui.sheet = {type:'cutoff', subId:v, prod:s.prod}; return; }
    const on = (s.skips || []).includes(TMR);
    s.skips = on ? s.skips.filter(x => x !== TMR) : [...(s.skips || []), TMR];
    if (!on && S.ovr[v]) delete S.ovr[v].qty;
    notify(on ? `Ananya R. wants ${P[s.prod].name} tomorrow after all` : `Ananya R. skipped ${P[s.prod].name} tomorrow`, 'skip', 'k'+v);
  },
  'x-del'(v){
    const x = S.extras.find(e => String(e.id) === v);
    if (S.phase !== 'open'){ ui.sheet = {type:'cutoff', prod:x.prod}; return; }
    S.extras = S.extras.filter(e => e !== x);
    notify(`Ananya R. removed ${P[x.prod].name} from tomorrow`, 'skip');
  },
  'p-pause'(v){ const s = S.subs.find(x => x.id === v); s.pausedFrom = editFrom(); notify(`Ananya R. paused ${P[s.prod].name} from ${fmtD(s.pausedFrom)}`, 'pause'); toastC('Plan paused. Vaaradhi has been told.'); },
  'p-resume'(v){ const s = S.subs.find(x => x.id === v); s.pausedFrom = null; notify(`Ananya R. resumed ${P[s.prod].name} from ${fmtD(editFrom())}`, 'resume'); },
  'p-cancel'(v){
    if (ui.confirmCancel !== v){ ui.confirmCancel = v; return; }
    const s = S.subs.find(x => x.id === v); s.cancelledFrom = s.start > editFrom() ? s.start : editFrom(); ui.confirmCancel = null; if (ui.sheet && ui.sheet.type === 'manage') ui.sheet = null;
    notify(`Ananya R. cancelled ${P[s.prod].name} from ${fmtD(s.cancelledFrom)}`, 'cancel'); toastC('Plan cancelled.');
  },
  'buy-open'(v){
    const [prod, mode] = v.split('|'), p = P[prod]; if (!p) return; const fs = subFreqs(p);
    let m = mode === 'sub' && !fs.length ? 'now' : mode;
    if (p.meal && (m === 'now' || (m === 'tmr' && !p.once) || (m === 'sub' && !p.sub))) m = p.once ? 'tmr' : 'sub';
    ui.sheet = {type:'buy', prod, mode:m, qty:1, freq: fs[0] || 'daily', days: p.meal ? p.days.slice() : [1,2,3,4,5], start:editFrom()};
  },
  mode(v){ ui.sheet.mode = v; },
  'cart-add'(){
    if (!nowOpen()) return;
    const sh = ui.sheet, ex = S.cart.find(c => c.prod === sh.prod), room = stockOf(sh.prod) - cartQty(sh.prod);
    if (room <= 0){ toastC(`No more ${P[sh.prod].name} in stock.`); return; }
    const qty = Math.min(sh.qty, room);
    if (ex) ex.qty = Math.min(9, ex.qty + qty); else S.cart.push({prod:sh.prod, qty});
    ui.sheet = null; toastC(qty < sh.qty ? `Only ${qty} more ${P[sh.prod].name} in stock. Added ${qty}.` : `${P[sh.prod].name} added to cart.`);
  },
  'cart-open'(){ ui.sheet = {type:'cart'}; ui.bname = null; },
  'c-qty'(v){
    const [prod, d] = v.split('|'), c = S.cart.find(x => x.prod === prod); if (!c) return;
    if (+d > 0 && c.qty >= stockOf(prod)){ toastC(`Only ${stockOf(prod)} ${P[prod].name} in stock.`); return; }
    c.qty = Math.min(9, c.qty + +d); if (c.qty < 1) S.cart = S.cart.filter(x => x !== c);
    if (!S.cart.length) ui.sheet = null;
  },
  place(){
    if (!nowOpen() || !S.cart.length) return;
    const over = S.cart.filter(c => c.qty > stockOf(c.prod));
    if (over.length){ over.forEach(c => c.qty = stockOf(c.prod)); S.cart = S.cart.filter(c => c.qty > 0); toastC(`Stock changed: ${over.map(c => P[c.prod].name).join(', ')} updated in your cart.`); if (!S.cart.length) ui.sheet = null; return; }
    const items = S.cart.map(c => ({...c})), amt = orderAmt(items), id = S.oseq++, bal = balance();
    if (bal < amt) S.ledger.push({date:TDY, seq:S.seq++, type:'topup', via:'UPI · simulated, automatic top-up', amt:Math.ceil((amt - bal)/500)*500, kind:'in'});
    S.ledger.push({date:TDY, seq:S.seq++, type:'order', ref:id, amt:-amt, kind:'out', items:items.map(i => ({prod:i.prod, qty:i.qty, amt:i.qty*P[i.prod].price, status:'ok'}))});
    takeStock(items);
    S.orders.push({id, cust:'me', items, amt, status:'placed', t:clock(), date:TDY});
    S.cart = []; ui.sheet = null; ui.cTab = 'orders';
    notify(`New order #${id} from Ananya R. · ${itemsText(items)} · ${rs(amt)} · Manikonda`, 'order');
    toastC(`Order placed. ${rs(amt)} paid from your wallet.`);
  },
  'o-cancel'(v){
    const o = S.orders.find(x => String(x.id) === v); if (!o || o.status !== 'placed') return;
    o.status = 'cancelled'; putBack(o.items);
    S.ledger.push({date:TDY, seq:S.seq++, type:'refund', ref:o.id, amt:o.amt, kind:'in'});
    notify(`Ananya R. cancelled order #${o.id} before it was accepted. ${rs(o.amt)} refunded.`, 'cancel');
    toastC('Order cancelled. Money is back in your wallet.');
  },
  oadv(v){
    const o = S.orders.find(x => String(x.id) === v); if (!o) return;
    const i = FLOW.indexOf(o.status); if (i < 0 || i >= FLOW.length - 1) return;
    o.status = FLOW[i + 1];
    if (o.cust === 'me') toastC(CTXT[o.status]);
  },
  topup(v){ const a = +v || 1000; S.ledger.push({date:TDY, seq:S.seq++, type:'topup', via:'UPI · simulated', amt:a, kind:'in'}); toastC(`${rs(a)} added to your wallet.`); },
  lock(){
    if (S.phase !== 'open') return;
    S.snapshot = computeLines(); S.phase = 'locked'; S.lockedAt = Date.now(); ui.demoOpen = false; ui.sheet = null;
    const st = stops(), items = okLines().reduce((a,l) => a+l.qty, 0);
    notify(`Tomorrow's list is locked: ${st.length} deliveries, ${items} items, ${rs(st.reduce((a,s) => a+s.amt, 0))}.`, 'lock');
  },
  deliver(v){
    if (S.phase !== 'locked' || S.done[v]) return;   // only during the run, and only once per stop
    const st = stops().find(s => s.cust === v); if (st) takeStock(st.lines);
    S.done[v] = true; if (v === 'me') settle();
    if (stops().every(s => S.done[s.cust])) finishRun();
  },
  morning(){
    if (S.phase !== 'locked') return;
    stops().forEach(s => { if (!S.done[s.cust]) takeStock(s.lines); S.done[s.cust] = true; });
    ui.demoOpen = false; finishRun();
  },
  /* --- add products and breakfast plans (merchant) --- */
  'np-open'(){ ui.msheet = {type:'newprod', name:'', cat:CAT_LIST.find(c => c !== MEAL_CAT).id, unit:'', price:'', qty:12, sub:false, img:null}; },
  'np-qty'(v){ const sh = ui.msheet; if (sh && sh.type === 'newprod') sh.qty = Math.max(0, Math.min(999, sh.qty + +v.split('|')[1])); },
  'np-sub'(){ if (ui.msheet) ui.msheet.sub = !ui.msheet.sub; },
  'np-nophoto'(){ if (ui.msheet) ui.msheet.img = null; },
  'np-save'(){
    const sh = ui.msheet; if (!sh || sh.type !== 'newprod' || !formValid(sh)) return;
    const name = clean(sh.name), id = 'x-' + Date.now().toString(36);
    if (PRODUCTS.some(p => p.name.toLowerCase() === name.toLowerCase())){ toastM(`${name} is already in the shop.`); return; }
    S.custom.push({id, name, category:sh.cat, price:+(+sh.price).toFixed(2), variant:clean(sh.unit) || null, sub:sh.sub, img:sh.img || null, addedOn:TDY});
    S.stock[id] = {qty:sh.qty, low:5}; syncCustom();
    notify(`You added ${name} to the shop · ${rs(+sh.price)}${sh.qty ? ` · ${sh.qty} in stock` : ' · out of stock'}`, 'add');
    ui.msheet = {type:'stock', prod:id}; ui.sq = ''; ui.sf = 'all';
  },
  'np-hide'(v){ const x = S.custom.find(c => c.id === v); if (!x) return; x.hidden = !x.hidden; syncCustom(); S.cart = S.cart.filter(c => !(c.prod === v && x.hidden));
    notify(x.hidden ? `You removed ${x.name} from the shop` : `${x.name} is back in the shop`, x.hidden ? 'cancel' : 'add'); },
  'bf-new'(v){
    const c = v ? window.MEAL_PLANS.plans.find(x => x.id === v) : null;
    ui.mTab = ui.mTab === 'home' || ui.mTab === 'interest' ? ui.mTab : 'bf';
    ui.msheet = {type:'bf', id:null, from:c ? c.id : null, name:c ? c.name : '', desc:'', price:'', days:c ? c.days.slice() : [1,2,3,4,5,6], sub:true, once:true, cap:0};
  },
  'bf-edit'(v){ const m = S.meals.find(x => x.id === v); if (m) ui.msheet = {type:'bf', id:m.id, from:m.from, name:m.name, desc:m.desc, price:String(m.price), days:m.days.slice(), sub:m.sub, once:m.once, cap:m.cap || 0}; },
  'bf-day'(v){ const sh = ui.msheet, d = +v, ds = new Set(sh.days); ds.has(d) ? ds.delete(d) : ds.add(d); sh.days = DOW_ORDER.filter(x => ds.has(x)); },
  'bf-preset'(v){ ui.msheet.days = DAY_PRESETS[+v][1].slice(); },
  'bf-sub'(){ ui.msheet.sub = !ui.msheet.sub; },
  'bf-once'(){ ui.msheet.once = !ui.msheet.once; },
  'bf-cap'(v){ const sh = ui.msheet; sh.cap = Math.max(0, Math.min(500, (sh.cap || 0) + 5 * Math.sign(+v.split('|')[1]))); },
  'bf-save'(){
    const sh = ui.msheet; if (!sh || sh.type !== 'bf' || !formValid(sh)) return;
    const rec = {name:clean(sh.name), desc:clean(sh.desc), price:+(+sh.price).toFixed(2), days:sh.days.slice(), sub:sh.sub, once:sh.once, cap:sh.cap || null};
    if (PRODUCTS.some(p => p.name.toLowerCase() === rec.name.toLowerCase() && p.id !== sh.id)){ toastM(`There is already a product called ${rec.name}.`); return; }
    let m = sh.id && S.meals.find(x => x.id === sh.id);
    if (m) Object.assign(m, rec);
    else { m = {id:'bf-' + Date.now().toString(36), category:'breakfast', meal:true, from:sh.from, addedOn:TDY, ...rec}; S.meals.push(m); }
    syncCustom(); ui.msheet = null; ui.mTab = 'bf';
    notify(sh.id ? `You updated ${m.name}: ${rs(m.price)} per serving, ${daysText(m.days)}` : `${m.name} is on sale: ${rs(m.price)} per serving, ${daysText(m.days)}. Customers can ${[m.sub && 'subscribe', m.once && 'order for a day'].filter(Boolean).join(' or ')}.`, 'new');
  },
  'bf-hide'(v){ const m = S.meals.find(x => x.id === v); if (!m) return; m.hidden = !m.hidden; syncCustom();
    notify(m.hidden ? `You stopped selling ${m.name}. Existing subscriptions continue until you pause or cancel them in Plans.` : `${m.name} is on sale again`, m.hidden ? 'pause' : 'new'); },
  reset(){ seed(); syncCustom(); Object.assign(ui, {cTab:'home', cCat:'All', q:'', subOnly:false, bname:null, confirmDel:null, mTab:'home', of:{type:'all', date:'today', status:'all'}, pf:'all', msheet:null, mConfirm:null, sheet:null, cToast:null, mToast:null, demoOpen:false, confirmCancel:null, prevPrep:null, prevKpi:null, flash:{}, wf:'all', wOpen:null, sf:'all', sq:'', cuf:'all', cuq:''}); },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el || el.disabled) return;
  const a = el.dataset.a;
  if (a !== 'p-cancel') ui.confirmCancel = null;
  if (a !== 'del-basket') ui.confirmDel = null;
  if (a !== 'meal-withdraw') ui.confirmWd = null;
  if (a !== 'mp-cancel') ui.mConfirm = null;
  if (A[a]) { A[a](el.dataset.v); render(); }
});
const SEARCH = {q:'q', sq:'sq', cuq:'cuq'};
document.addEventListener('input', e => {
  const t = e.target, k = SEARCH[t.id];
  if (k){ ui[k] = t.value; render(); }
  else if (t.id === 'bname') ui.bname = t.value;
  else if (t.dataset.f && ui.msheet){ ui.msheet[t.dataset.f] = t.value; const b = document.querySelector('#merchApp [data-valid]'); if (b) b.disabled = !formValid(ui.msheet); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.tagName === 'SELECT' && t.dataset.f && ui.msheet){ ui.msheet[t.dataset.f] = t.value; render(); }
  if (t.id === 'f-photo' && t.files && t.files[0] && ui.msheet) photoToDataURL(t.files[0]).then(url => { if (ui.msheet) { ui.msheet.img = url; render(); } }).catch(() => toastM('That photo could not be read. Try a JPG or PNG.'));
});
/* A product photo picked in the merchant app: cropped square and shrunk to 320 px so it fits in the demo's saved state. */
function photoToDataURL(file){
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const n = 320, c = document.createElement('canvas'), k = Math.min(img.width, img.height); c.width = c.height = n;
      c.getContext('2d').drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, 0, 0, n, n); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', .82)); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(); };
    img.src = url;
  });
}
/* Merge items into the cart and open it (Order Again). Same-day ordering must be open. */
function addItemsToCart(items){
  if (!nowOpen()){ toastC('Same-day ordering is closed for tonight. Your basket stays saved.'); return; }
  const short = [];
  items.forEach(i => { if (!P[i.prod]) return; const c = S.cart.find(x => x.prod === i.prod), room = stockOf(i.prod) - cartQty(i.prod), q = Math.min(i.qty, Math.max(0, room));
    if (q < i.qty) short.push(P[i.prod].name); if (!q) return; if (c) c.qty = Math.min(9, c.qty + q); else S.cart.push({prod:i.prod, qty:Math.min(9, q)}); });
  if (short.length) toastC(`Not enough stock for ${short.join(', ')}. The rest is in your cart.`);
  if (!S.cart.length) return;
  ui.sheet = {type:'cart'}; ui.bname = null;
}
/* ---------- recurring-order helpers ---------- */
function startOptions(){ const out = []; for (let i = 0; i < 7; i++) out.push(plus(editFrom(), i)); return out; }
function draftSub(sh){
  if (sh.freq === 'days' && !(sh.days && sh.days.length)) return null;
  return {id:'draft', cust:'me', prod:sh.prod, freq:sh.freq, days: sh.freq === 'days' ? sh.days.slice().sort() : undefined, qty:sh.qty, start:sh.start, anchor:sh.start, skips:[], pausedFrom:null, cancelledFrom:null, isNew:true};
}
function countIn(s, days){ let n = 0; for (let i = 0; i < days; i++){ if (delivers(s, plus(s.start, i))) n++; } return n; }
function dayPicker(days, act, presetAct, allowed){
  return `<div class="fld"><label>WHICH DAYS</label><div class="opts days">${DOW_ORDER.map(d => `<button class="${(days || []).includes(d) ? 'on' : ''}" data-a="${act}" data-v="${d}" aria-pressed="${(days || []).includes(d)}" ${allowed && !allowed.includes(d) ? 'disabled' : ''}>${DOW[d]}</button>`).join('')}</div>
    ${presetAct ? `<div class="opts presets">${DAY_PRESETS.map(([l], i) => `<button data-a="${presetAct}" data-v="${i}">${l}</button>`).join('')}</div>` : ''}</div>`;
}
/* First date a change can apply to: the cutoff rule, but never before the plan itself starts. */
const effFrom = s => s.start > editFrom() ? s.start : editFrom();
/* Change a plan without rewriting history: the current version ends and a new one starts at the effective date.
   A plan that hasn't started yet is simply updated in place. */
function amendSub(s, ch){
  const eff = effFrom(s), rhythm = ch.freq !== s.freq;
  if (s.start >= eff){ Object.assign(s, ch); if (rhythm) s.anchor = s.start; return s; }
  const n = {...s, ...ch, id:'v' + Date.now(), start:eff, anchor: rhythm ? eff : (s.anchor || s.start), skips:(s.skips || []).filter(d => d >= eff), replaces:s.id};
  delete n.replacedBy;
  s.cancelledFrom = eff; s.replacedBy = n.id;
  if (S.ovr[s.id] && eff === TMR) delete S.ovr[s.id];
  S.subs.push(n);
  return n;
}

if (BRAND && CFG.brandAssets.logo){ const l = document.querySelector('.wm .logo'); l.classList.add('img'); l.innerHTML = `<img src="${CFG.brandAssets.logo}" alt="Vaaradhi Farms">`; }
S = load() || seed();
S.custom = S.custom || []; S.meals = S.meals || []; syncCustom();
render();
/* Keep the clock current. If the real time passes the cutoff while the demo is open, tomorrow's list locks, as it would for real. */
ui.lastMin = nowMin();
setInterval(() => {
  const m = nowMin(); if (m === ui.lastMin) return;
  const crossed = ui.lastMin < CUT_MIN && m >= CUT_MIN; ui.lastMin = m;
  if (crossed && S.phase === 'open') A.lock();
  render();
}, 10000);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
