# Troubleshooting

Quick fixes for common issues. Most problems are GPS- or browser-related.

## Location / GPS

### "The app won't get my location"
1. **Check the address bar.** Browser GPS only works over **HTTPS**,
   `http://localhost` or by opening the file directly on a computer. A plain
   `http://` website on a remote server will be blocked. Host it on a free HTTPS
   tier (see [Deployment](../technical/deployment.md)).
2. **Allow the permission.** When prompted, choose *Allow*. If you blocked it
   before, re-enable location for the site in your browser's site settings.
3. **Turn on device location.** Enable GPS/Location in your phone's system
   settings.
4. **Go outside.** GPS needs a clear view of the sky; it rarely works well
   indoors.

### "My position is inaccurate or jumps around"
- Wait for the **GPS accuracy** value to drop (smaller = better) before trusting
  alerts.
- Move away from buildings, dense trees or metal structures.
- Increase the **safety margin** on the Equipment tab to absorb the wobble.

### "Speed or heading shows '-'"
Not all devices report speed/heading at low movement. Heading is estimated from
your movement once you're driving more than ~1 m between updates.

## Field drawing

### "I can't finish my field"
A field needs **at least 3 corners**. Add more points, then press **Finish**.

### "I tapped the wrong place"
Use **Undo point** while drawing or tap a corner dot afterwards to remove it.

### "The safe (yellow) zone disappeared"
- Make sure **Show safe working zone** is ticked on the Equipment tab.
- If your field is **narrower than the keep-clear distance**, the safe zone
  shrinks to nothing - reduce the implement width or margin or the field is
  genuinely too narrow to work safely with that implement.

## Map & cadastre

### "The map is blank / tiles won't load"
- You need a connection the **first** time you view an area. Pre-load your field
  area while you have signal.
- Try a different **Base map** (Layers tab).

### "The cadastre overlay doesn't appear"
- Confirm **Show cadastral parcels** is ticked and you pressed **Apply overlay**.
- Check the **WMS URL** and **Layer name** are correct (the GeoSrbija preset is
  `https://inspire.geosrbija.rs/wms/cp`, layer `CP.CadastralParcel`).
- The official service may be temporarily down or rate-limited; try again later.
- A "tiles failed to load" message points to a URL/layer or connectivity issue.

## Alerts

### "No sound"
- Tick **Sound alarm** on the Track tab.
- Browsers require a tap before playing audio - press **Start tracking** (a user
  action) to unlock sound.
- Check your phone isn't on silent and the volume is up.

### "No vibration"
Vibration is only supported on some phones/browsers (notably not on iPhone
Safari). The visual banner and sound still work.

### "Screen keeps turning off"
Tick **Keep screen awake** on the Track tab. This uses the Wake Lock API, which
isn't available in every browser; if unsupported, adjust your phone's screen
timeout instead.

## Data

### "I lost my fields"
- Data is per-browser and per-device. Make sure you're using the **same browser**
  on the **same device** that you didn't clear site data.
- Restore from a backup with **Import...** if you exported one.
- **Private/Incognito** windows discard storage when closed - use a normal window.

### "I want to start over"
**Layers → Data → Reset everything.** (This cannot be undone - export first if
unsure.)

## Still stuck?

Capture what you see (a screenshot helps) and check the
[FAQ](faq.md). For technical diagnosis, the browser's developer console
(`F12`) shows any errors.
