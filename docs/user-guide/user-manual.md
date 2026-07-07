# User Manual

The complete guide to every feature in BoundaryIQ.

- [Screen layout](#screen-layout)
- [Fields](#fields)
- [Equipment & safety zone](#equipment--safety-zone)
- [Tracking & alerts](#tracking--alerts)
- [Map layers & cadastre](#map-layers--cadastre)
- [Backup, restore & reset](#backup-restore--reset)
- [Installing & offline use](#installing--offline-use)

---

## Screen layout

| Element | Description |
|---|---|
| **Map** | The main area. Pinch/scroll to zoom, drag to pan. |
| **Status banner** (top) | Appears during tracking; shows safe/warn/danger and distance to border. |
| **⌖ Locate button** | Centres the map on your current GPS location. |
| **☰ Panel button** | Hides/shows the control panel for a full-screen map. |
| **Control panel** | Tabs: **Field**, **Equipment**, **Track**, **Layers**. |
| **Saved indicator** (bottom of panel) | Flashes "Saved ✓" - confirms your data is stored on the device. |

---

## Fields

You can store **multiple named fields** and switch between them with the
dropdown at the top of the **Field** tab. Use **＋** to add, **🗑** to delete.

### Method 1 - Draw on the map

Best with the **satellite** background for accuracy.

1. **Start drawing.**
2. Tap each corner of your field in order around the perimeter.
3. **Undo point** removes the last corner; **Finish** closes the field.
4. Tap a corner dot afterwards to remove it (when not drawing).

A field needs **at least 3 corners.**

### Method 2 - Walk / drive the border

For when you're physically at the field.

1. **Start walking** (allows GPS).
2. Drive to a corner and press **Drop GPS point**. Repeat for each corner.
3. Or tick **Auto-record point every N seconds** to log points automatically as
   you drive the edge.
4. **Finish** when done.

### Method 3 - Enter coordinates

If you have coordinates from the cadastre or a survey:

- Paste one point per line as `lat, lng` in **WGS84 decimal degrees**, e.g.

```
44.81250, 20.46150
44.81280, 20.46260
44.81190, 20.46300
```

- Press **Apply coordinates**.
- **Copy current** writes your existing field's coordinates into the box so you
  can copy them elsewhere.

### Field statistics

Once a field has 3+ corners, the **Cadastre helper** card shows the number of
corners, the **area** (ha and m²) the **perimeter**.

---

## Equipment & safety zone

On the **Equipment** tab:

| Setting | Meaning |
|---|---|
| **Implement / working width (m)** | The full width of the widest part of your equipment (plough, sprayer boom, seeder). |
| **Extra safety margin (m)** | Added buffer for GPS error and reaction time. |

The app computes:

- **Half implement width** = width ÷ 2
- **Keep-clear distance from border** = (width ÷ 2) + margin

This *keep-clear distance* is how far your equipment **centre** must stay from the
border so the implement edge never crosses it.

**Show safe working zone on map** draws a yellow dashed boundary that distance
inside your field. Keep your equipment inside the yellow line and you're safe.

> The safe zone is recalculated whenever you change the width, margin or field.

---

## Tracking & alerts

On the **Track** tab, press **▶ Start tracking**. The status banner shows one of:

| State | Banner | Trigger |
|---|---|---|
| 🟢 **Inside field** | green, "X m of safe working room" | distance to border greater than keep-clear |
| 🟡 **Approaching border** | yellow, "slow down" | within keep-clear distance |
| ⛔ **Implement crossing border** | red, pulsing | implement edge is over the line |
| ⛔ **Outside your field** | red, pulsing | you've left the field entirely |

Live readouts below the button show **Status**, **Distance to border**, **GPS
accuracy** **Speed**.

### Alert options

| Option | Effect |
|---|---|
| **Sound alarm** | Beeps - a gentle tone for *approaching*, an urgent double-beep for *crossing*. |
| **Vibrate** | Haptic buzz (on supported phones); stronger pattern for danger. |
| **Keep screen awake** | Prevents the screen from sleeping while tracking (uses the Wake Lock API where available). |

Alerts repeat on a cadence while you remain in a warning/danger state (roughly
every ~0.9 s for danger, ~2.4 s for warning) so you're never left guessing.

### Test mode (no GPS)

**Enable test mode**, then tap anywhere on the map to place a simulated equipment.
Combined with **Start tracking**, this lets you rehearse the alerts indoors. The
heading arrow follows your taps. Disable test mode to return to real GPS.

---

## Map layers & cadastre

On the **Layers** tab:

### Base map

| Option | Use it for |
|---|---|
| **OpenStreetMap (streets)** | Roads, villages orientation. |
| **Satellite imagery (Esri)** | Tracing field edges accurately. |
| **Topographic (OpenTopoMap)** | Terrain and elevation context. |

### Cadastre overlay

Show official parcel boundaries as a semi-transparent overlay:

1. Tick **Show cadastral parcels (WMS)**.
2. Choose a **Source**:
   - **Srbija - GeoSrbija / RGZ (INSPIRE)** - preset for Serbia.
   - **Custom WMS...** - enter any public WMS **URL** and **Layer name**.
3. Adjust **Opacity**.
4. Press **Apply overlay**.

> The cadastre is a **tracing aid**. Always verify legal boundaries with official
> documents (see [Cadastre Integration](../technical/cadastre-integration.md)).

---

## Backup, restore & reset

All data lives on your device. On the **Layers** tab under **Data**:

- **Export all data** - downloads a `BoundaryIQ-data.json` file (your fields and
  settings). Keep it as a backup.
- **Import...** - load a previously exported file (e.g. on a new phone).
- **Reset everything** - erases all fields and settings on this device.

---

## Installing & offline use

BoundaryIQ is a **Progressive Web App**:

- **Add to Home screen** (Android Chrome / iPhone Safari) for a full-screen,
  app-like experience.
- Once loaded, the app shell works **offline**. Map tiles and the cadastre
  overlay still need a connection for areas you haven't visited before.

---

*See also: [FAQ](faq.md) · [Troubleshooting](troubleshooting.md) · [Glossary](../technical/glossary.md)*
