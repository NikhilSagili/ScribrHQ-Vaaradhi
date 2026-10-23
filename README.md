# Vaaradhi Farms: subscription app demo

A clickable pitch demo for Vaaradhi Farms (Manikonda, Hyderabad). It has two connected apps, one for the customer and one for Vaaradhi. Everything runs in the browser on sample data, with no backend.

- **Laptop or tablet** (900px wide or more): both phones side by side, connected live.
- **Phone:** one app at a time. Use the **Customer | Vaaradhi | How it works** switch at the top and the **Demo ▾** menu.
- **Install like an app:**
  - iPhone: open in Safari, tap Share, then **Add to Home Screen**.
  - Android: open in Chrome, tap the ⋮ menu, then **Install app** or **Add to Home screen**.

## Demo script (about 3 minutes)
1. **Tomorrow tab → "Going out of town?" → 1 week.** Vaaradhi gets an alert, the prep sheet and revenue drop, and the wallet shows ₹0 for those days.
2. **Shop → Seasonal Fruit Box → + Tomorrow.** It appears on Vaaradhi's prep sheet.
3. **Shop → any item → Subscribe.** It shows up in Vaaradhi's customers and tomorrow's list.
4. **Demo → Skip to 9:01 PM.** Customer edits lock and Vaaradhi's list is ready to pack.
5. **Demo → Run morning deliveries,** or mark stops on the Run tab. The wallet is charged only for what was delivered, and Earnings shows the next-day payout.

Use **Demo → Reset demo** before each pitch. State is saved in the browser and resets on its own each new day.

## Editing
- **Menu and prices:** the `PRODUCTS` list at the top of the `<script>` in `index.html`.
- **Customers and areas:** the `CUSTOMERS` and `AREAS` lists right below it.

## Running locally
```
python -m http.server 8080
```
Then open http://localhost:8080. To reach it from a phone on the same Wi-Fi, use your PC's IP address instead of localhost.

## Hosting (GitHub Pages)
1. Create an empty repo on GitHub, then add it as a remote and push: `git remote add origin <url>` and `git push -u origin main`.
2. In the repo, go to **Settings → Pages**, set the source to **Deploy from a branch**, and choose `main` / `/ (root)`.

The page has `noindex` set, so search engines won't list it.
