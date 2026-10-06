"use strict";

/* Semester boundaries for the winter term 2026/2027 (used by the schedule progress bar) */
const SEMESTER_START = new Date(2026, 8, 14);            // 14.09.2026
const SEMESTER_END = new Date(2027, 1, 13, 23, 59, 59);  // 13.02.2027

document.documentElement.classList.remove("no-js");

/* =========================================================
   Navigation - hamburger menu
   ========================================================= */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.tagName === "A" && window.innerWidth <= 768) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });
}

/* =========================================================
   Workspace - hotspot HTML is generated from this array.
   JS only builds the markup; hover, focus and the mobile
   panel switching are handled purely by CSS (see styles.css).
   anchorX: which side of the hotspot the panel is aligned to.
   anchorY: panel placed below, above or inside the hotspot.
   ========================================================= */
const WORKSPACE_HOTSPOTS = [
  {
    id: "new-order",
    left: 45.5, top: 15.42, width: 11.25, height: 7.08,
    anchorX: "left", anchorY: "below",
    title: "Nová objednávka",
    text: "Novú rezerváciu zaevidujem jedným klikom, presne ako v reálnom PMS na recepcii."
  },
  {
    id: "order-list",
    left: 10.75, top: 25, width: 46.75, height: 64.58,
    anchorX: "left", anchorY: "inside",
    title: "Zoznam objednávok",
    text: "Prehľad všetkých rezervácií a ich stavu — potvrdené, čakajúce aj zrušené."
  },
  {
    id: "sales-stats",
    left: 60, top: 13.75, width: 37.5, height: 29.17,
    anchorX: "right", anchorY: "below",
    title: "Štatistiky predaja",
    text: "Vývoj predaja za vybrané obdobie viem prehľadne zobraziť v grafe."
  },
  {
    id: "order-detail",
    left: 60, top: 46.25, width: 37.5, height: 20.42,
    anchorX: "right", anchorY: "below",
    title: "Detail objednávky",
    text: "Ku každej objednávke dohľadám klienta a rýchlo mu zavolám alebo napíšem."
  },
  {
    id: "ui-language",
    left: 60, top: 70, width: 17.25, height: 19.58,
    anchorX: "left", anchorY: "above",
    title: "Jazyk rozhrania",
    text: "Rozhranie prepínam medzi slovenčinou a angličtinou podľa potreby klienta."
  },
  {
    id: "stats-export",
    left: 79.25, top: 70, width: 18.25, height: 19.58,
    anchorX: "right", anchorY: "above",
    title: "Export štatistík",
    text: "Prehľad predaja sa dá jedným klikom stiahnuť a poslať ďalej."
  }
];

function setPanelPosition(panel, spot) {
  const gap = 1; // percent of the image size
  if (spot.anchorY === "inside") {
    panel.style.setProperty("--panel-left", (spot.left + 3) + "%");
    panel.style.setProperty("--panel-top", (spot.top + 2) + "%");
    return;
  }
  if (spot.anchorX === "right") {
    panel.style.setProperty("--panel-right", (100 - spot.left - spot.width) + "%");
  } else {
    panel.style.setProperty("--panel-left", spot.left + "%");
  }
  if (spot.anchorY === "above") {
    panel.style.setProperty("--panel-bottom", (100 - spot.top + gap) + "%");
  } else {
    panel.style.setProperty("--panel-top", (spot.top + spot.height + gap) + "%");
  }
}

