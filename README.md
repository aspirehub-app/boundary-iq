# BoundaryIQ - Field Boundary Assistant

BoundaryIQ helps a farmer stay inside their **own** field. You enter the field
boundary and your equipment/implement width once, then the app uses your phone's
GPS to track movement and **warns you before the implement crosses the border**
into a neighbour's field.

- **No login, no server, no fees.** Everything runs in your browser and is
  saved on your device (`localStorage`).
- **100% open-source stack** - [Leaflet](https://leafletjs.com) (BSD-2),
  [Turf.js](https://turfjs.org) (MIT), OpenStreetMap / Esri imagery tiles. The
  libraries are bundled locally in `vendor/`, so no CDN is required.
- **Serbian cadastre built in** - official parcel boundaries from the Republic
  Geodetic Authority (RGZ) via the GeoSrbija INSPIRE WMS can be shown as an
  overlay to help you trace your parcel. Any other public WMS works too.
- **Installable & offline-capable** - it's a PWA. Once loaded it works without
  internet (map tiles still need a connection in new areas).

## How to run it

Because the Geolocation API needs a *secure context*, use one of these:

### Option A - open the file directly (quickest)
Double-click `index.html`. Chrome and Firefox treat `file://` as secure, so GPS
works. (The offline service worker only activates over http/https.)

### Option B - serve locally over http (recommended for full PWA features)
Any static server works. A few examples:

```bash
# Node (if installed)
npx serve .

# Python (if installed)
python -m http.server 8080

# VS Code: right-click index.html -> "Open with Live Server"
```

Then open `http://localhost:8080`.

### Option C - free HTTPS hosting (best for using it on your phone in the field)
Upload this folder to any free static host to get an HTTPS URL you can open on
your phone and "Add to Home screen":

- **GitHub Pages**, **Netlify Drop** (drag-and-drop the folder), **Cloudflare
  Pages** or **Vercel** - all have free tiers.

> GPS in the browser requires HTTPS (or localhost / file://). Plain `http://`
> on a remote server will **not** allow location access.

## How to use it

1. **Field tab → add your field** using any of:
   - **Draw on map** - switch to satellite imagery (Layers tab) and tap each
     corner of your field.
   - **Walk / drive the border** - drive the perimeter and drop a GPS point at
     each corner (or auto-record on a timer).
   - **Enter coordinates** - paste `lat, lng` lines (WGS84 decimal degrees).
   - **Cadastre helper** - turn on the cadastral overlay, find your parcel
     trace it.
2. **Equipment tab** - enter your implement/working width and an optional safety
   margin (for GPS error). The app computes a *keep-clear distance* and shows a
   yellow "safe working zone" inside your field.
3. **Track tab → Start tracking.** A big banner shows your status:
   - 🟢 **Inside field** - safe room shown.
   - 🟡 **Approaching border** - slow down (beep + vibrate).
   - ⛔ **Crossing / outside** - steer back (urgent alarm + vibrate).
   - Optional **sound**, **vibration** **keep-screen-awake**.
   - **Test mode** lets you tap the map to simulate the position at your desk.

## Cadastre / official data sources

| Country | Source | Default in app |
|---|---|---|
| 🇷🇸 Serbia | GeoSrbija / RGZ - INSPIRE Cadastral Parcels WMS | `https://inspire.geosrbija.rs/wms/cp`, layer `CP.CadastralParcel` |
| Any | Any public WMS (set "Custom WMS..." in Layers tab) | configurable URL + layer |

The cadastre overlay is a **visual aid for tracing**. Always confirm legal
field boundaries with official documents (e.g. RGZ `eKatastar`,
`ekatastar.rgz.gov.rs`).

## Privacy

No account, no analytics, no network calls except map/cadastre tiles. Your
location never leaves the device. Use **Export / Import** (Layers tab) to back
up your fields or move them to another device.

## Files

```
index.html              app shell / UI
styles.css              styling (mobile-first)
app.js                  all logic (state, map, GPS, geo-math, alerts)
manifest.webmanifest    PWA manifest
sw.js                   service worker (offline app shell)
icon.svg                app icon
vendor/                 bundled Leaflet + Turf.js (open source)
```

## Accuracy notes

- Phone GPS is typically accurate to ~3–10 m. Set a safety margin accordingly.
- The "implement crossing border" warning assumes your phone is at the equipment
  centre. Mount it centrally for best results.
- This is a guidance aid, not a survey-grade or legal instrument.
