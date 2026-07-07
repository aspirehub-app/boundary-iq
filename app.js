/* =========================================================================
   BoundaryIQ - field boundary assistant
   Pure client-side. No build step, no server, no account.
   Data persists in localStorage. Geo math via Turf.js, map via Leaflet.
   ========================================================================= */
"use strict";

/* ----------------------------- State ----------------------------------- */
const STORE_KEY = "BoundaryIQ.v1";

const DEFAULT_STATE = {
  fields: [],            // { id, name, coords: [[lat,lng], ...] }
  activeFieldId: null,
  equipment: { width: 3, margin: 0.5, showInner: true },
  layers: {
    base: "sat",
    cadEnabled: false,
    cadPreset: "geosrbija",
    cadUrl: "https://inspire.geosrbija.rs/wms/cp",
    cadLayer: "CP.CadastralParcel",
    cadOpacity: 0.7,
  },
  alerts: { sound: true, vibrate: true, keepAwake: false },
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return deepMerge(structuredClone(DEFAULT_STATE), parsed);
  } catch (e) {
    console.warn("Could not load state", e);
    return structuredClone(DEFAULT_STATE);
  }
}

function deepMerge(base, over) {
  for (const k in over) {
    if (over[k] && typeof over[k] === "object" && !Array.isArray(over[k])) {
      base[k] = deepMerge(base[k] || {}, over[k]);
    } else {
      base[k] = over[k];
    }
  }
  return base;
}

let saveTimer = null;
function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      flashSaved();
    } catch (e) {
      toast("Could not save - storage full or blocked");
    }
  }, 250);
}

/* ----------------------------- Helpers ---------------------------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const uid = () => Math.random().toString(36).slice(2, 9);

function toast(msg, ms = 2600) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add("hidden"), ms);
}

function flashSaved() {
  const el = $("#save-indicator");
  el.classList.add("flash");
  el.textContent = "Saved ✓";
  clearTimeout(flashSaved._t);
  flashSaved._t = setTimeout(() => {
    el.classList.remove("flash");
    el.textContent = "Saved on this device";
  }, 1200);
}

function activeField() {
  return state.fields.find((f) => f.id === state.activeFieldId) || null;
}

/* Convert stored [lat,lng] ring to a closed Turf polygon ([lng,lat]). */
function fieldToTurf(field) {
  if (!field || !field.coords || field.coords.length < 3) return null;
  const ring = field.coords.map(([la, ln]) => [ln, la]);
  const first = ring[0], last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push([first[0], first[1]]);
  try { return turf.polygon([ring]); } catch (e) { return null; }
}

function clearDistance() {
  return state.equipment.width / 2 + state.equipment.margin;
}

function fmtDist(m) {
  if (m == null || isNaN(m)) return "-";
  if (Math.abs(m) >= 1000) return (m / 1000).toFixed(2) + " km";
  return m.toFixed(1) + " m";
}
function fmtArea(m2) {
  if (m2 == null) return "-";
  const ha = m2 / 10000;
  if (ha >= 1) return ha.toFixed(2) + " ha (" + Math.round(m2) + " m²)";
  return Math.round(m2) + " m²";
}

/* ----------------------------- Map setup -------------------------------- */
const map = L.map("map", { zoomControl: true, attributionControl: true }).setView([44.8125, 20.4612], 16);

const baseLayers = {
  osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "© OpenStreetMap contributors",
  }),
  sat: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 21, maxNativeZoom: 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
  }),
  topo: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17, attribution: "© OpenTopoMap (CC-BY-SA), © OpenStreetMap contributors",
  }),
};
let currentBase = null;
function setBase(key) {
  if (currentBase) map.removeLayer(currentBase);
  currentBase = baseLayers[key] || baseLayers.osm;
  currentBase.addTo(map);
  state.layers.base = key;
}

let cadLayer = null;
function refreshCadastre() {
  if (cadLayer) { map.removeLayer(cadLayer); cadLayer = null; }
  if (!state.layers.cadEnabled) return;
  try {
    cadLayer = L.tileLayer.wms(state.layers.cadUrl, {
      layers: state.layers.cadLayer,
      format: "image/png",
      transparent: true,
      version: "1.3.0",
      opacity: state.layers.cadOpacity,
      attribution: "Cadastre © RGZ / GeoSrbija",
    });
    cadLayer.on("tileerror", () => toast("Cadastre tiles failed to load. Check URL/layer in Layers tab"));
    cadLayer.addTo(map);
    if (currentBase) currentBase.bringToBack();
  } catch (e) {
    toast("Invalid cadastre WMS settings");
  }
}

