# Glossary

Terms, units abbreviations used across BoundaryIQ and this documentation.

## Domain terms

| Term | Meaning |
|---|---|
| **Field boundary** | The polygon outline of a single parcel the farmer works. |
| **Parcel** | A legally defined unit of land in the cadastre. |
| **Cadastre / Katastar** | The official register of land parcels, owners boundaries. |
| **Implement / working width** | The full side-to-side width of attached equipment (plough, sprayer boom, seeder). |
| **Headland** | The strip near a field edge where machinery turns; often left under- or over-worked. |
| **Keep-clear distance** | How far the equipment *centre* must stay from the border so the implement edge doesn't cross it = `width/2 + margin`. |
| **Safe working zone** | The yellow polygon drawn `keep-clear` distance inside the field. |
| **Safety margin** | Extra buffer the user adds to absorb GPS error and reaction time. |

## Technical terms

| Term | Meaning |
|---|---|
| **PWA** | Progressive Web App - a website that can be installed and run offline. |
| **Service Worker** | Background script that caches files for offline use. |
| **Secure context** | A page served over HTTPS, `localhost` or `file://`; required for GPS and service workers. |
| **localStorage** | Browser key-value storage that persists on the device. |
| **GeoJSON** | JSON format for geographic features; uses `[lng, lat]` order. |
| **WGS84** | The global lat/lng coordinate system (EPSG:4326) used by GPS. |
| **Web Mercator** | Projected CRS (EPSG:3857) used by web map tiles. |
| **CRS** | Coordinate Reference System. |
| **WMS** | OGC Web Map Service - serves map images for given layers/areas. |
| **WFS** | OGC Web Feature Service - serves vector feature geometry. |
| **INSPIRE** | EU directive standardising spatial data services (incl. `CP.CadastralParcel`). |
| **Tile** | A small square map image; maps are mosaics of tiles. |
| **Point-in-polygon** | Test for whether a coordinate lies inside a polygon. |
| **Buffer** | A polygon grown/shrunk by a distance; a *negative* buffer shrinks inward. |
| **Wake Lock** | Browser API to keep the screen awake. |

## Organisations & services

| Abbrev. | Full name |
|---|---|
| **RGZ** | Republički geodetski zavod - Republic Geodetic Authority of Serbia. |
| **GeoSrbija** | Serbia's national geoportal (geosrbija.rs). |
| **eKatastar** | RGZ's online register of real-estate (tabular) data. |
| **OSM** | OpenStreetMap. |
| **Esri** | Provider of the World Imagery satellite tiles. |

## Units

| Unit | Used for |
|---|---|
| **metre (m)** | Distances, implement width, margins, keep-clear distance. |
| **hectare (ha)** | Field area (1 ha = 10,000 m²). |
| **km/h** | Speed readout. |
| **degrees (°)** | Heading (0° = north) and WGS84 coordinates. |

---

*Back to: [Documentation hub](../README.md)*
