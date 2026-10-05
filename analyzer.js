/**
 * AI-Based Road Condition Monitoring System
 * Page 2: Upload & Analyze (Inference Pipeline & Split-Screen View)
 */

window.RoadAnalyzer = {
  currentMedia: {
    type: 'pothole',
    name: 'austin_highway_km14_pothole.jpg',
    url: 'assets/pothole_severe.jpg',
    incident: null
  },
  isAnalyzing: false,
  layerToggles: {
    boxes: true,
    heatmap: false,
    crosshair: true
  },

  // Sample presets for instant testing
  presets: {
    pothole: {
      name: 'Severe Pothole - I-35 MM 234',
      url: 'assets/pothole_severe.jpg',
      type: 'Severe Pothole',
      category: 'pothole',
      severity: 'HIGH',
      confidence: 94.2,
      depth: '8.5 cm (3.3 in)',
      width: '44.8 cm (17.6 in)',
      area: '0.18 m²',
      urgency: 'Tier 1 Immediate Priority',
      action: 'Emergency Cold Patching & Base Compaction',
      material: '22 kg Bituminous Cold Patch + Tack Coat',
      costEst: '$850 - $1,200',
      gps: '30.2672° N, 97.7431° W',
      boxes: [
        { x: 0.28, y: 0.38, w: 0.44, h: 0.36, label: 'Severe Pothole', conf: 94.2, color: '#ef4444' },
        { x: 0.16, y: 0.24, w: 0.12, h: 0.18, label: 'Safety Cone', conf: 98.6, color: '#f59e0b' }
      ]
    },
    cracking: {
      name: 'Alligator Fatigue Cracking - 11th St',
      url: 'assets/alligator_cracking.jpg',
      type: 'Alligator Cracking Network',
      category: 'cracking',
      severity: 'MEDIUM',
      confidence: 91.8,
      depth: '3.2 cm (1.2 in)',
      width: '120.0 cm (47.2 in)',
      area: '1.45 m²',
      urgency: 'Tier 2 Scheduled Maintenance',
      action: 'Milling & Bituminous Surface Overlay',
      material: '140 kg Hot-Mix Asphalt Dense Grade',
      costEst: '$2,400 - $3,100',
      gps: '30.2747° N, 97.7404° W',
      boxes: [
        { x: 0.24, y: 0.08, w: 0.52, h: 0.65, label: 'Alligator Fatigue Cracking', conf: 91.8, color: '#f59e0b' },
        { x: 0.08, y: 0.14, w: 0.26, h: 0.12, label: 'Manhole Cover Flange', conf: 97.2, color: '#38bdf8' }
      ]
    },
    longitudinal: {
      name: 'Longitudinal Fissure - Rural Hwy 9',
      url: 'assets/longitudinal_crack.jpg',
      type: 'Longitudinal Centerline Fissure',
      category: 'cracking',
      severity: 'MEDIUM',
      confidence: 89.4,
      depth: '2.1 cm (0.8 in)',
      width: '240.0 cm (94.5 in)',
      area: '0.48 m²',
      urgency: 'Tier 3 Routine Remediation',
      action: 'Hot-Pour Elastomeric Crack Sealant',
      material: '45 Liters Polymer Rubberized Bitumen',
      costEst: '$1,100 - $1,500',
      gps: '30.2988° N, 97.7325° W',
      boxes: [
        { x: 0.44, y: 0.22, w: 0.12, h: 0.72, label: 'Longitudinal Fissure', conf: 89.4, color: '#f59e0b' },
        { x: 0.70, y: 0.10, w: 0.06, h: 0.16, label: 'Inspector Person', conf: 96.5, color: '#10b981' }
      ]
    }
  },

  activePresetKey: 'pothole',

  init() {
    this.bindEvents();
    this.loadPreset('pothole');
  },

  bindEvents() {
    // Dropzone drag & drop
    const dropzone = document.getElementById('media-dropzone');
    const fileInput = document.getElementById('file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      ['dragenter', 'dragover'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(name => {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          this.handleFileUpload(files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    // Sample preset chips
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const presetKey = chip.dataset.preset;
        this.loadPreset(presetKey);
      });
    });

    // Start Analysis button
    const analyzeBtn = document.getElementById('btn-start-analyze');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        this.runInferenceSimulation();
      });
    }

    // Layer toggles
    document.querySelectorAll('.layer-toggle-group .toggle-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const layer = chip.dataset.layer;
        this.layerToggles[layer] = !this.layerToggles[layer];
        chip.classList.toggle('active', this.layerToggles[layer]);
        this.drawOverlayCanvas();
      });
    });

    // Dispatch button
    const dispatchBtn = document.getElementById('btn-dispatch-order');
    if (dispatchBtn) {
      dispatchBtn.addEventListener('click', () => {
        this.showDispatchModal();
      });
    }

    // Window resize redrawing canvas
    window.addEventListener('resize', () => {
      if (window.RoadAIState.activeTab === 'analyze') {
        this.drawOverlayCanvas();
      }
    });
  },

  loadPreset(key) {
    const data = this.presets[key];
    if (!data) return;

    this.activePresetKey = key;
    this.currentMedia = {
      type: key,
      name: data.name,
      url: data.url,
      data: data
    };

    // Update preset chips UI
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.preset === key);
    });

    // Update selected file indicator
    const selectedFileText = document.getElementById('selected-file-name');
    if (selectedFileText) {
      selectedFileText.textContent = data.name;
    }

    // Update image view
    const imgElem = document.getElementById('analyzer-source-image');
    if (imgElem) {
      imgElem.src = data.url;
      imgElem.onload = () => {
        this.updateClassificationCard(data);
        this.drawOverlayCanvas();
      };
      if (imgElem.complete && imgElem.naturalWidth > 0) {
        this.updateClassificationCard(data);
        this.drawOverlayCanvas();
      }
    }
  },

  loadIncident(incident) {
    let key = 'pothole';
    if (incident.category === 'cracking') key = 'cracking';
    if (incident.type.includes('Longitudinal')) key = 'longitudinal';

    this.loadPreset(key);
    window.RoadAIState.showToast(`Loaded incident #${incident.id} for AI analysis.`, 'info');
  },

  handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      const fileName = file.name;

      // Determine mock type
      let mockKey = 'pothole';
      if (fileName.toLowerCase().includes('crack')) mockKey = 'cracking';
      if (fileName.toLowerCase().includes('long')) mockKey = 'longitudinal';

      const presetData = { ...this.presets[mockKey], name: fileName, url: url };

      this.currentMedia = {
        type: mockKey,
        name: fileName,
        url: url,
        data: presetData
      };

      const selectedFileText = document.getElementById('selected-file-name');
      if (selectedFileText) selectedFileText.textContent = `${fileName} (${(file.size / 1024).toFixed(1)} KB)`;

      const imgElem = document.getElementById('analyzer-source-image');
      if (imgElem) {
        imgElem.src = url;
        imgElem.onload = () => {
          this.runInferenceSimulation();
        };
      }
    };
    reader.readAsDataURL(file);
  },

  runInferenceSimulation() {
    if (this.isAnalyzing) return;
    this.isAnalyzing = true;

    const overlay = document.getElementById('processing-overlay');
    const progressBar = document.getElementById('processing-progress-bar');
    const progressPercent = document.getElementById('processing-percent');
    const terminalLogs = document.getElementById('processing-terminal');
    const scanline = document.getElementById('scanline-bar');

    if (overlay) overlay.classList.add('active');
    if (scanline) scanline.classList.add('scanning');

    if (terminalLogs) terminalLogs.innerHTML = '';

    const logs = [
      { p: 15, msg: '[0.2s] Ingesting high-resolution pavement frame (1920x1080 @ 60fps)...', cls: '' },
      { p: 35, msg: '[0.6s] Model YOLOv8-Road-v3.4 initialized on TensorRT execution engine.', cls: 'amber' },
      { p: 60, msg: '[1.1s] Segmenting surface anomalies, aggregate unraveling, & asphalt texture...', cls: '' },
      { p: 85, msg: '[1.5s] Bounding box regression & depth estimation matrix calculated.', cls: '' },
      { p: 100, msg: '[1.9s] Geotagging & severity classification complete. Confidence: 94.2%.', cls: 'success' }
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < logs.length) {
        const item = logs[step];
        if (progressBar) progressBar.style.width = `${item.p}%`;
        if (progressPercent) progressPercent.textContent = `${item.p}%`;

        if (terminalLogs) {
          const div = document.createElement('div');
          div.className = `log-entry ${item.cls}`;
          div.textContent = item.msg;
          terminalLogs.appendChild(div);
          terminalLogs.scrollTop = terminalLogs.scrollHeight;
        }
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (overlay) overlay.classList.remove('active');
          if (scanline) scanline.classList.remove('scanning');
          this.isAnalyzing = false;

          const activeData = this.currentMedia.data || this.presets[this.activePresetKey];
          this.updateClassificationCard(activeData);
          this.drawOverlayCanvas();
          window.RoadAIState.showToast(`AI Analysis complete! Severity: ${activeData.severity} (${activeData.confidence}%)`, 'success');
        }, 500);
      }
    }, 400);
  },

  updateClassificationCard(data) {
    const title = document.getElementById('detected-damage-title');
    const confidence = document.getElementById('detected-confidence-badge');
    const severityBadge = document.getElementById('detected-severity-badge');
    const gpsElem = document.getElementById('detected-gps-coords');
    const depthElem = document.getElementById('detected-depth');
    const widthElem = document.getElementById('detected-width');
    const areaElem = document.getElementById('detected-area');
    const actionDesc = document.getElementById('suggested-action-desc');
    const materialElem = document.getElementById('suggested-material');
    const costElem = document.getElementById('suggested-cost');

    if (title) title.textContent = data.type;
    if (confidence) confidence.textContent = `${data.confidence}% Confidence`;
    if (severityBadge) {
      severityBadge.textContent = `${data.severity} SEVERITY`;
      severityBadge.className = `severity-badge ${data.severity.toLowerCase()}`;
    }

    if (gpsElem) gpsElem.textContent = data.gps;
    if (depthElem) depthElem.textContent = data.depth;
    if (widthElem) widthElem.textContent = data.width;
    if (areaElem) areaElem.textContent = data.area;

    if (actionDesc) actionDesc.textContent = `${data.action} - ${data.urgency}. Structural integrity compromised if left unsealed before precipitation.`;
    if (materialElem) materialElem.textContent = `Required: ${data.material}`;
    if (costElem) costElem.textContent = `Est. Repair: ${data.costEst}`;
  },

  drawOverlayCanvas() {
    const canvas = document.getElementById('detection-canvas');
    const img = document.getElementById('analyzer-source-image');
    if (!canvas || !img) return;

    const rect = img.getBoundingClientRect();
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const activeData = this.currentMedia.data || this.presets[this.activePresetKey];
    if (!activeData || !activeData.boxes) return;

    // Draw Heatmap if enabled
    if (this.layerToggles.heatmap) {
      activeData.boxes.forEach(box => {
        const cx = (box.x + box.w / 2) * canvas.width;
        const cy = (box.y + box.h / 2) * canvas.height;
        const radius = (Math.max(box.w, box.h) * canvas.width) / 1.5;

        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radius);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
        grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Bounding Boxes
    if (this.layerToggles.boxes) {
      activeData.boxes.forEach(box => {
        const bx = box.x * canvas.width;
        const by = box.y * canvas.height;
        const bw = box.w * canvas.width;
        const bh = box.h * canvas.height;

        // Bounding box border
        ctx.lineWidth = 3;
        ctx.strokeStyle = box.color || '#ef4444';
        ctx.strokeRect(bx, by, bw, bh);

        // Soft fill
        ctx.fillStyle = `${box.color}22`;
        ctx.fillRect(bx, by, bw, bh);

        // Corner accents
        const cornerSize = 10;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';

        // Top-left
        ctx.beginPath();
        ctx.moveTo(bx, by + cornerSize);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx + cornerSize, by);
        ctx.stroke();

        // Label Tag
        const labelText = `${box.label} [${box.conf}%]`;
        ctx.font = 'bold 12px Inter, sans-serif';
        const textMetrics = ctx.measureText(labelText);
        const tagH = 22;
        const tagW = textMetrics.width + 16;

        ctx.fillStyle = box.color || '#ef4444';
        ctx.fillRect(bx, by - tagH, tagW, tagH);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, bx + 8, by - 6);
      });
    }

    // Draw Crosshair & Dimensions
    if (this.layerToggles.crosshair && activeData.boxes.length > 0) {
      const primaryBox = activeData.boxes[0];
      const cx = (primaryBox.x + primaryBox.w / 2) * canvas.width;
      const cy = (primaryBox.y + primaryBox.h / 2) * canvas.height;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Crosshair horizontal and vertical lines
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy);
      ctx.lineTo(cx + 30, cy);
      ctx.moveTo(cx, cy - 30);
      ctx.lineTo(cx, cy + 30);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center reticle
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Measurement tag
      const dimText = `W: ${activeData.width} | D: ${activeData.depth}`;
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(cx - 70, cy + 12, 140, 20);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(dimText, cx - 64, cy + 26);
    }
  },

  showDispatchModal() {
    const modal = document.getElementById('dispatch-modal');
    if (!modal) return;

    const activeData = this.currentMedia.data || this.presets[this.activePresetKey];
    document.getElementById('modal-work-order-type').textContent = activeData.type;
    document.getElementById('modal-work-order-location').textContent = activeData.gps;
    document.getElementById('modal-work-order-urgency').textContent = activeData.urgency;

    modal.classList.add('active');
  },

  confirmDispatch() {
    const modal = document.getElementById('dispatch-modal');
    if (modal) modal.classList.remove('active');

    window.RoadAIState.showToast('Work Order #WO-8042 dispatched to DOT Maintenance Crew 3!', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.RoadAnalyzer.init();
});