/* ----------------------------- Field layers ----------------------------- */
let fieldPoly = null;     // L.polygon of the field
let innerPoly = null;     // safe working zone
let vertexLayer = L.layerGroup().addTo(map);
let drawTempLine = null;

function renderField(fit = false) {
  if (fieldPoly) { map.removeLayer(fieldPoly); fieldPoly = null; }
  if (innerPoly) { map.removeLayer(innerPoly); innerPoly = null; }
  vertexLayer.clearLayers();

  const f = activeField();
  updateFieldUI();
  if (!f || f.coords.length < 2) return;

  // Field polygon (or line if not enough points)
  if (f.coords.length >= 3) {
    fieldPoly = L.polygon(f.coords, {
      color: "#3ddc84", weight: 3, fillColor: "#3ddc84", fillOpacity: 0.08,
    }).addTo(map);

    // Inner safe working zone
    if (state.equipment.showInner) {
      const tp = fieldToTurf(f);
      if (tp) {
        try {
          const inner = turf.buffer(tp, -clearDistance(), { units: "meters" });
          if (inner && inner.geometry && inner.geometry.coordinates.length) {
            const latlngs = turfToLeaflet(inner);
            innerPoly = L.polygon(latlngs, {
              color: "#f1c40f", weight: 1.5, dashArray: "6 5",
              fillColor: "#2ecc71", fillOpacity: 0.12,
            }).addTo(map);
          }
        } catch (e) { /* buffer can fail on tiny/odd polys */ }
      }
    }
  } else {
    fieldPoly = L.polyline(f.coords, { color: "#3ddc84", weight: 3, dashArray: "5 5" }).addTo(map);
  }

  // Vertex handles
  f.coords.forEach(([la, ln], i) => {
    const m = L.circleMarker([la, ln], {
      radius: 6, color: "#fff", weight: 2, fillColor: "#1f9d5b", fillOpacity: 1,
    }).addTo(vertexLayer);
    m.on("click", (ev) => { L.DomEvent.stop(ev); maybeRemoveVertex(i); });
  });

  if (fit && fieldPoly.getBounds && fieldPoly.getBounds().isValid()) {
    map.fitBounds(fieldPoly.getBounds().pad(0.25));
  }
}

function turfToLeaflet(feature) {
  // returns latlng arrays for polygon / multipolygon
  const g = feature.geometry;
  const toLL = (ring) => ring.map(([ln, la]) => [la, ln]);
  if (g.type === "Polygon") return g.coordinates.map(toLL);
  if (g.type === "MultiPolygon") return g.coordinates.map((p) => p.map(toLL));
  return [];
}

function maybeRemoveVertex(i) {
  if (mode !== "idle") return;
  const f = activeField();
  if (!f || f.coords.length <= 0) return;
  if (!confirm("Remove this corner point?")) return;
  f.coords.splice(i, 1);
  saveState();
  renderField();
}

function updateFieldUI() {
  const f = activeField();
  const stats = $("#field-stats");
  if (!f) { stats.innerHTML = "No field selected."; return; }
  let html = `<div><b>${f.coords.length}</b> corner points</div>`;
  const tp = fieldToTurf(f);
  if (tp) {
    const area = turf.area(tp);
    const perim = turf.length(turf.polygonToLine(tp), { units: "meters" });
    html += `<div>Area: <b>${fmtArea(area)}</b></div>`;
    html += `<div>Perimeter: <b>${fmtDist(perim)}</b></div>`;
  }
  stats.innerHTML = html;
}

/* ----------------------------- Field selection -------------------------- */
function rebuildFieldSelect() {
  const sel = $("#field-select");
  sel.innerHTML = "";
  if (!state.fields.length) {
    const o = document.createElement("option");
    o.textContent = "- no fields yet -"; o.value = "";
    sel.appendChild(o);
  }
  state.fields.forEach((f) => {
    const o = document.createElement("option");
    o.value = f.id; o.textContent = f.name || "Untitled field";
    if (f.id === state.activeFieldId) o.selected = true;
    sel.appendChild(o);
  });
  const f = activeField();
  $("#field-name").value = f ? f.name : "";
}

