/**
 * AI-Based Road Condition Monitoring System
 * Page 4: Report Generator (Municipal Compliance & Executive PDF Export)
 */

window.RoadReports = {
  currentFilters: {
    dateRange: '30d',
    severity: 'all',
    district: 'all',
    categories: ['pothole', 'cracking', 'degradation']
  },

  init() {
    this.bindEvents();
    this.updatePreview();
  },

  bindEvents() {
    // Form Inputs
    const dateSelect = document.getElementById('report-date-range');
    const sevSelect = document.getElementById('report-severity-select');
    const distSelect = document.getElementById('report-district-select');

    if (dateSelect) {
      dateSelect.addEventListener('change', (e) => {
        this.currentFilters.dateRange = e.target.value;
        this.updatePreview();
      });
    }

    if (sevSelect) {
      sevSelect.addEventListener('change', (e) => {
        this.currentFilters.severity = e.target.value;
        this.updatePreview();
      });
    }

    if (distSelect) {
      distSelect.addEventListener('change', (e) => {
        this.currentFilters.district = e.target.value;
        this.updatePreview();
      });
    }

    // Checkboxes
    document.querySelectorAll('.report-category-chk').forEach(chk => {
      chk.addEventListener('change', () => {
        const cat = chk.value;
        if (chk.checked) {
          if (!this.currentFilters.categories.includes(cat)) this.currentFilters.categories.push(cat);
        } else {
          this.currentFilters.categories = this.currentFilters.categories.filter(c => c !== cat);
        }
        this.updatePreview();
      });
    });

    // Export PDF Button
    const exportBtn = document.getElementById('btn-export-pdf');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.triggerPdfExport();
      });
    }

    // Print button inside PDF preview modal
    const printBtn = document.getElementById('btn-print-report');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  },

  updatePreview() {
    let items = window.RoadAIState.damageIncidents;

    // Filter Severity
    if (this.currentFilters.severity !== 'all') {
      items = items.filter(x => x.severity === this.currentFilters.severity);
    }

    // Filter District
    if (this.currentFilters.district !== 'all') {
      items = items.filter(x => x.district === this.currentFilters.district);
    }

    // Filter Category
    items = items.filter(x => this.currentFilters.categories.includes(x.category));

    // Calculate metrics
    const totalCount = items.length;
    const criticalCount = items.filter(x => x.severity === 'high').length;
    const repairedCount = items.filter(x => x.status === 'repaired').length;

    // Estimate materials & costs
    // Each pothole avg ~35kg asphalt, crack avg ~20kg
    let asphaltKg = 0;
    items.forEach(x => {
      if (x.category === 'pothole') asphaltKg += 45;
      else asphaltKg += 25;
    });

    const asphaltTons = (asphaltKg / 1000).toFixed(2);
    const estCost = (items.length * 1150).toLocaleString();

    // Update Preview DOM
    const previewCount = document.getElementById('preview-total-incidents');
    const previewTons = document.getElementById('preview-asphalt-tons');
    const previewCost = document.getElementById('preview-est-cost');
    const previewCritical = document.getElementById('preview-critical-count');
    const previewRepaired = document.getElementById('preview-repaired-count');

    if (previewCount) previewCount.textContent = totalCount;
    if (previewTons) previewTons.textContent = `${asphaltTons} Tons`;
    if (previewCost) previewCost.textContent = `$${estCost}`;
    if (previewCritical) previewCritical.textContent = criticalCount;
    if (previewRepaired) previewRepaired.textContent = repairedCount;

    // Update Date Tag in document header
    const dateLabelElem = document.getElementById('doc-preview-period');
    if (dateLabelElem) {
      const labels = {
        '7d': 'Last 7 Days (Oct 2026)',
        '30d': 'Past 30 Days (Sep - Oct 2026)',
        '90d': 'Third Quarter (Q3 2026 Audit)',
        'ytd': 'Year-to-Date Comprehensive'
      };
      dateLabelElem.textContent = labels[this.currentFilters.dateRange] || 'Current Audit Period';
    }
  },

  triggerPdfExport() {
    const modal = document.getElementById('pdf-report-modal');
    if (!modal) return;

    window.RoadAIState.showToast('Compiling executive audit report & generating vector layout...', 'info');

    setTimeout(() => {
      modal.classList.add('active');
    }, 600);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.RoadReports.init();
});
