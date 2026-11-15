# Vaaradhi Farms: subscription app demo

A clickable pitch demo for Vaaradhi Farms (Manikonda, Hyderabad). It has two connected apps, one for the customer and one for Vaaradhi. Customers can order for right now (same-day delivery), add to tomorrow's basket, or subscribe. Everything runs in the browser on sample data, with no backend.

- **Laptop or tablet** (900px wide or more): both phones side by side, connected live.
- **Phone:** one app at a time. Use the **Customer | Vaaradhi | How it works** switch at the top and the **Demo ▾** menu.
- **Install like an app:**
  - iPhone: open in Safari, tap Share, then **Add to Home Screen**.
  - Android: open in Chrome, tap the ⋮ menu, then **Install app** or **Add to Home screen**.

## Demo script (about 5 minutes)
1. **Home.** "Healthy habits, made easier." with three entry points: Healthy Meal Plans, Shop Groceries and Order Again.
2. **Shop Groceries.** Pick a category from the picture rail on the left, search ("oil"), or use "Can subscribe". Tap a photo for product details. Tap ADD on a few items, then **View cart → Place order**. On the Vaaradhi side, **Accept → Mark packed → Send out → Mark delivered** while the customer's tracker follows along.
3. **Save and reorder.** In the cart, **Save** the basket. Then **Orders → Saved baskets → Add all to cart**, or **Reorder** a previous order.
4. **Subscriptions.** Tap **Subscribe** on any eligible product: daily, alternate days, selected weekdays, weekly or every 2 weeks. On **Schedule**, each plan shows its next delivery. Tap **Manage** to skip any upcoming date, change quantity or schedule, pause, resume or cancel. Vaaradhi's Tomorrow tab updates live.
5. **Healthy Meal Plans** (concept proposed by Scribr). Four plan ideas. Tap **Share my preferences**, pick preferred days and an indicative number of servings, and submit. The confirmation says plainly that it is **not an order**. On the Vaaradhi side, **Customers → Breakfast plan interest** shows responses per concept, with preferred-day bars and serving preferences. Sample responses are labelled "Sample". Interest never appears in Orders, Tomorrow, Run or Earnings.
6. **Cutoff.** The clock is the real time in India. Use **Demo → Skip past 9 PM IST** to jump ahead (the Vaaradhi header then says "Demo shows after 9 PM IST"), then try to skip tomorrow on Schedule. The app explains that tomorrow is being prepared and offers to skip the next eligible date instead.
7. **Demo → Run morning deliveries.** The morning delivery appears in **Wallet → History** as one entry; tap it to see each item, including skipped ones at ₹0 (simulated).
8. **Vaaradhi side.**
   - **Overview:** today's three key numbers, coloured tiles for what needs attention (new orders, stock alerts, orders in progress, changes for tomorrow), shortcuts (add product, breakfast plan, stock, delivery run), today's orders as one progress bar, plan counts, and repeat-ordering figures labelled as demo data.
   - **Orders:** Today / Tomorrow / Earlier / All tabs with counts, a summary strip, status chips and a type switch. Orders are grouped into new, in progress, recurring, delivered and cancelled; each card has a coloured status edge, a step bar and one action. Recurring deliveries are tomorrow's stops from plans.
   - **Tomorrow:** the prep sheet, split into plan and one-time quantities, plus every customer change for tomorrow.
   - **Plans:** active, paused, changing and ended plans. Open one to see upcoming dates or to pause, resume or cancel it.
   - **Customers:** search and filter; tap a customer for their plans, next delivery and recent orders. **Breakfast plan interest** opens from here.
   - **Stock:** demo stock per product, with out-of-stock, short-for-tomorrow and low-stock flags. Tap a product to add received stock, set its alert level or mark it out of stock. An out-of-stock product can't be added to a customer's same-day cart. **Add a product** (name, category, pack size, price, opening stock, optional subscription and photo) puts it in the customer shop straight away, marked New.
   - **Plans → Breakfast plans:** add a breakfast plan, or launch one of the four concepts, by typing the menu, price per serving, days served and an optional daily limit. Choose whether customers can subscribe, order for a day, or both. It appears in the customer app under Healthy Meal Plans and in Shop, and its servings show on the prep sheet. Nothing is pre-filled except a concept's name.
   - The **Delivery run** opens from Tomorrow; **Earnings** (simulated) opens from Overview.

Use **Demo → Reset demo** before each pitch. State is saved in the browser and resets on its own each new day.