function newField() {
  const f = { id: uid(), name: "Field " + (state.fields.length + 1), coords: [] };
  state.fields.push(f);
  state.activeFieldId = f.id;
  saveState();
  rebuildFieldSelect();
  renderField();
  startDrawing();
  toast("New field - tap the map to add corners");
}

function deleteField() {
  const f = activeField();
  if (!f) return;
  if (!confirm(`Delete field "${f.name}"? This cannot be undone.`)) return;
  state.fields = state.fields.filter((x) => x.id !== f.id);
  state.activeFieldId = state.fields[0] ? state.fields[0].id : null;
  saveState();
  rebuildFieldSelect();
  renderField(true);
}

/* ----------------------------- Drawing mode ----------------------------- */
let mode = "idle"; // idle | draw | walk

function setDrawButtons() {
  $("#btn-draw").classList.toggle("active", mode === "draw");
  $("#btn-finish-draw").disabled = mode !== "draw";
  $("#btn-walk").classList.toggle("active", mode === "walk");
  $("#btn-walk-point").disabled = mode !== "walk";
  $("#btn-walk-finish").disabled = mode !== "walk";
}

function startDrawing() {
  if (!activeField()) newFieldSilent();
  mode = "draw";
  setDrawButtons();
  map.getContainer().style.cursor = "crosshair";
  toast("Drawing: tap corners, then Finish");
}
function newFieldSilent() {
  const f = { id: uid(), name: "Field " + (state.fields.length + 1), coords: [] };
  state.fields.push(f); state.activeFieldId = f.id;
  rebuildFieldSelect();
}
function finishDrawing() {
  mode = "idle";
  setDrawButtons();
  map.getContainer().style.cursor = "";
  const f = activeField();
  if (f && f.coords.length < 3) toast("Add at least 3 corners to form a field");
  else toast("Field saved");
  saveState();
  renderField(true);
}

map.on("click", (e) => {
  if (mode === "draw") {
    const f = activeField();
    f.coords.push([e.latlng.lat, e.latlng.lng]);
    saveState();
    renderField();
  } else if (testMode) {
    setSimulated(e.latlng.lat, e.latlng.lng);
  }
});

function undoPoint() {
  const f = activeField();
  if (!f || !f.coords.length) return;
  f.coords.pop();
  saveState();
  renderField();
}

/* ----------------------------- Walk mode -------------------------------- */
let walkAutoTimer = null;
function startWalk() {
  if (!navigator.geolocation) return toast("Geolocation not available on this device");
  if (!activeField()) newFieldSilent();
  mode = "walk";
  setDrawButtons();
  toast("Walk mode - drive the perimeter and drop points");
  ensureWatch();
  if ($("#walk-auto").checked) {
    const sec = Math.max(1, parseInt($("#walk-auto-sec").value) || 5);
    walkAutoTimer = setInterval(dropWalkPoint, sec * 1000);
  }
}
function dropWalkPoint() {
  if (!lastPos) return toast("Waiting for GPS fix...");
  const f = activeField();
  f.coords.push([lastPos.lat, lastPos.lng]);
  saveState();
  renderField();
  if (state.alerts.vibrate && navigator.vibrate) navigator.vibrate(40);
}
function finishWalk() {
  mode = "idle";
  setDrawButtons();
  clearInterval(walkAutoTimer); walkAutoTimer = null;
  if (!tracking) stopWatch();
  saveState();
  renderField(true);
  toast("Field boundary recorded");
}

/* ----------------------------- Coordinates ------------------------------ */
function applyCoords() {
  const text = $("#coords-input").value.trim();
  if (!text) return toast("Paste some coordinates first");
  const pts = [];
  for (const line of text.split(/\n+/)) {
    const m = line.match(/(-?\d+(?:\.\d+)?)\s*[,; \t]\s*(-?\d+(?:\.\d+)?)/);
    if (m) pts.push([parseFloat(m[1]), parseFloat(m[2])]);
  }
  if (pts.length < 3) return toast("Need at least 3 valid 'lat, lng' lines");
  if (!activeField()) newFieldSilent();
  activeField().coords = pts;
  saveState();
  rebuildFieldSelect();
  renderField(true);
  toast(`Applied ${pts.length} points`);
}
function copyCoords() {
  const f = activeField();
  if (!f || !f.coords.length) return toast("No field to copy");
  const text = f.coords.map(([la, ln]) => `${la.toFixed(6)}, ${ln.toFixed(6)}`).join("\n");
  $("#coords-input").value = text;
  navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {});
  toast("Coordinates copied to the box");
}

