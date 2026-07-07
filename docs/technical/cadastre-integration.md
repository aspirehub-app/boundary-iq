# Cadastre and Official Data Integration

BoundaryIQ can overlay **official cadastral parcel boundaries** to help users
trace their field accurately. This page documents the integration, the Serbian
source how to add others.

## What it does (and doesn't)

- ✅ Displays official parcel outlines as a semi-transparent map overlay.
- ✅ Helps the farmer **trace** their parcel into the app.
- ❌ Does **not** import parcel geometry automatically (the user traces it).
- ❌ Is **not** a legal authority - always verify with official documents.

> The overlay is a *visual reference*. Stored field boundaries are whatever the
> user draws/enters; they are independent of the overlay.

## Serbia - GeoSrbija / RGZ (default)

The default source is the **INSPIRE Cadastral Parcels** view service published by
the Republic Geodetic Authority (Republički geodetski zavod, RGZ) via the
national geoportal **GeoSrbija**.

| Setting | Value |
|---|---|
| Service type | WMS (OGC Web Map Service) |
| URL | `https://inspire.geosrbija.rs/wms/cp` |
| Layer | `CP.CadastralParcel` |
| Standard | INSPIRE harmonised Cadastral Parcels theme |
| Authority | RGZ - Republic Geodetic Authority of Serbia |

GeoSrbija is the official, free, public geoportal for viewing cadastral parcels,
buildings, administrative boundaries orthophoto imagery for the whole of
Serbia, without registration.

### Related official services (for users)

| Service | URL | Use |
|---|---|---|
| GeoSrbija geoportal | `geosrbija.rs` | Visual cadastre + ortho imagery. |
| RGZ eKatastar | `ekatastar.rgz.gov.rs` | Tabular parcel data (owner, area, rights). |
| GeoSrbija Metakatalog | `metakatalog.geosrbija.rs` | Discover other layers' service endpoints. |

To find a parcel number: locate it on GeoSrbija, click it to read its number and
cadastral municipality, then look it up in eKatastar for legal details.

## How the overlay is rendered

BoundaryIQ adds the WMS as a Leaflet tile layer:

```js
L.tileLayer.wms(state.layers.cadUrl, {
  layers: state.layers.cadLayer,   // e.g. "CP.CadastralParcel"
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  opacity: state.layers.cadOpacity // 0.1–1.0
});
```

It is drawn **above** the base imagery, with adjustable opacity is toggled
from the **Layers** tab. Tile load failures surface an in-app message rather than
breaking the map.

## Adding another country / source (Custom WMS)

Any public OGC **WMS** works:

1. **Layers** tab → tick **Show cadastral parcels** → **Source: Custom WMS...**.
2. Enter the **WMS URL** (the base endpoint, not a full `GetMap` request).
3. Enter the **Layer name** exactly as published.
4. Adjust opacity → **Apply overlay**.

### Finding the right URL and layer name

Request the service capabilities to list available layers:

```
<WMS-URL>?service=WMS&version=1.3.0&request=GetCapabilities
```

Look for `<Layer><Name>...</Name></Layer>` entries; use the `Name` value as the
layer. Many national INSPIRE services follow the `CP.CadastralParcel` naming.

## Coordinate reference systems (CRS)

Leaflet requests WMS tiles in **Web Mercator (EPSG:3857)** by default, which most
public services support. If a particular service only serves another CRS, tiles
may fail to load - switch to a source that supports 3857 or extend the app to
configure the CRS.

## Compliance & attribution

- The overlay attributes **"Cadastre © RGZ / GeoSrbija"** on the map.
- Respect each provider's **terms of use** and rate limits. The overlay is
  optional and off by default.
- This integration uses only **public view services**; it does not scrape,
  store or redistribute the underlying data.

## Design rationale

See [ADR-0007](../adr/0007-geosrbija-inspire-wms-cadastre.md) for why a
configurable WMS overlay (rather than automated parcel import) was chosen.

---

*Next: [Security & Privacy →](security-privacy.md) · [ADR-0007 →](../adr/0007-geosrbija-inspire-wms-cadastre.md)*
