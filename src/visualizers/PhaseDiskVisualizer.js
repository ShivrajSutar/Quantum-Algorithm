/**
 * PhaseDiskVisualizer.js - Complex Phase & Multi-Qubit Amplitude Visualizer
 * 
 * For each basis state |00...0> to |11...1>:
 * - Renders a circle where radius = sqrt(Probability) = |amplitude|
 * - Inside the circle, a phasor hand points to phase angle phi
 * - Colored with a continuous HSL phase hue:
 *   - 0 rad (Real positive) -> Cyan / Blue
 *   - pi/2 rad (+i)        -> Green
 *   - pi rad (Real negative) -> Red / Magenta
 *   - -pi/2 rad (-i)       -> Purple
 */

export class PhaseDiskVisualizer {
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
   * Converts complex phase angle in [-pi, pi] to a vivid HSL color
   */
  static phaseToColor(phase, alpha = 1.0) {
    let deg = (phase * 180 / Math.PI);
    if (deg < 0) deg += 360;
    return `hsla(${deg}, 85%, 60%, ${alpha})`;
  }

  /**
   * Render statevector phase discs
   * @param {QuantumState} state - QuantumState instance
   */
  render(state) {
    const numStates = state.dim;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const margin = 20;
    const availableWidth = this.width - margin * 2;
    const diskRadius = Math.min(32, Math.max(16, (availableWidth / numStates) * 0.38));
    const spacing = availableWidth / numStates;
    const centerY = this.height / 2 - 8;

    for (let k = 0; k < numStates; k++) {
      const real = state.real[k];
      const imag = state.imag[k];
      const magSq = real * real + imag * imag; // Probability
      const mag = Math.sqrt(magSq);            // Amplitude magnitude
      const phase = Math.atan2(imag, real);    // Phase angle

      const cx = margin + spacing * k + spacing / 2;
      const cy = centerY;

      // 1. Outer boundary disk ring
      ctx.beginPath();
      ctx.arc(cx, cy, diskRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (mag > 0.001) {
        const fillRadius = diskRadius * mag;
        const color = PhaseDiskVisualizer.phaseToColor(phase, 0.85);

        // 2. Filled magnitude circle
        ctx.beginPath();
        ctx.arc(cx, cy, fillRadius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 3. Phase clock pointer line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const pointerX = cx + fillRadius * Math.cos(-phase);
        const pointerY = cy + fillRadius * Math.sin(-phase);
        ctx.lineTo(pointerX, pointerY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Center hub dot
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // 4. Basis state label e.g. |00>, |01>
      const bitstring = k.toString(2).padStart(state.numQubits, '0');
      ctx.fillStyle = magSq > 0.05 ? '#38bdf8' : '#64748b';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`|${bitstring}>`, cx, cy + diskRadius + 18);

      // 5. Probability percentage
      ctx.fillStyle = magSq > 0.05 ? '#f8fafc' : '#475569';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${(magSq * 100).toFixed(0)}%`, cx, cy + diskRadius + 32);
    }
  }
}
