/**
 * AI-Based Road Condition Monitoring System
 * Page 3: Damage Map (Geospatial View & Interactive Pins)
 */

window.RoadMap = {
  mapInstance: null,
  markers: [],
  selectedIncident: null,
  activeSeverityFilter: 'all',
  activeDistrictFilter: 'all',
  useLeaflet: false,

  init() {
    this.bindEvents();
    this.initMapEngine();
  },

  bindEvents() {
    // Severity buttons on map toolbar
    document.querySelectorAll('.map-legend-pills .legend-item').forEach(item => {
      item.addEventListener('click', () => {
        const sev = item.dataset.sev || 'all';
        this.activeSeverityFilter = sev;
        this.refreshPins();
      });
    });

    // District select
    const districtSelect = document.getElementById('map-district-select');
    if (districtSelect) {
      districtSelect.addEventListener('change', (e) => {
        this.activeDistrictFilter = e.target.value;
        this.refreshPins();
      });
    }

    // Modal mark repaired button
    const markRepairedBtn = document.getElementById('map-modal-mark-repaired');
    if (markRepairedBtn) {
      markRepairedBtn.addEventListener('click', () => {
        if (this.selectedIncident) {
          window.RoadAIState.markAsRepaired(this.selectedIncident.id);
          this.closePopupModal();
        }
      });
    }
  },

  initMapEngine() {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer) return;

    // Check if Leaflet L is available globally
    if (typeof L !== 'undefined') {
      try {
        this.mapInstance = L.map('leaflet-map', {
          center: [30.2672, -97.7431],
          zoom: 13,
          zoomControl: true,
          attributionControl: false
        });

        // Add sleek CartoDB Voyager or Positron tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd'
        }).addTo(this.mapInstance);

        this.useLeaflet = true;
        this.renderLeafletPins();
        return;
      } catch (err) {
        console.warn('Leaflet tile initialization fallback to custom GIS canvas:', err);
      }
    }

    // Fallback: Custom High-Performance Interactive GIS Vector Canvas
    this.renderCustomVectorGIS();
  },

  resizeMap() {
    if (this.useLeaflet && this.mapInstance) {
      this.mapInstance.invalidateSize();
    } else {
      this.renderCustomVectorGIS();
    }
  },

  refreshPins() {
    if (this.useLeaflet && this.mapInstance) {
      this.renderLeafletPins();
    } else {
      this.renderCustomVectorGIS();
    }
  },

  getFilteredIncidents() {
    let list = window.RoadAIState.damageIncidents;

    if (this.activeSeverityFilter !== 'all') {
      list = list.filter(x => {
        if (this.activeSeverityFilter === 'green') return x.status === 'repaired' || x.severity === 'low';
        if (this.activeSeverityFilter === 'red') return x.severity === 'high' && x.status !== 'repaired';
        if (this.activeSeverityFilter === 'yellow') return x.severity === 'medium' && x.status !== 'repaired';
        return true;
      });
    }

    if (this.activeDistrictFilter !== 'all') {
      list = list.filter(x => x.district === this.activeDistrictFilter);
    }

    return list;
  },

  renderLeafletPins() {
    // Clear old markers
    this.markers.forEach(m => this.mapInstance.removeLayer(m));
    this.markers = [];

    const items = this.getFilteredIncidents();

    items.forEach(item => {
      let pinColor = 'yellow';
      if (item.status === 'repaired') {
        pinColor = 'green';
      } else if (item.severity === 'high') {
        pinColor = 'red';
      } else if (item.severity === 'low') {
        pinColor = 'green';
      }

      // Custom HTML Pin Marker
      const pinIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div class="pin-bubble ${pinColor}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([item.lat, item.lng], { icon: pinIcon }).addTo(this.mapInstance);

      marker.on('click', () => {
        this.openPopupModal(item);
      });

      this.markers.push(marker);
    });

    // Update HUD counter
    const hudCount = document.getElementById('map-hud-count');
    if (hudCount) hudCount.textContent = items.length;
  },

  // Interactive GIS Vector Map Canvas (Self-contained, works offline & fast)
  renderCustomVectorGIS() {
    const container = document.getElementById('leaflet-map');
    if (!container) return;

    container.innerHTML = '';
    const rect = container.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 520;

    const items = this.getFilteredIncidents();

    // Coordinate bounding box for Austin area
    const minLat = 30.18, maxLat = 30.39;
    const minLng = -97.82, maxLng = -97.66;

    const toX = (lng) => ((lng - minLng) / (maxLng - minLng)) * (w - 120) + 60;
    const toY = (lat) => h - (((lat - minLat) / (maxLat - minLat)) * (h - 100) + 50);

    // Vector Road Grid Network
    const roadsSvg = `
      <!-- Highways & Arterials -->
      <path d="M ${w * 0.48} 0 L ${w * 0.52} ${h}" stroke="#334155" stroke-width="8" stroke-linecap="round" />
      <path d="M ${w * 0.48} 0 L ${w * 0.52} ${h}" stroke="#475569" stroke-width="5" stroke-linecap="round" />
      <path d="M 0 ${h * 0.42} Q ${w * 0.5} ${h * 0.5} ${w} ${h * 0.38}" stroke="#334155" stroke-width="6" fill="none" />
      <path d="M 0 ${h * 0.42} Q ${w * 0.5} ${h * 0.5} ${w} ${h * 0.38}" stroke="#475569" stroke-width="4" fill="none" />

      <!-- Lady Bird Lake River Waterbody -->
      <path d="M 0 ${h * 0.58} Q ${w * 0.3} ${h * 0.52}, ${w * 0.5} ${h * 0.56} T ${w} ${h * 0.62}" stroke="#0369a1" stroke-width="22" fill="none" opacity="0.35" />
      <path d="M 0 ${h * 0.58} Q ${w * 0.3} ${h * 0.52}, ${w * 0.5} ${h * 0.56} T ${w} ${h * 0.62}" stroke="#38bdf8" stroke-width="6" fill="none" opacity="0.6" />

      <!-- Secondary Street Grid -->
      <line x1="${w * 0.25}" y1="0" x2="${w * 0.28}" y2="${h}" stroke="#1e293b" stroke-width="2" />
      <line x1="${w * 0.72}" y1="0" x2="${w * 0.76}" y2="${h}" stroke="#1e293b" stroke-width="2" />
      <line x1="0" y1="${h * 0.22}" x2="${w}" y2="${h * 0.24}" stroke="#1e293b" stroke-width="2" />
      <line x1="0" y1="${h * 0.75}" x2="${w}" y2="${h * 0.78}" stroke="#1e293b" stroke-width="2" />
    `;

    // Render interactive Pins
    let pinsSvg = '';
    items.forEach((item, idx) => {
      const px = toX(item.lng);
      const py = toY(item.lat);

      let pinColor = '#f59e0b';
      let haloColor = 'rgba(245, 158, 11, 0.4)';
      if (item.status === 'repaired') {
        pinColor = '#10b981';
        haloColor = 'rgba(16, 185, 129, 0.4)';
      } else if (item.severity === 'high') {
        pinColor = '#ef4444';
        haloColor = 'rgba(239, 68, 68, 0.5)';
      }

      pinsSvg += `
        <g class="gis-interactive-pin" data-id="${item.id}" style="cursor: pointer;" transform="translate(${px}, ${py})">
          <!-- Pulse Halo for High Severity -->
          ${item.severity === 'high' && item.status !== 'repaired' ? `
            <circle cx="0" cy="-16" r="18" fill="${haloColor}">
              <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
          ` : ''}
          <!-- Pin Shadow -->
          <ellipse cx="0" cy="0" rx="8" ry="4" fill="rgba(0,0,0,0.5)" />
          <!-- Pin Bubble -->
          <path d="M 0 0 C -8 -10 -14 -18 -14 -26 A 14 14 0 1 1 14 -26 C 14 -18 8 -10 0 0 Z" fill="${pinColor}" stroke="#ffffff" stroke-width="2" />
          <circle cx="0" cy="-26" r="5" fill="#ffffff" />
          <title>${item.type} - ${item.street} (${item.severity.toUpperCase()})</title>
        </g>
      `;
    });

    container.innerHTML = `
      <svg id="gis-vector-svg" viewBox="0 0 ${w} ${h}" style="width: 100%; height: 100%; background: #0f172a;">
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
          </pattern>
        </defs>
        <!-- Background Grid -->
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        ${roadsSvg}
        ${pinsSvg}
      </svg>
    `;

    // Bind Pin clicks
    container.querySelectorAll('.gis-interactive-pin').forEach(pin => {
      pin.addEventListener('click', () => {
        const id = pin.dataset.id;
        const incident = window.RoadAIState.damageIncidents.find(x => x.id === id);
        if (incident) this.openPopupModal(incident);
      });
    });

    // Update HUD counter
    const hudCount = document.getElementById('map-hud-count');
    if (hudCount) hudCount.textContent = items.length;
  },

  openPopupModal(item) {
    this.selectedIncident = item;
    const modal = document.getElementById('damage-detail-modal');
    if (!modal) return;

    // Populate data
    document.getElementById('modal-damage-thumb').src = item.image;
    document.getElementById('modal-damage-title').textContent = item.type;
    document.getElementById('modal-damage-id').textContent = `#${item.id}`;
    
    const sevBadge = document.getElementById('modal-damage-severity');
    sevBadge.textContent = `${item.severity.toUpperCase()} SEVERITY`;
    sevBadge.className = `severity-badge ${item.severity}`;

    document.getElementById('modal-damage-coords').textContent = `${item.lat.toFixed(4)}° N, ${Math.abs(item.lng).toFixed(4)}° W`;
    document.getElementById('modal-damage-street').textContent = item.street;
    document.getElementById('modal-damage-district').textContent = item.district;
    document.getElementById('modal-damage-date').textContent = `${item.date} (${item.timestamp})`;
    document.getElementById('modal-damage-action').textContent = item.recommendedAction;

    const repairBtn = document.getElementById('map-modal-mark-repaired');
    if (repairBtn) {
      if (item.status === 'repaired') {
        repairBtn.textContent = '✓ Already Repaired';
        repairBtn.disabled = true;
        repairBtn.style.opacity = '0.6';
      } else {
        repairBtn.textContent = 'Mark as Repaired';
        repairBtn.disabled = false;
        repairBtn.style.opacity = '1';
      }
    }

    modal.classList.add('active');
  },

  closePopupModal() {
    const modal = document.getElementById('damage-detail-modal');
    if (modal) modal.classList.remove('active');
  },

  searchMarker(query) {
    const found = window.RoadAIState.damageIncidents.find(x =>
      x.street.toLowerCase().includes(query) ||
      x.district.toLowerCase().includes(query) ||
      x.id.toLowerCase().includes(query)
    );

    if (found) {
      this.openPopupModal(found);
      if (this.useLeaflet && this.mapInstance) {
        this.mapInstance.flyTo([found.lat, found.lng], 15);
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.RoadMap.init();
});
