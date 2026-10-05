/**
 * AI-Based Road Condition Monitoring System
 * Core Application Engine & State Manager
 */

// Global State
window.RoadAIState = {
  activeTab: 'overview',
  metrics: {
    scannedKm: 1482.6,
    activePotholes: 342,
    cracksFound: 819,
    criticalRepairs: 28,
    repairedCount: 164
  },
  damageIncidents: [
    {
      id: 'DMG-2026-9041',
      type: 'Severe Pothole',
      category: 'pothole',
      severity: 'high',
      confidence: 94.2,
      depthCm: 8.5,
      widthCm: 44.8,
      lat: 30.2672,
      lng: -97.7431,
      street: 'Congress Ave & 4th St',
      district: 'Downtown',
      timestamp: '8 mins ago',
      date: '2026-10-05 20:57',
      status: 'pending',
      image: 'assets/pothole_severe.jpg',
      recommendedAction: 'Immediate Cold Patching (Crew Tier 1)'
    },
    {
      id: 'DMG-2026-9040',
      type: 'Alligator Cracking',
      category: 'cracking',
      severity: 'medium',
      confidence: 91.8,
      depthCm: 3.2,
      widthCm: 120.0,
      lat: 30.2747,
      lng: -97.7404,
      street: '11th St near State Capitol',
      district: 'Downtown',
      timestamp: '24 mins ago',
      date: '2026-10-05 20:41',
      status: 'dispatched',
      image: 'assets/alligator_cracking.jpg',
      recommendedAction: 'Milling & Bituminous Surface Overlay'
    },
    {
      id: 'DMG-2026-9039',
      type: 'Longitudinal Fissure',
      category: 'cracking',
      severity: 'medium',
      confidence: 89.4,
      depthCm: 2.1,
      widthCm: 240.0,
      lat: 30.2988,
      lng: -97.7325,
      street: 'Speedway & 32nd St',
      district: 'North Sector',
      timestamp: '1 hr ago',
      date: '2026-10-05 20:05',
      status: 'pending',
      image: 'assets/longitudinal_crack.jpg',
      recommendedAction: 'Hot-Pour Elastomeric Crack Sealant'
    },
    {
      id: 'DMG-2026-9038',
      type: 'Severe Pothole',
      category: 'pothole',
      severity: 'high',
      confidence: 96.1,
      depthCm: 9.2,
      widthCm: 52.0,
      lat: 30.2458,
      lng: -97.7612,
      street: 'S Lamar Blvd & Oltorf St',
      district: 'West Suburbs',
      timestamp: '2 hrs ago',
      date: '2026-10-05 19:12',
      status: 'pending',
      image: 'assets/pothole_severe.jpg',
      recommendedAction: 'Emergency Cold Patch & Base Compaction'
    },
    {
      id: 'DMG-2026-9037',
      type: 'Edge Ravelling & Degradation',
      category: 'degradation',
      severity: 'low',
      confidence: 85.3,
      depthCm: 1.8,
      widthCm: 80.0,
      lat: 30.2215,
      lng: -97.7241,
      street: 'Airport Blvd & Techni Center',
      district: 'Harbor East',
      timestamp: '3 hrs ago',
      date: '2026-10-05 18:04',
      status: 'repaired',
      image: 'assets/alligator_cracking.jpg',
      recommendedAction: 'Shoulder Stabilization & Fog Seal'
    },
    {
      id: 'DMG-2026-9036',
      type: 'Wheel-Path Rutting',
      category: 'degradation',
      severity: 'medium',
      confidence: 88.7,
      depthCm: 4.1,
      widthCm: 180.0,
      lat: 30.3421,
      lng: -97.7015,
      street: 'Research Blvd / US-183 Corridor',
      district: 'North Sector',
      timestamp: '4 hrs ago',
      date: '2026-10-05 17:15',
      status: 'dispatched',
      image: 'assets/longitudinal_crack.jpg',
      recommendedAction: 'Microsurfacing & Profile Leveling'
    },
    {
      id: 'DMG-2026-9035',
      type: 'Deep Asphalt Crater',
      category: 'pothole',
      severity: 'high',
      confidence: 95.8,
      depthCm: 10.4,
      widthCm: 60.5,
      lat: 30.2510,
      lng: -97.7120,
      street: 'Riverside Dr & Pleasant Valley',
      district: 'Harbor East',
      timestamp: '5 hrs ago',
      date: '2026-10-05 16:30',
      status: 'pending',
      image: 'assets/pothole_severe.jpg',
      recommendedAction: 'Full-Depth Asphalt Cut and Replacement'
    },
    {
      id: 'DMG-2026-9034',
      type: 'Transverse Thermal Crack',
      category: 'cracking',
      severity: 'low',
      confidence: 83.2,
      depthCm: 1.5,
      widthCm: 210.0,
      lat: 30.3750,
      lng: -97.7250,
      street: 'Metric Blvd & Kramer Ln',
      district: 'North Sector',
      timestamp: '6 hrs ago',
      date: '2026-10-05 15:10',
      status: 'repaired',
      image: 'assets/longitudinal_crack.jpg',
      recommendedAction: 'Rout & Seal with Polymer Bitumen'
    },
    {
      id: 'DMG-2026-9033',
      type: 'Industrial Haul Rutting',
      category: 'degradation',
      severity: 'high',
      confidence: 92.5,
      depthCm: 6.8,
      widthCm: 150.0,
      lat: 30.1980,
      lng: -97.6890,
      street: 'Burleson Rd Freight Corridor',
      district: 'Industrial Corridor',
      timestamp: '8 hrs ago',
      date: '2026-10-05 13:40',
      status: 'pending',
      image: 'assets/alligator_cracking.jpg',
      recommendedAction: 'Heavy Subgrade Stabilization & Paving'
    },
    {
      id: 'DMG-2026-9032',
      type: 'Block Cracking Network',
      category: 'cracking',
      severity: 'medium',
      confidence: 87.9,
      depthCm: 2.8,
      widthCm: 140.0,
      lat: 30.2820,
      lng: -97.7810,
      street: 'Enfield Rd & Exposition Blvd',
      district: 'West Suburbs',
      timestamp: '10 hrs ago',
      date: '2026-10-05 11:25',
      status: 'repaired',
      image: 'assets/alligator_cracking.jpg',
      recommendedAction: 'Slurry Seal Application'
    },
    {
      id: 'DMG-2026-9031',
      type: 'Bridge Expansion Pothole',
      category: 'pothole',
      severity: 'high',
      confidence: 97.4,
      depthCm: 7.8,
      widthCm: 48.0,
      lat: 30.2630,
      lng: -97.7460,
      street: '1st St Lady Bird Lake Bridge',
      district: 'Downtown',
      timestamp: '12 hrs ago',
      date: '2026-10-05 09:30',
      status: 'pending',
      image: 'assets/pothole_severe.jpg',
      recommendedAction: 'Rapid-Set Bridge Joint Elastomer Patch'
    },
    {
      id: 'DMG-2026-9030',
      type: 'Surface Stripping',
      category: 'degradation',
      severity: 'low',
      confidence: 84.1,
      depthCm: 1.2,
      widthCm: 95.0,
      lat: 30.2105,
      lng: -97.7550,
      street: 'Stassney Ln & Menchaca Rd',
      district: 'West Suburbs',
      timestamp: '14 hrs ago',
      date: '2026-10-05 07:45',
      status: 'repaired',
      image: 'assets/alligator_cracking.jpg',
      recommendedAction: 'Chip Seal Re-surfacing'
    }
  ],

  // Toast Notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>`;

    if (type === 'success') {
      iconSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>`;
    } else if (type === 'danger') {
      iconSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`;
    }

    toast.innerHTML = `<span>${iconSvg}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // Update Top Metric Counters
  updateMetricCounters() {
    const kpiScanned = document.getElementById('kpi-scanned');
    const kpiPotholes = document.getElementById('kpi-potholes');
    const kpiCracks = document.getElementById('kpi-cracks');
    const kpiCritical = document.getElementById('kpi-critical');

    // Recalculate from active data
    let activePotholes = 0;
    let cracks = 0;
    let critical = 0;

    this.damageIncidents.forEach(item => {
      if (item.status !== 'repaired') {
        if (item.category === 'pothole') activePotholes++;
        if (item.category === 'cracking' || item.category === 'degradation') cracks++;
        if (item.severity === 'high') critical++;
      }
    });

    if (kpiScanned) kpiScanned.textContent = `${this.metrics.scannedKm.toLocaleString()}`;
    if (kpiPotholes) kpiPotholes.textContent = activePotholes;
    if (kpiCracks) kpiCracks.textContent = cracks;
    if (kpiCritical) kpiCritical.textContent = critical;

    // Update sidebar badge
    const sidebarBadge = document.getElementById('sidebar-critical-badge');
    if (sidebarBadge) sidebarBadge.textContent = critical;
  },

  // Mark an Incident as Repaired
  markAsRepaired(id) {
    const incident = this.damageIncidents.find(x => x.id === id);
    if (!incident) return;

    incident.status = 'repaired';
    this.metrics.repairedCount++;
    this.updateMetricCounters();

    // Trigger updates on active views
    if (window.RoadDashboard) window.RoadDashboard.renderAlertsTable();
    if (window.RoadMap) window.RoadMap.refreshPins();
    if (window.RoadReports) window.RoadReports.updatePreview();

    this.showToast(`Incident #${id} marked as REPAIRED. Metrics updated.`, 'success');
  },

  // Switch Navigation Tabs
  switchTab(tabId) {
    this.activeTab = tabId;

    // Update Nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.tab === tabId);
    });

    // Update Page Views
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${tabId}`);
    });

    // Update Header Breadcrumb and Title
    const titleElem = document.getElementById('header-page-title');
    const breadcrumbElem = document.getElementById('header-breadcrumb');

    const titles = {
      overview: { title: 'Dashboard Overview', breadcrumb: 'Municipal Operations / Overview' },
      analyze:  { title: 'Upload & AI Analysis', breadcrumb: 'Media Intake / Inference Pipeline' },
      map:      { title: 'Damage Geospatial Map', breadcrumb: 'Geospatial Tracking / GIS View' },
      reports:  { title: 'Executive Report Generator', breadcrumb: 'Compliance & Audit / Generator' }
    };

    if (titles[tabId]) {
      if (titleElem) titleElem.innerHTML = titles[tabId].title;
      if (breadcrumbElem) breadcrumbElem.textContent = titles[tabId].breadcrumb;
    }

    // Tab-specific initializations
    if (tabId === 'map' && window.RoadMap) {
      setTimeout(() => window.RoadMap.resizeMap(), 150);
    } else if (tabId === 'analyze' && window.RoadAnalyzer) {
      setTimeout(() => window.RoadAnalyzer.drawOverlayCanvas(), 150);
    }
  }
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Navigation item clicks
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.dataset.tab;
      window.RoadAIState.switchTab(targetTab);
    });
  });

  // Global search input
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (window.RoadAIState.activeTab === 'overview' && window.RoadDashboard) {
        window.RoadDashboard.filterSearch(q);
      } else if (window.RoadAIState.activeTab === 'map' && window.RoadMap) {
        window.RoadMap.searchMarker(q);
      }
    });
  }

  // Header quick upload button
  const quickUploadBtn = document.getElementById('btn-quick-upload');
  if (quickUploadBtn) {
    quickUploadBtn.addEventListener('click', () => {
      window.RoadAIState.switchTab('analyze');
    });
  }

  // Close modals on click outside or close buttons
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) modal.classList.remove('active');
    });
  });

  // Update initial counters
  window.RoadAIState.updateMetricCounters();
});
