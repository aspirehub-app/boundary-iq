# Frequently Asked Questions

## Cost & accounts

**Is it really free?**
Yes. There is no purchase, no subscription no in-app payment. It is built
entirely on free and open-source software and free public map/cadastre data.

**Do I need to create an account or log in?**
No. There is no sign-up and no login - ever. You just open it and use it.

**Where is my data stored? Who can see it?**
Only on your own device, in the browser's local storage. Nothing about you or
your land is uploaded to any server. See [Security & Privacy](../technical/security-privacy.md).

## Accuracy

**How accurate is it?**
It is as accurate as your phone's GPS - typically **3–10 metres** in open sky.
That's why you set a **safety margin**. It is *not* centimetre-accurate like an
RTK farm system.

**Can I trust it for legal boundary disputes?**
No. BoundaryIQ is a **driving aid**, not a legal or survey instrument. For
official matters, use the cadastre and a licensed surveyor.

**Why does my position jump around?**
Consumer GPS naturally drifts, especially near trees, buildings or under cloud.
Wait for the **GPS accuracy** readout to settle (smaller is better) and increase
your safety margin if needed.

## Fields

**Can I store more than one field?**
Yes - add as many as you like and switch between them with the dropdown.

**I already have my field's coordinates. Can I type them in?**
Yes. Use **Enter coordinates** and paste `lat, lng` lines (WGS84 decimal
degrees).

**Can I edit a field after drawing it?**
Yes - tap a corner dot to remove it, use **Undo point** while drawing or
re-enter coordinates.

## Using it in the field

**Does it work without internet?**
Mostly. Once the app has loaded, it keeps working offline. Only **new** map
areas need a connection to download imagery. Pre-load your field's area while
you have signal.

**Will it drain my battery?**
Continuous GPS and an awake screen use power. Bring a charger for long sessions,
or turn off **Keep screen awake**.

**Where should I put my phone?**
Mount it roughly at the **centre** of the cab/equipment for the most accurate
border distances, with a clear view of the sky.

## Cadastre / official data

**Whose boundaries does the cadastre overlay show?**
For Serbia, official parcels from the Republic Geodetic Authority (RGZ) via the
GeoSrbija INSPIRE service. It's a visual guide for tracing - not a substitute for
official documents.

**Can I use cadastre data from another country?**
Yes. In **Layers → Cadastre → Custom WMS...** enter any public WMS URL and layer
name.

## Privacy & trust

**Does the app track me or show ads?**
No tracking, no analytics, no ads. The only network requests are for map tiles
and (if enabled) the cadastre overlay.

**How do I move my fields to a new phone?**
**Export all data** to a file, transfer it **Import...** on the new device.

---

*Didn't find your answer? See [Troubleshooting](troubleshooting.md).*
