/**
 * AI-Based Road Condition Monitoring System
 * Dashboard Overview - Charts & Alerts Table
 */

window.RoadDashboard = {
  currentFilter: 'all',
  searchQuery: '',

  init() {
    this.renderAlertsTable();
    this.renderSeverityChart();
    this.renderTrendChart();
    this.bindEvents();
  },

  bindEvents() {
    // Filter chips
    document.querySelectorAll('.table-filter-pills .filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.table-filter-pills .filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentFilter = chip.dataset.filter;
        this.renderAlertsTable();
      });
    });

    // Chart toggle controls
    document.querySelectorAll('.chart-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const parent = btn.closest('.chart-controls');
        parent.querySelectorAll('.chart-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const period = btn.dataset.period;
        this.renderTrendChart(period);
      });
    });
  },

  filterSearch(query) {
    this.searchQuery = query.toLowerCase();
    this.renderAlertsTable();
  },

  renderAlertsTable() {
    const tbody = document.getElementById('alerts-table-body');
    if (!tbody) return;

    let items = window.RoadAIState.damageIncidents;

    // Filter
    if (this.currentFilter === 'high') {
      items = items.filter(x => x.severity === 'high');
    } else if (this.currentFilter === 'medium') {
      items = items.filter(x => x.severity === 'medium');
    } else if (this.currentFilter === 'low') {
      items = items.filter(x => x.severity === 'low');
    } else if (this.currentFilter === 'pothole') {
      items = items.filter(x => x.category === 'pothole');
    } else if (this.currentFilter === 'cracking') {
      items = items.filter(x => x.category === 'cracking' || x.category === 'degradation');
    }

    // Search query
    if (this.searchQuery) {
      items = items.filter(x =>
        x.id.toLowerCase().includes(this.searchQuery) ||
        x.street.toLowerCase().includes(this.searchQuery) ||
        x.type.toLowerCase().includes(this.searchQuery) ||
        x.district.toLowerCase().includes(this.searchQuery)
      );
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 36px; color: var(--slate-400);">
            No road damage records matched your criteria.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => {
      const sevClass = item.severity === 'high' ? 'high' : (item.severity === 'medium' ? 'medium' : 'low');
      const sevLabel = item.severity.toUpperCase();
      
      let statusBadge = '';
      if (item.status === 'repaired') {
        statusBadge = `<span class="status-pill repaired">✓ Repaired</span>`;
      } else if (item.status === 'dispatched') {
        statusBadge = `<span class="status-pill dispatched">⚙ Dispatched</span>`;
      } else {
        statusBadge = `<span class="status-pill pending">⏳ Pending Review</span>`;
      }

      return `
        <tr data-id="${item.id}">
          <td>
            <div class="damage-cell">
              <img src="${item.image}" alt="${item.type}" class="damage-thumbnail" />
              <div class="damage-meta">
                <h5>${item.type}</h5>
                <span>#${item.id}</span>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 500; color: var(--slate-800);">${item.timestamp}</div>
            <div style="font-size: 0.7rem; color: var(--slate-400);">${item.date}</div>
          </td>
          <td>
            <span class="severity-badge ${sevClass}">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
              ${sevLabel} (${item.confidence}%)
            </span>
          </td>
          <td>
            <div class="location-cell">
              <span class="location-street">${item.street}</span>
              <span class="location-coords">${item.lat.toFixed(4)}° N, ${Math.abs(item.lng).toFixed(4)}° W • ${item.district}</span>
            </div>
          </td>
          <td>${statusBadge}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="table-action-btn" onclick="RoadDashboard.inspectIncident('${item.id}')">Inspect AI</button>
              ${item.status !== 'repaired' ? `
                <button class="table-action-btn" style="color: var(--success-emerald-dark); border-color: var(--success-emerald);" onclick="RoadAIState.markAsRepaired('${item.id}')">Mark Fixed</button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  inspectIncident(id) {
    const item = window.RoadAIState.damageIncidents.find(x => x.id === id);
    if (!item) return;

    // Load into Analyzer and switch tab
    if (window.RoadAnalyzer) {
      window.RoadAnalyzer.loadIncident(item);
    }
    window.RoadAIState.switchTab('analyze');
  },

  // Interactive SVG Grouped Bar Chart: Severity Distribution
  renderSeverityChart() {
    const container = document.getElementById('severity-chart-container');
    if (!container) return;

    const data = [
      { district: 'Downtown', high: 14, med: 22, low: 31 },
      { district: 'North Sector', high: 8, med: 18, low: 26 },
      { district: 'Industrial', high: 19, med: 15, low: 12 },
      { district: 'Harbor East', high: 6, med: 14, low: 20 },
      { district: 'West Suburbs', high: 5, med: 12, low: 28 }
    ];

    const width = 480;
    const height = 230;
    const padding = { top: 25, right: 20, bottom: 40, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const maxVal = 35;

    const groupWidth = chartW / data.length;
    const barWidth = 14;

    let barsSvg = '';

    data.forEach((d, i) => {
      const groupX = padding.left + i * groupWidth + (groupWidth - barWidth * 3 - 8) / 2;

      const hHigh = (d.high / maxVal) * chartH;
      const hMed = (d.med / maxVal) * chartH;
      const hLow = (d.low / maxVal) * chartH;

      const yHigh = padding.top + (chartH - hHigh);
      const yMed = padding.top + (chartH - hMed);
      const yLow = padding.top + (chartH - hLow);

      barsSvg += `
        <!-- High Severity (Red) -->
        <rect x="${groupX}" y="${yHigh}" width="${barWidth}" height="${hHigh}" fill="#ef4444" rx="3">
          <title>${d.district} - High Severity: ${d.high} detected</title>
        </rect>
        <!-- Medium Severity (Amber) -->
        <rect x="${groupX + barWidth + 4}" y="${yMed}" width="${barWidth}" height="${hMed}" fill="#f59e0b" rx="3">
          <title>${d.district} - Medium Severity: ${d.med} detected</title>
        </rect>
        <!-- Low Severity (Emerald) -->
        <rect x="${groupX + (barWidth + 4) * 2}" y="${yLow}" width="${barWidth}" height="${hLow}" fill="#10b981" rx="3">
          <title>${d.district} - Low/Fixed: ${d.low} detected</title>
        </rect>
        <!-- X Axis Label -->
        <text x="${groupX + barWidth * 1.5 + 4}" y="${height - 12}" font-size="10" fill="#64748b" text-anchor="middle" font-weight="600">${d.district}</text>
      `;
    });

    // Grid lines
    let gridLinesSvg = '';
    [0, 10, 20, 30].forEach(val => {
      const y = padding.top + chartH - (val / maxVal) * chartH;
      gridLinesSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3" />
        <text x="${padding.left - 8}" y="${y + 3}" font-size="9" fill="#94a3b8" text-anchor="end">${val}</text>
      `;
    });

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;">
        ${gridLinesSvg}
        ${barsSvg}
      </svg>
      <div style="display: flex; justify-content: center; gap: 18px; margin-top: 6px; font-size: 0.72rem; color: #64748b; font-weight: 600;">
        <span style="display: flex; align-items: center; gap: 5px;"><span style="width: 10px; height: 10px; background: #ef4444; border-radius: 2px;"></span> High (Potholes)</span>
        <span style="display: flex; align-items: center; gap: 5px;"><span style="width: 10px; height: 10px; background: #f59e0b; border-radius: 2px;"></span> Medium (Cracks)</span>
        <span style="display: flex; align-items: center; gap: 5px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> Low (Surface Wear)</span>
      </div>
    `;
  },

  // Interactive SVG Line Chart: Road Degradation Trends Over Time
  renderTrendChart(period = '30d') {
    const container = document.getElementById('trend-chart-container');
    if (!container) return;

    let points = [];
    if (period === '7d') {
      points = [
        { label: 'Mon', detected: 18, repaired: 12 },
        { label: 'Tue', detected: 24, repaired: 19 },
        { label: 'Wed', detected: 32, repaired: 25 },
        { label: 'Thu', detected: 28, repaired: 22 },
        { label: 'Fri', detected: 42, repaired: 30 },
        { label: 'Sat', detected: 15, repaired: 16 },
        { label: 'Sun', detected: 21, repaired: 18 }
      ];
    } else if (period === '90d') {
      points = [
        { label: 'May', detected: 140, repaired: 110 },
        { label: 'Jun', detected: 185, repaired: 160 },
        { label: 'Jul', detected: 240, repaired: 210 },
        { label: 'Aug', detected: 310, repaired: 280 },
        { label: 'Sep', detected: 275, repaired: 290 },
        { label: 'Oct', detected: 342, repaired: 310 }
      ];
    } else {
      // 30d default
      points = [
        { label: 'W1', detected: 68, repaired: 52 },
        { label: 'W2', detected: 84, repaired: 76 },
        { label: 'W3', detected: 112, repaired: 94 },
        { label: 'W4', detected: 95, repaired: 108 },
        { label: 'Current', detected: 128, repaired: 115 }
      ];
    }

    const width = 480;
    const height = 230;
    const padding = { top: 25, right: 20, bottom: 40, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const maxVal = Math.max(...points.map(p => Math.max(p.detected, p.repaired))) * 1.25;

    const stepX = chartW / (points.length - 1);

    const detectedCoords = points.map((p, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (p.detected / maxVal) * chartH;
      return { x, y, val: p.detected, label: p.label };
    });

    const repairedCoords = points.map((p, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (p.repaired / maxVal) * chartH;
      return { x, y, val: p.repaired, label: p.label };
    });

    const detectedPathD = detectedCoords.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`, '');
    const repairedPathD = repairedCoords.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`, '');

    // Area fill under detected
    const areaDetectedD = `${detectedPathD} L ${detectedCoords[detectedCoords.length - 1].x} ${padding.top + chartH} L ${detectedCoords[0].x} ${padding.top + chartH} Z`;

    let dotsSvg = '';
    detectedCoords.forEach(c => {
      dotsSvg += `
        <circle cx="${c.x}" cy="${c.y}" r="4" fill="#ea580c" stroke="#ffffff" stroke-width="2">
          <title>${c.label}: ${c.val} new road damages detected</title>
        </circle>
        <text x="${c.x}" y="${height - 12}" font-size="10" fill="#64748b" text-anchor="middle" font-weight="600">${c.label}</text>
      `;
    });

    repairedCoords.forEach(c => {
      dotsSvg += `
        <circle cx="${c.x}" cy="${c.y}" r="4" fill="#10b981" stroke="#ffffff" stroke-width="2">
          <title>${c.label}: ${c.val} municipal repairs completed</title>
        </circle>
      `;
    });

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ea580c" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#ea580c" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <!-- Horizontal grid -->
        <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="#f1f5f9" />
        <line x1="${padding.left}" y1="${padding.top + chartH * 0.5}" x2="${width - padding.right}" y2="${padding.top + chartH * 0.5}" stroke="#f1f5f9" />
        <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="#cbd5e1" />

        <!-- Area fill -->
        <path d="${areaDetectedD}" fill="url(#areaGradient)" />

        <!-- Detected Line -->
        <path d="${detectedPathD}" fill="none" stroke="#ea580c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Repaired Line -->
        <path d="${repairedPathD}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,4" stroke-linecap="round" />

        ${dotsSvg}
      </svg>
      <div style="display: flex; justify-content: center; gap: 18px; margin-top: 6px; font-size: 0.72rem; color: #64748b; font-weight: 600;">
        <span style="display: flex; align-items: center; gap: 5px;"><span style="width: 14px; height: 3px; background: #ea580c; border-radius: 2px;"></span> New Damage Detected</span>
        <span style="display: flex; align-items: center; gap: 5px;"><span style="width: 14px; height: 2px; border-top: 2px dashed #10b981;"></span> Completed Repairs</span>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.RoadDashboard.init();
});
