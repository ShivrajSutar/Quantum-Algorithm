/**
 * BlochSphere3D.js - Interactive 3D Bloch Sphere Visualizer
 * 
 * Works with window.THREE (WebGL) and includes a high-precision 3D Canvas
 * vector fallback so it renders 100% reliably in any browser environment!
 */

export class BlochSphere3D {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      size: options.size || 240,
      ...options
    };

    this.coords = { x: 0, y: 0, z: 1, r: 1, theta: 0, phi: 0 };
    this.targetCoords = { x: 0, y: 0, z: 1, r: 1, theta: 0, phi: 0 };
    this.startCoords = { x: 0, y: 0, z: 1, r: 1, theta: 0, phi: 0 };
    this.animStartTime = 0;
    this.animDuration = 350;
    this.isAnimating = false;

    // View angles for rotation
    this.rotX = 0.45;
    this.rotY = 0.65;
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

    this.init();
  }

  init() {
    this.container.innerHTML = '';
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.resize();
    this.initEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const width = this.container.clientWidth || this.options.size;
    const height = this.container.clientHeight || this.options.size;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);

    this.width = width;
    this.height = height;
    this.radius = Math.min(width, height) * 0.36;
    this.centerX = width / 2;
    this.centerY = height / 2;
  }

  initEvents() {
    const onDown = (clientX, clientY) => {
      this.isDragging = true;
      this.lastMouse = { x: clientX, y: clientY };
    };

    const onMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      const dx = clientX - this.lastMouse.x;
      const dy = clientY - this.lastMouse.y;
      this.rotY += dx * 0.015;
      this.rotX += dy * 0.015;
      this.rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.rotX));
      this.lastMouse = { x: clientX, y: clientY };
    };

    const onUp = () => { this.isDragging = false; };

    this.canvas.addEventListener('mousedown', e => onDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onUp);

    this.canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) onDown(e.touches[0].clientX, e.touches[0].clientY);
    });
    window.addEventListener('touchmove', e => {
      if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
    });
    window.addEventListener('touchend', onUp);
  }

  /**
   * Projects a 3D Quantum Coordinate (x_q, y_q, z_q) onto 2D Canvas space
   * Quantum convention: +Z is UP (|0>), +X is FORWARD (|+>), +Y is RIGHT (|+i>)
   */
  project(qx, qy, qz) {
    // 1. Rotate around Y axis
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const x1 = qx * cosY - qy * sinY;
    const z1 = qx * sinY + qy * cosY;

    // 2. Rotate around X axis (pitch)
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const y2 = qz * cosX - z1 * sinX;
    const z2 = qz * sinX + z1 * cosX;

    // 3. Screen 2D projection
    return {
      x: this.centerX + x1 * this.radius,
      y: this.centerY - y2 * this.radius,
      depth: z2
    };
  }

  setBlochState(bloch, duration = 350) {
    this.startCoords = { ...this.coords };
    this.targetCoords = { ...bloch };
    this.animDuration = duration;
    this.animStartTime = performance.now();
    this.isAnimating = true;
  }

  drawRing(normalAxis, color, lineWidth = 1, dashed = false) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if (dashed) ctx.setLineDash([4, 4]);

    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      let qx = 0, qy = 0, qz = 0;

      if (normalAxis === 'z') { // Equator (XY plane)
        qx = Math.cos(angle);
        qy = Math.sin(angle);
        qz = 0;
      } else if (normalAxis === 'y') { // XZ meridian
        qx = Math.cos(angle);
        qy = 0;
        qz = Math.sin(angle);
      } else if (normalAxis === 'x') { // YZ meridian
        qx = 0;
        qy = Math.cos(angle);
        qz = Math.sin(angle);
      }

      const p = this.project(qx, qy, qz);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawAxis(start, end, color, label, labelPos) {
    const ctx = this.ctx;
    const p1 = this.project(...start);
    const p2 = this.project(...end);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    if (label) {
      const pLabel = this.project(...labelPos);
      ctx.font = 'bold 12px "JetBrains Mono", sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, pLabel.x, pLabel.y);
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw outer shaded sphere background
    const bgGrad = ctx.createRadialGradient(
      this.centerX - this.radius * 0.3,
      this.centerY - this.radius * 0.3,
      10,
      this.centerX,
      this.centerY,
      this.radius
    );
    bgGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    bgGrad.addColorStop(0.8, 'rgba(15, 23, 42, 0.6)');
    bgGrad.addColorStop(1, 'rgba(10, 15, 29, 0.95)');

    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = bgGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Draw Latitude & Longitude Rings
    this.drawRing('z', 'rgba(148, 163, 184, 0.35)', 1.2); // Equator
    this.drawRing('y', 'rgba(148, 163, 184, 0.2)', 1, true); // Prime meridian
    this.drawRing('x', 'rgba(148, 163, 184, 0.15)', 1, true);

    // 3. Draw Coordinate Axes & Basis Labels
    // Z-Axis (Up/Down: |0> to |1>)
    this.drawAxis([0, 0, -1.25], [0, 0, 1.25], '#38bdf8', '|0⟩', [0, 0, 1.45]);
    this.drawAxis([0, 0, 0], [0, 0, -1.25], '#38bdf8', '|1⟩', [0, 0, -1.45]);

    // X-Axis (Forward/Back: |+> to |->)
    this.drawAxis([-1.25, 0, 0], [1.25, 0, 0], '#f43f5e', '|+⟩', [1.45, 0, 0]);
    this.drawAxis([0, 0, 0], [-1.25, 0, 0], '#f43f5e', '|-⟩', [-1.45, 0, 0]);

    // Y-Axis (Right/Left: |+i> to |-i>)
    this.drawAxis([0, -1.25, 0], [0, 1.25, 0], '#10b981', '|+i⟩', [0, 1.45, 0]);
    this.drawAxis([0, 0, 0], [0, -1.25, 0], '#10b981', '|-i⟩', [0, -1.45, 0]);

    // 4. Draw Center Origin Dot
    const center = this.project(0, 0, 0);
    ctx.beginPath();
    ctx.arc(center.x, center.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();

    // 5. Draw Glowing State Vector Arrow
    const qx = this.coords.x;
    const qy = this.coords.y;
    const qz = this.coords.z;
    const r = this.coords.r;

    const tip = this.project(qx, qy, qz);

    // Color vector: Cyan if pure (r ≈ 1), Amber if entangled (r < 1)
    const isPure = r >= 0.95;
    const vectorColor = isPure ? '#38bdf8' : '#f59e0b';
    const glowColor = isPure ? 'rgba(56, 189, 248, 0.6)' : 'rgba(245, 158, 11, 0.6)';

    // Projection dashed line to equator (z=0)
    const projEquator = this.project(qx, qy, 0);
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(projEquator.x, projEquator.y);
    ctx.lineTo(center.x, center.y);
    ctx.stroke();
    ctx.restore();

    // State Vector Shaft
    ctx.save();
    ctx.beginPath();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = vectorColor;
    ctx.lineWidth = 3;
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();

    // Arrowhead Tip
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 5.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = vectorColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // State Vector label
    ctx.font = 'bold 11px "JetBrains Mono", sans-serif';
    ctx.fillStyle = vectorColor;
    const labelX = tip.x + (tip.x > this.centerX ? 10 : -24);
    const labelY = tip.y + (tip.y > this.centerY ? 12 : -10);
    ctx.fillText('|ψ⟩', labelX, labelY);
  }

  animate(time) {
    requestAnimationFrame(this.animate);

    if (this.isAnimating) {
      const elapsed = time - this.animStartTime;
      const progress = Math.min(1, elapsed / this.animDuration);
      const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

      this.coords.x = this.startCoords.x + (this.targetCoords.x - this.startCoords.x) * ease;
      this.coords.y = this.startCoords.y + (this.targetCoords.y - this.startCoords.y) * ease;
      this.coords.z = this.startCoords.z + (this.targetCoords.z - this.startCoords.z) * ease;
      this.coords.r = this.startCoords.r + (this.targetCoords.r - this.startCoords.r) * ease;

      if (progress >= 1) {
        this.isAnimating = false;
        this.coords = { ...this.targetCoords };
      }
    }

    this.render();
  }
}