## Project layout
| Path | What it is |
|---|---|
| `index.html` | Page shell. Loads the files below. |
| `css/app.css` | All styles. |
| `js/app.js` | App logic and rendering (customer and merchant). |
| `data/catalogue.js` | **Product catalogue**: 50 curated Vaaradhi products with EkSecond displayed prices (verified 28 Oct 2026), categories, and **proposed** subscription eligibility per product. Generated by `tools/build_catalogue.py`; safe to hand-edit. |
| `data/plans.js` | **Breakfast plan concepts** (proposed, menu and pricing to be confirmed). |
| `img/products/`, `data/product-images.js` | One photo per product and where it came from: Vaaradhi's own (EkSecond or vaaradhifarms.com) or a credited Wikimedia Commons representative photo. Made by `tools/fetch_product_images.py`. |
| `data/config.js` | Asset mode: `brand` (Vaaradhi's logo, `img/vaaradhi-logo.png`) or `placeholder` (a "VF" wordmark). Cutoff, sample interest, home row. |
| `data/catalogue-notes.md` | Sources, what is and isn't verified, unresolved variants and images, channel price differences. |
| `data/source/` | Raw captures: EkSecond (192 items) and the Shopify reference catalogue (78 products). |
| `tools/build_catalogue.py` | Rebuilds `data/catalogue.js` from the EkSecond capture. Edit the curated list and eligibility there. |
| `tools/make_meeting_copy.py` | Builds a **local-only** `meeting-copy/` with Vaaradhi's logo and the 8 sample interest responses. Git-ignored; never publish it. |
| `tests/smoke.html` | Automated checks of the customer and merchant demo. |
| `slides.html`, `assets/slides/` | Nine-slide presentation and its screenshots of the public demo. |
| `tests/slides-check.html` | Automated checks of the presentation. |
| `tools/capture_slides.py`, `tools/capture.html` | Capture the slide screenshots from the demo. |
| `docs/discovery-questions.md` | Questions for the owner meeting, with space for answers. |
| `archive/pitch-v1.html` | Earlier pitch page, archived. Not linked from the demo or slides, and not copied into the meeting copy. |
| `img/*.jpg`, `CREDITS.md` | Photos used by the archived pitch, plus attribution for every Wikimedia Commons photo. |

## Editing
- **Products, prices, eligibility:** edit `CURATED`, `ELIGIBILITY` and `NOT_ELIGIBLE_ITEMS` in `tools/build_catalogue.py`, then run `python tools/build_catalogue.py`. Or edit `data/catalogue.js` directly.
- **Breakfast plans:** the four concepts live in `data/plans.js` with no menu or price. Plans added in the demo (Plans → Breakfast plans) are saved in the browser only; to make one permanent, add it to `data/plans.js` once the owner confirms menu, price and capacity.
- **Subscription cutoff (provisional):** `subscriptionCutoff` in `data/config.js` (24-hour local time, Asia/Kolkata assumed). Every label in the app follows it.
- **Home "Everyday essentials" row:** `homeEssentials` in `data/config.js`. This is a presentation choice, not a sales ranking.
- **Product photos:** `python tools/fetch_product_images.py` re-downloads them (needs Pillow). Pick a different stock photo by editing `COMMONS` in that script, then update `CREDITS.md`.
- **Logo:** the demo shows Vaaradhi's logo (`img/vaaradhi-logo.png`, from vaaradhifarms.com). The local meeting copy (`python tools/make_meeting_copy.py`) adds the 8 sample interest responses.

## Tests
Serve the folder (`python -m http.server 5600`) and open http://localhost:5600/tests/smoke.html and http://localhost:5600/tests/slides-check.html. All checks should show PASS.

## How recurring orders work in the demo
- **Schedules:** one rule per plan (daily, alternate days, selected weekdays, weekly, every 2 weeks). Monthly is not offered.
- **No stored delivery records:** tomorrow's list is calculated from active plans, so refreshing or navigating cannot create duplicate deliveries. At the cutoff the list is frozen once (a "snapshot"), and the morning run charges each delivery once.
- **Changes never rewrite history:** a quantity or schedule change ends the current version of the plan and starts a new one from the next editable date.
- **Dates and times use India Standard Time (IST)** on both the customer and Vaaradhi sides, and times are labelled IST. The clock is the real current time in India, so it matches a phone or laptop set to India time. Sample orders are timed a few minutes to a few hours before now. If the real time passes the cutoff while the demo is open, tomorrow's list locks by itself. The demo controls can run ahead of the clock; the Vaaradhi header then says so (for example "Demo shows after 9 PM IST"). The provisional cutoff is `subscriptionCutoff` in `data/config.js`. Before it, tomorrow can be changed; at or after it, changes apply from the day after tomorrow.

## What is real and what is simulated
- **Verified:** product names and displayed prices from the EkSecond ordering page, captured 28 Oct 2026. Not synchronised.
- **Breakfast-interest samples:** the public demo starts with no interest responses. The local meeting copy adds 8 illustrative responses, labelled "Sample" and stored apart from customer submissions (`sampleInterest` in `data/config.js`).
- **Proposed:** subscription eligibility per product, breakfast plan concepts. Customer interest in a concept is stored separately from orders and plans. It is one record per customer per concept, and it is never charged, scheduled or counted as revenue.
- **Simulated:** customers, orders, wallet balances and top-ups, payments, earnings, settlements, stock levels, notifications. No real money moves and no external service is connected; stock is not synced with EkSecond or the website.
- **Photos:** 28 products use Vaaradhi's own photos (20 from EkSecond, 8 from vaaradhifarms.com). The other 22 use Wikimedia Commons photos labelled "Representative photo" in the product sheet and credited in `CREDITS.md`.

## Presentation (nine slides)
`slides.html` is the primary pitch. Slides 1–5 open the meeting, slide 5 hands over to the live demo, slides 6–8 recap the demo (or stand in for it), and slide 9 proposes the pilot.

1. **Title and agenda.**
2. **Where Vaaradhi is today:** the store, website, ordering page with WhatsApp, and Swiggy/Zomato, each with its source.
3. **What's missing:** what we saw on public channels (website checked 15 Nov 2026, ordering page captured 28 Oct 2026), next to questions to confirm with Vaaradhi. Nothing about internal tools or numbers is assumed.
4. **How Scribr would help:** each gap, the feature that fills it, and what it's designed to do (not a promised result).
5. **How a day would run:** alongside existing channels, then the live demo.
6–9. **Customer experience, breakfast concepts, merchant experience, pilot.**

**Run it**
1. Serve the folder: `python -m http.server 5600`.
2. Open http://localhost:5600/slides.html. Opening the file directly also works, but offline caching then doesn't.
3. Move with **← →** (or Space, Page Up/Down), the **Back / Next** buttons, or the numbered dots. **Home** and **End** jump to the first and last slide. **N** shows presenter notes, **F** goes full screen, and `slides.html#3` opens slide 3.

**Meeting version (with Vaaradhi's logo and sample interest)**
1. Run `python tools/make_meeting_copy.py`. It rebuilds `meeting-copy/` and re-captures the slide screenshots from it, which takes about 2 minutes.
2. Serve `meeting-copy/` (for example `python -m http.server 5601` inside it).
3. Open http://localhost:5601/slides.html.

These screenshots stay in the git-ignored `meeting-copy/assets/slides/`. **Never commit or publish them.**

**Screenshots**
- `assets/slides/` holds real screenshots of the public demo (with the logo, no sample interest, shown at 7:02 PM IST), made by `python tools/capture_slides.py`.
- Re-run that command after any UI change so the slides match the demo.
- Slide 3's concept cards are read from `data/plans.js`.

**Offline:** when served over http, the page caches itself, including the slides and screenshots, after the first visit. The Google font falls back to system fonts when offline.

**Discovery questions:** `docs/discovery-questions.md`, with space to write in the owner's answers.

**Archive:** `archive/pitch-v1.html` is the earlier single-page pitch. It's kept for reference only and superseded by the slides.

## Running locally
```
python -m http.server 5600
```
Then open http://localhost:5600 (demo) or http://localhost:5600/slides.html (presentation). If Windows refuses the port (error 10013), pick another, such as 5601. To reach it from a phone on the same Wi-Fi, use your PC's IP address instead of localhost.

## Hosting (GitHub Pages)
The repo's remote is `origin` (`NikhilSagili/ScribrHQ-Vaaradhi`), and Pages serves `main` / `/ (root)`. Publishing is `git push origin main`; Pages redeploys within a few minutes. Every path is relative, so the demo works under the repo's sub-path.

After a deploy, open the site once online so the offline cache (`sw.js`) picks up the new version. Bump `CACHE` in `sw.js` whenever cached files change.

`index.html`, `slides.html` and the archived pitch have `noindex` set, so search engines won't list them. Everything tracked in the repo is publicly reachable on Pages, including `tools/`, `tests/`, `data/source/` and `archive/`. `meeting-copy/` and `brand/` are git-ignored and never published.