/* ----------------------------- Equipment calc ----------------------------- */
function updateEquipmentCalc() {
  const w = parseFloat($("#equipment-width").value) || 0;
  const m = parseFloat($("#equipment-margin").value) || 0;
  $("#calc-half").textContent = (w / 2).toFixed(2) + " m";
  $("#calc-clear").textContent = (w / 2 + m).toFixed(2) + " m";
}
function applyEquipment() {
  state.equipment.width = Math.max(0.1, parseFloat($("#equipment-width").value) || 3);
  state.equipment.margin = Math.max(0, parseFloat($("#equipment-margin").value) || 0);
  state.equipment.showInner = $("#show-inner").checked;
  saveState();
  renderField();
  toast("Equipment settings applied");
}

/* ----------------------------- Tracking --------------------------------- */
let watchId = null;
let lastPos = null;        // { lat, lng, acc, speed, heading, t }
let prevPos = null;
let tracking = false;
let testMode = false;
let simulated = null;
let posMarker = null;
let accCircle = null;
let wakeLock = null;
let alertTimer = null;

function ensureWatch() {
  if (watchId != null || testMode) return;
  if (!navigator.geolocation) { toast("Geolocation not supported"); return; }
  watchId = navigator.geolocation.watchPosition(onPos, onPosErr, {
    enableHighAccuracy: true, maximumAge: 1000, timeout: 15000,
  });
}
function stopWatch() {
  if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
}
function onPosErr(err) {
  toast("GPS error: " + err.message);
}
function onPos(p) {
  const c = p.coords;
  pushPosition({
    lat: c.latitude, lng: c.longitude, acc: c.accuracy,
    speed: c.speed, heading: c.heading, t: p.timestamp,
  });
}
function setSimulated(lat, lng) {
  let heading = null, speed = null;
  if (simulated) {
    heading = bearing(simulated.lat, simulated.lng, lat, lng);
  }
  simulated = { lat, lng, acc: 3, speed, heading, t: Date.now() };
  pushPosition(simulated);
}

function pushPosition(pos) {
  prevPos = lastPos;
  // Derive heading from movement if device didn't supply it
  if ((pos.heading == null || isNaN(pos.heading)) && prevPos) {
    const d = haversine(prevPos.lat, prevPos.lng, pos.lat, pos.lng);
    if (d > 1) pos.heading = bearing(prevPos.lat, prevPos.lng, pos.lat, pos.lng);
  }
  lastPos = pos;
  renderPosition();
  if (tracking) evaluateBorder();
}

function renderPosition() {
  if (!lastPos) return;
  const ll = [lastPos.lat, lastPos.lng];
  const headingDeg = (lastPos.heading != null && !isNaN(lastPos.heading)) ? lastPos.heading : 0;

  if (!posMarker) {
    posMarker = L.marker(ll, { icon: equipmentIcon(headingDeg), zIndexOffset: 1000 }).addTo(map);
  } else {
    posMarker.setLatLng(ll);
    posMarker.setIcon(equipmentIcon(headingDeg));
  }
  if (!accCircle) {
    accCircle = L.circle(ll, { radius: lastPos.acc || 5, color: "#3ddc84", weight: 1, fillOpacity: 0.08 }).addTo(map);
  } else {
    accCircle.setLatLng(ll);
    accCircle.setRadius(lastPos.acc || 5);
  }

  $("#live-acc").textContent = lastPos.acc ? "±" + Math.round(lastPos.acc) + " m" : "-";
  const sp = lastPos.speed;
  $("#live-speed").textContent = (sp != null && !isNaN(sp)) ? (sp * 3.6).toFixed(1) + " km/h" : "-";
}

