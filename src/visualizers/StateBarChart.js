/**
 * StateBarChart.js - Live Real-Time Probability Histogram & City Plot
 */

export class StateBarChart {
  /**
   * @param {HTMLElement} container - DOM container element
   */
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const width = this.container.clientWidth || 360;
    const height = this.container.clientHeight || 180;
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(this.dpr, this.dpr);
    this.width = width;
    this.height = height;
  }

  /**
   * Render probability histogram
   * @param {QuantumState} state - QuantumState instance
   */
  render(state) {
    const probs = state.getProbabilities();
    const numStates = state.dim;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const margin = { top: 20, right: 15, bottom: 40, left: 35 };
    const chartWidth = this.width - margin.left - margin.right;
    const chartHeight = this.height - margin.top - margin.bottom;

    // Draw horizontal grid lines (0%, 25%, 50%, 75%, 100%)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';

    for (let p = 0; p <= 1.0; p += 0.25) {
      const y = margin.top + chartHeight * (1 - p);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      ctx.fillText(`${(p * 100).toFixed(0)}%`, margin.left - 6, y + 3);
    }

    const barWidth = Math.max(8, Math.min(48, (chartWidth / numStates) * 0.7));
    const spacing = chartWidth / numStates;

    for (let k = 0; k < numStates; k++) {
      const p = probs[k];
      const x = margin.left + spacing * k + (spacing - barWidth) / 2;
      const barH = chartHeight * p;
      const y = margin.top + chartHeight - barH;

      // Draw Gradient Bar
      const grad = ctx.createLinearGradient(0, y, 0, margin.top + chartHeight);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(1, '#0284c7');

      ctx.fillStyle = p > 0.001 ? grad : 'rgba(56, 189, 248, 0.05)';
      ctx.fillRect(x, y, barWidth, barH);

      // Top Highlight Line
      if (p > 0.001) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, barWidth, 2);
      }

      // X-Axis Basis State Label
      const bitstring = k.toString(2).padStart(state.numQubits, '0');
      ctx.fillStyle = p > 0.05 ? '#38bdf8' : '#64748b';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`|${bitstring}>`, x + barWidth / 2, this.height - margin.bottom + 16);

      // Percentage above bar
      if (p > 0.02) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${(p * 100).toFixed(0)}%`, x + barWidth / 2, y - 6);
      }
    }
  }
}