function initWorkspace() {
  const figure = document.querySelector(".workspace-figure");
  if (!figure) return;

  WORKSPACE_HOTSPOTS.forEach((spot, index) => {
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "workspace-hotspot";
    radio.className = "hotspot";
    radio.id = "hotspot-" + spot.id;
    radio.style.left = spot.left + "%";
    radio.style.top = spot.top + "%";
    radio.style.width = spot.width + "%";
    radio.style.height = spot.height + "%";
    radio.setAttribute("aria-label", spot.title);
    radio.setAttribute("aria-describedby", "panel-" + spot.id);
    /* the first hotspot is selected by default, so the mobile panel is never empty */
    radio.checked = index === 0;

    const panel = document.createElement("div");
    panel.className = "hotspot-panel";
    panel.id = "panel-" + spot.id;
    const heading = document.createElement("h3");
    heading.textContent = spot.title;
    const paragraph = document.createElement("p");
    paragraph.textContent = spot.text;
    panel.append(heading, paragraph);
    setPanelPosition(panel, spot);

    /* the panel must directly follow its radio (CSS uses the + selector) */
    figure.append(radio, panel);
  });
}

/* =========================================================
   Schedule - current lesson, filter, semester progress
   ========================================================= */
const DAY_CODES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const WEEK_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = {
  mon: "v pondelok",
  tue: "v utorok",
  wed: "v stredu",
  thu: "vo štvrtok",
  fri: "v piatok",
  sat: "v sobotu",
  sun: "v nedeľu"
};

function initSchedule() {
  const table = document.querySelector(".schedule-table");
  if (!table) return;

  const cells = Array.from(table.querySelectorAll("td[data-day]"));
  const banner = document.querySelector(".status-banner");

  function toMinutes(hhmm) {
    const [hours, minutes] = hhmm.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function highlightCurrent() {
    const now = new Date();
    const dayCode = DAY_CODES[now.getDay()];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const currentCells = [];

    cells.forEach((cell) => {
      cell.classList.remove("cell-current");
      const start = toMinutes(cell.dataset.start);
      const end = toMinutes(cell.dataset.end);
      if (cell.dataset.day === dayCode && nowMinutes >= start && nowMinutes < end) {
        cell.classList.add("cell-current");
        currentCells.push(cell);
      }
    });

    if (!banner) return;

    if (currentCells.length > 0) {
      const names = Array.from(new Set(currentCells.map((cell) => {
        const course = cell.querySelector(".cell-course");
        return course ? course.textContent : "výučba";
      })));
      banner.textContent = "Práve prebieha: " + names.join(", ") + ".";
      return;
    }

    /* find the nearest lesson (this week or next week) */
    const todayIndex = WEEK_ORDER.indexOf(dayCode);
    let best = null;
    let bestOffset = Infinity;

    cells.forEach((cell) => {
      let offsetDays = WEEK_ORDER.indexOf(cell.dataset.day) - todayIndex;
      if (offsetDays < 0) offsetDays += 7;
      const start = toMinutes(cell.dataset.start);
      let offsetMinutes = offsetDays * 1440 + start;
      if (offsetDays === 0 && start <= nowMinutes) {
        offsetMinutes += 7 * 1440;
      }
      if (offsetMinutes < bestOffset) {
        bestOffset = offsetMinutes;
        best = cell;
      }
    });

    if (best) {
      const course = best.querySelector(".cell-course");
      banner.textContent = "Teraz nemám výučbu. Najbližšia hodina: " +
        DAY_LABELS[best.dataset.day] + " o " + best.dataset.start.replace(/^0/, "") +
        " – " + (course ? course.textContent : "") + ".";
    } else {
      banner.textContent = "Tento týždeň už nemám žiadnu naplánovanú výučbu.";
    }
  }

  highlightCurrent();
  setInterval(highlightCurrent, 60 * 1000);

  /* filter: all / lectures / seminars */
  const buttons = Array.from(document.querySelectorAll(".filter-btn"));
  const emptyMsg = document.querySelector(".filter-empty-msg");

  function applyFilter(type) {
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === type));
    });
    let visibleCount = 0;
    cells.forEach((cell) => {
      const matches = type === "all" || cell.dataset.type === type;
      cell.classList.toggle("filtered-out", !matches);
      if (matches && type !== "all") visibleCount++;
    });
    if (emptyMsg) {
      emptyMsg.hidden = !(type !== "all" && visibleCount === 0);
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
  });
  applyFilter("all");

  /* semester progress */
  const fill = document.querySelector(".progress-fill");
  const label = document.querySelector(".progress-label");
  if (fill && label) {
    const now = new Date();
    const total = SEMESTER_END - SEMESTER_START;
    const elapsed = now - SEMESTER_START;
    const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    fill.style.width = percent.toFixed(1) + "%";
    fill.parentElement.setAttribute("aria-valuenow", percent.toFixed(0));
    if (now < SEMESTER_START) {
      label.textContent = "Semester ešte nezačal.";
    } else if (now > SEMESTER_END) {
      label.textContent = "Semester už skončil.";
    } else {
      label.textContent = "Uplynulo " + percent.toFixed(0) + " % semestra.";
    }
  }
}