function equipmentIcon(deg) {
  return L.divIcon({
    className: "equipment-marker",
    html: `<div style="transform:rotate(${deg}deg);width:30px;height:30px;">
      <svg viewBox="0 0 24 24" width="30" height="30">
        <circle cx="12" cy="12" r="9" fill="#1f9d5b" stroke="#fff" stroke-width="2"/>
        <path d="M12 4 L16 14 L12 11.5 L8 14 Z" fill="#fff"/>
      </svg></div>`,
    iconSize: [30, 30], iconAnchor: [15, 15],
  });
}

/* Core evaluation: where are we relative to the border? */
function evaluateBorder() {
  const f = activeField();
  const tp = fieldToTurf(f);
  if (!tp || !lastPos) { setStatus("idle", "No field", "Define a field first", "-"); return; }

  const pt = turf.point([lastPos.lng, lastPos.lat]);
  const inside = turf.booleanPointInPolygon(pt, tp);
  let dist;
  try {
    const line = turf.polygonToLine(tp);
    const lines = line.type === "FeatureCollection" ? line.features : [line];
    dist = Math.min(...lines.map((ln) => turf.pointToLineDistance(pt, ln, { units: "meters" })));
  } catch (e) { dist = null; }

  const halfW = state.equipment.width / 2;
  const clear = clearDistance();

  $("#live-dist").textContent = fmtDist(dist);
  // Clearance of the implement edge from the border (negative = crossing)
  const edgeClear = inside ? (dist - halfW) : -(dist + halfW);

  let st, title, sub;
  if (!inside) {
    st = "danger"; title = "OUTSIDE YOUR FIELD";
    sub = `You are ${fmtDist(dist)} past the border`;
  } else if (dist <= halfW) {
    st = "danger"; title = "IMPLEMENT CROSSING BORDER";
    sub = `Edge is ${fmtDist(Math.abs(edgeClear))} over the line - steer back`;
  } else if (dist <= clear) {
    st = "warn"; title = "APPROACHING BORDER";
    sub = `${fmtDist(edgeClear)} of clearance left - slow down`;
  } else {
    st = "ok"; title = "INSIDE FIELD";
    sub = `${fmtDist(edgeClear)} of safe working room`;
  }

  $("#live-status").textContent = title;
  setStatus(st, title, sub, fmtDist(dist));
  handleAlerts(st);
}

function setStatus(stateName, title, sub, dist) {
  const b = $("#status-banner");
  b.classList.remove("hidden");
  b.dataset.state = stateName;
  $("#status-title").textContent = title;
  $("#status-sub").textContent = sub;
  $("#status-dist").textContent = dist;
  const icons = { ok: "✓", warn: "⚠", danger: "⛔", idle: "●" };
  $("#status-icon").textContent = icons[stateName] || "●";
}

/* ----------------------------- Alerts ----------------------------------- */
let audioCtx = null;
function beep(freq, dur) {
  if (!state.alerts.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = freq; o.type = "square";
    g.gain.value = 0.12;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
  } catch (e) { /* ignore */ }
}

let lastAlertState = "ok";
function handleAlerts(st) {
  if (st === lastAlertState && alertTimer) return; // already alerting at right cadence
  lastAlertState = st;
  clearInterval(alertTimer); alertTimer = null;

  if (st === "danger") {
    fireAlert("danger");
    alertTimer = setInterval(() => fireAlert("danger"), 900);
  } else if (st === "warn") {
    fireAlert("warn");
    alertTimer = setInterval(() => fireAlert("warn"), 2400);
  }
}
function fireAlert(kind) {
  if (kind === "danger") {
    beep(880, 0.18); setTimeout(() => beep(880, 0.18), 230);
    if (state.alerts.vibrate && navigator.vibrate) navigator.vibrate([120, 60, 120]);
  } else {
    beep(560, 0.16);
    if (state.alerts.vibrate && navigator.vibrate) navigator.vibrate(80);
  }
}

/* ----------------------------- Track on/off ----------------------------- */
async function toggleTracking() {
  if (tracking) {
    tracking = false;
    $("#btn-track").textContent = "▶ Start tracking";
    $("#btn-track").classList.remove("active");
    clearInterval(alertTimer); alertTimer = null;
    if (!testMode && mode !== "walk") stopWatch();
    releaseWake();
    setStatus("idle", "Tracking stopped", "Tap start to resume", "-");
    return;
  }
  if (!activeField() || activeField().coords.length < 3) {
    toast("Define a field with at least 3 corners first");
    switchTab("field");
    return;
  }
  // Unlock audio on user gesture
  try { 
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); 
    if (audioCtx.state === "suspended") audioCtx.resume(); 
  } catch (e) {}
  tracking = true;
  $("#btn-track").textContent = "■ Stop tracking";
  $("#btn-track").classList.add("active");
  if (!testMode) ensureWatch();
  if (state.alerts.keepAwake) requestWake();
  setStatus("idle", "Acquiring GPS...", "Hold tight", "-");
  if (lastPos) evaluateBorder();
}

async function requestWake() {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => {});
    }
  } catch (e) { /* ignore */ }
}
function releaseWake() { if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } }
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && tracking && state.alerts.keepAwake) requestWake();
});

function enableTestMode() {
  testMode = !testMode;
  $("#btn-testmode").classList.toggle("active", testMode);
  $("#btn-testmode").textContent = testMode ? "Disable test mode" : "Enable test mode";
  if (testMode) {
    stopWatch();
    toast("Test mode: tap the map to move the equipment");
  } else {
    simulated = null;
    if (tracking || mode === "walk") ensureWatch();
    toast("Test mode off");
  }
}

/* ----------------------------- Geo math --------------------------------- */
function haversine(la1, ln1, la2, ln2) {
  const R = 6371000, toR = Math.PI / 180;
  const dLa = (la2 - la1) * toR, dLn = (ln2 - ln1) * toR;
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * toR) * Math.cos(la2 * toR) * Math.sin(dLn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function bearing(la1, ln1, la2, ln2) {
  const toR = Math.PI / 180, toD = 180 / Math.PI;
  const y = Math.sin((ln2 - ln1) * toR) * Math.cos(la2 * toR);
  const x = Math.cos(la1 * toR) * Math.sin(la2 * toR) - Math.sin(la1 * toR) * Math.cos(la2 * toR) * Math.cos((ln2 - ln1) * toR);
  return (Math.atan2(y, x) * toD + 360) % 360;
}

/* ----------------------------- Locate me -------------------------------- */
function locateMe() {
  if (testMode && lastPos) { map.setView([lastPos.lat, lastPos.lng], 18); return; }
  if (!navigator.geolocation) return toast("Geolocation not supported");
  toast("Locating...");
  navigator.geolocation.getCurrentPosition(
    (p) => {
      pushPosition({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy, speed: p.coords.speed, heading: p.coords.heading, t: p.timestamp });
      map.setView([p.coords.latitude, p.coords.longitude], 18);
    },
    (e) => toast("Could not get location: " + e.message),
    { enableHighAccuracy: true, timeout: 15000 }
  );
}

/* ----------------------------- Import / export -------------------------- */
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "BoundaryIQ-data.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function importData(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      state = deepMerge(structuredClone(DEFAULT_STATE), data);
      saveState();
      hydrateUI();
      toast("Data imported");
    } catch (e) { toast("Invalid file"); }
  };
  r.readAsText(file);
}
function resetAll() {
  if (!confirm("Delete ALL fields and settings on this device?")) return;
  state = structuredClone(DEFAULT_STATE);
  saveState();
  hydrateUI();
  toast("Everything reset");
}

/* ----------------------------- UI wiring -------------------------------- */
function switchTab(name) {
  $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  $$(".tab-pane").forEach((p) => p.classList.toggle("active", p.dataset.pane === name));
}

function hydrateUI() {
  // Equipment
  $("#equipment-width").value = state.equipment.width;
  $("#equipment-margin").value = state.equipment.margin;
  $("#show-inner").checked = state.equipment.showInner;
  updateEquipmentCalc();
  // Layers
  $("#base-select").value = state.layers.base;
  $("#cad-enabled").checked = state.layers.cadEnabled;
  $("#cad-preset").value = state.layers.cadPreset;
  $("#cad-url").value = state.layers.cadUrl;
  $("#cad-layer").value = state.layers.cadLayer;
  $("#cad-opacity").value = state.layers.cadOpacity;
  // Alerts
  $("#alert-sound").checked = state.alerts.sound;
  $("#alert-vibrate").checked = state.alerts.vibrate;
  $("#alert-keepawake").checked = state.alerts.keepAwake;
  // Map
  setBase(state.layers.base);
  refreshCadastre();
  rebuildFieldSelect();
  renderField(true);
}