/* =========================================================
   Map - Leaflet, Haversine formula, localStorage
   ========================================================= */
const MAP_POINTS_KEY = "card-map-points";

const FIXED_PLACES = {
  school: { name: "STU FEI (Ilkovičova 3, Bratislava)", lat: 48.1531, lng: 17.0722 },
  home: { name: "Domov – Karlova Ves, Bratislava", lat: 48.1611, lng: 17.0664 }
};

const ADD_BUTTON_LABEL = "Pridať bod kliknutím na mapu";
const ADD_BUTTON_ACTIVE_LABEL = "Kliknite na mapu pre umiestnenie bodu…";
const DEFAULT_POINT_NAME = "Nový bod";

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function loadPoints() {
  try {
    const raw = localStorage.getItem(MAP_POINTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function savePoints(points) {
  try {
    localStorage.setItem(MAP_POINTS_KEY, JSON.stringify(points));
  } catch (error) {
    /* storage unavailable - points are simply not remembered */
  }
}

function getAccentColor() {
  return getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
}

function buildPointPopup(point) {
  const box = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = point.name;
  box.appendChild(title);
  [["Do školy", FIXED_PLACES.school], ["Domov", FIXED_PLACES.home]].forEach(([label, place]) => {
    const line = document.createElement("div");
    const km = haversineDistanceKm(point.lat, point.lng, place.lat, place.lng);
    line.textContent = label + ": " + km.toFixed(2) + " km";
    box.appendChild(line);
  });
  return box;
}

function initMap() {
  const mapEl = document.getElementById("map-canvas");
  if (!mapEl || typeof L === "undefined") return;

  const map = L.map(mapEl).setView([48.151965, 17.072995], 15);

  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: "Tiles &copy; <a href=\"https://www.esri.com/\">Esri</a> &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
  }).addTo(map);

  const schoolIcon = L.divIcon({ className: "map-emoji-icon", html: "🎓", iconSize: [28, 28] });
  const homeIcon = L.divIcon({ className: "map-emoji-icon", html: "🏠", iconSize: [28, 28] });

  L.marker([FIXED_PLACES.school.lat, FIXED_PLACES.school.lng], { icon: schoolIcon })
    .addTo(map)
    .bindPopup(FIXED_PLACES.school.name);
  L.marker([FIXED_PLACES.home.lat, FIXED_PLACES.home.lng], { icon: homeIcon })
    .addTo(map)
    .bindPopup(FIXED_PLACES.home.name);

  let points = loadPoints();
  let markers = {};
  let activeLine = null;
  let activePointId = null;
  let addMode = false;

  const listEl = document.querySelector(".point-list");
  const emptyStateEl = document.querySelector(".map-empty-state");
  const nameInput = document.querySelector("#point-name");
  const addToggle = document.querySelector("#add-point-toggle");
  const addCenterButton = document.querySelector("#add-center-point");
  const distanceReadout = document.querySelector(".distance-readout");

  function clearActiveLine() {
    if (activeLine) map.removeLayer(activeLine);
    activeLine = null;
    activePointId = null;
    distanceReadout.hidden = true;
  }

  function setAddMode(on) {
    addMode = on;
    addToggle.setAttribute("aria-pressed", String(on));
    mapEl.style.cursor = on ? "crosshair" : "";
    addToggle.textContent = on ? ADD_BUTTON_ACTIVE_LABEL : ADD_BUTTON_LABEL;
  }

  function createActionButton(text, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-secondary";
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
  }

  function render() {
    listEl.innerHTML = "";
    Object.values(markers).forEach((marker) => map.removeLayer(marker));
    markers = {};

    if (points.length === 0) {
      emptyStateEl.hidden = false;
      listEl.hidden = true;
      return;
    }

    emptyStateEl.hidden = true;
    listEl.hidden = false;

    points.forEach((point) => {
      markers[point.id] = L.marker([point.lat, point.lng])
        .addTo(map)
        .bindPopup(buildPointPopup(point));

      const item = document.createElement("li");
      const label = document.createElement("strong");
      label.textContent = point.name;

      const actions = document.createElement("div");
      actions.className = "point-actions";
      actions.append(
        createActionButton("Vzdialenosť do školy", () => showDistance(point, FIXED_PLACES.school)),
        createActionButton("Vzdialenosť domov", () => showDistance(point, FIXED_PLACES.home))
      );

      const remove = createActionButton("Odstrániť", () => {
        points = points.filter((savedPoint) => savedPoint.id !== point.id);
        savePoints(points);
        if (activePointId === point.id) clearActiveLine();
        render();
      });
      remove.setAttribute("aria-label", "Odstrániť bod " + point.name);
      actions.appendChild(remove);

      item.append(label, actions);
      listEl.appendChild(item);
    });
  }

  function showDistance(point, place) {
    if (activeLine) map.removeLayer(activeLine);
    const distanceKm = haversineDistanceKm(point.lat, point.lng, place.lat, place.lng);
    const distanceText = distanceKm.toFixed(2) + " km";
    activePointId = point.id;
    activeLine = L.polyline(
      [[point.lat, point.lng], [place.lat, place.lng]],
      { color: getAccentColor(), weight: 4, dashArray: "2 10" }
    ).addTo(map);
    activeLine.bindTooltip(distanceText, { permanent: true, direction: "center" });
    distanceReadout.hidden = false;
    distanceReadout.textContent =
      point.name + " → " + place.name + ": " + distanceText + " (Haversinov vzorec)";
    map.fitBounds(activeLine.getBounds(), { padding: [40, 40] });
    if (markers[point.id]) markers[point.id].openPopup();
  }

  function addPoint(latlng) {
    const point = {
      id: "p" + Date.now(),
      name: nameInput.value.trim() || DEFAULT_POINT_NAME,
      lat: latlng.lat,
      lng: latlng.lng
    };
    points.push(point);
    savePoints(points);
    render();
    nameInput.value = "";
  }

  if (addToggle) {
    addToggle.addEventListener("click", () => setAddMode(!addMode));
  }

  /* keyboard-friendly alternative: place the point in the map center */
  if (addCenterButton) {
    addCenterButton.addEventListener("click", () => {
      addPoint(map.getCenter());
      if (addMode) setAddMode(false);
    });
  }

  map.on("click", (event) => {
    if (!addMode) return;
    addPoint(event.latlng);
    setAddMode(false);
  });

  render();
  window.addEventListener("resize", () => map.invalidateSize());
  requestAnimationFrame(() => map.invalidateSize());
}

/* =========================================================
   Build info
   ========================================================= */
const BUILD_INFO = "R2VuZXJhdGVkIGJ5IEFJIC0gQ2xhdWRlIChBbnRocm9waWMp";

function initBuildInfo() {
  try {
    console.log(atob(BUILD_INFO));
  } catch (error) {
    /* ignore */
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initWorkspace();
  initSchedule();
  initMap();
  initBuildInfo();
});