function wireEvents() {
  // Tabs
  $$(".tab").forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.tab)));

  // Panel toggle / locate
  $("#btn-toggle-panel").addEventListener("click", () => {
    $("#panel").classList.toggle("collapsed");
    document.body.classList.toggle("panel-hidden", $("#panel").classList.contains("collapsed"));
    setTimeout(() => map.invalidateSize(), 250);
  });
  $("#btn-locate").addEventListener("click", locateMe);

  // Field tab
  $("#field-select").addEventListener("change", (e) => {
    state.activeFieldId = e.target.value || null;
    saveState(); rebuildFieldSelect(); renderField(true);
  });
  $("#btn-new-field").addEventListener("click", newField);
  $("#btn-del-field").addEventListener("click", deleteField);
  $("#field-name").addEventListener("input", (e) => {
    const f = activeField(); if (!f) return;
    f.name = e.target.value; saveState();
    const opt = $("#field-select").selectedOptions[0]; if (opt) opt.textContent = f.name || "Untitled field";
  });
  $("#btn-draw").addEventListener("click", () => (mode === "draw" ? finishDrawing() : startDrawing()));
  $("#btn-finish-draw").addEventListener("click", finishDrawing);
  $("#btn-undo-pt").addEventListener("click", undoPoint);
  $("#btn-walk").addEventListener("click", () => (mode === "walk" ? finishWalk() : startWalk()));
  $("#btn-walk-point").addEventListener("click", dropWalkPoint);
  $("#btn-walk-finish").addEventListener("click", finishWalk);
  $("#btn-apply-coords").addEventListener("click", applyCoords);
  $("#btn-copy-coords").addEventListener("click", copyCoords);

  // Equipment tab
  $("#equipment-width").addEventListener("input", updateEquipmentCalc);
  $("#equipment-margin").addEventListener("input", updateEquipmentCalc);
  $("#btn-apply-equipment").addEventListener("click", applyEquipment);

  // Track tab
  $("#btn-track").addEventListener("click", toggleTracking);
  $("#btn-testmode").addEventListener("click", enableTestMode);
  $("#alert-sound").addEventListener("change", (e) => { state.alerts.sound = e.target.checked; saveState(); });
  $("#alert-vibrate").addEventListener("change", (e) => { state.alerts.vibrate = e.target.checked; saveState(); });
  $("#alert-keepawake").addEventListener("change", (e) => {
    state.alerts.keepAwake = e.target.checked; saveState();
    if (e.target.checked && tracking) requestWake(); else releaseWake();
  });

  // Layers tab
  $("#base-select").addEventListener("change", (e) => { setBase(e.target.value); saveState(); });
  $("#cad-preset").addEventListener("change", (e) => {
    if (e.target.value === "geosrbija") {
      $("#cad-url").value = "https://inspire.geosrbija.rs/wms/cp";
      $("#cad-layer").value = "CP.CadastralParcel";
    }
    state.layers.cadPreset = e.target.value;
  });
  $("#btn-apply-cad").addEventListener("click", () => {
    state.layers.cadEnabled = $("#cad-enabled").checked;
    state.layers.cadUrl = $("#cad-url").value.trim();
    state.layers.cadLayer = $("#cad-layer").value.trim();
    state.layers.cadOpacity = parseFloat($("#cad-opacity").value);
    saveState(); refreshCadastre();
    toast(state.layers.cadEnabled ? "Cadastre overlay on" : "Cadastre overlay off");
  });
  $("#cad-opacity").addEventListener("input", (e) => { if (cadLayer) cadLayer.setOpacity(parseFloat(e.target.value)); });

  // Data
  $("#btn-export").addEventListener("click", exportData);
  $("#btn-import").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", (e) => { if (e.target.files[0]) importData(e.target.files[0]); });
  $("#btn-reset").addEventListener("click", resetAll);
}

/* ----------------------------- Boot ------------------------------------- */
// Fix default Leaflet marker image paths for the vendored copy
L.Icon.Default.prototype.options.imagePath = "vendor/images/";

wireEvents();
hydrateUI();
setDrawButtons();

// Register service worker for offline app shell (only over http/https)
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

// First-run hint
if (!state.fields.length) {
  setTimeout(() => toast("Welcome! Open the Field tab and add your first field.", 4000), 600);
}
