/**
 * CircuitGrid.js - Interactive Drag-and-Drop Quantum Circuit Board
 * 
 * Features:
 * - Multi-wire timeline grid (Qubits q0...qn vs Time steps t0...tm)
 * - Single-qubit & Multi-qubit gates (CNOT, CZ, SWAP, Toffoli)
 * - Vertical entanglement connector rendering
 * - Step Playhead / Timeline Scrubber
 * - Dynamic qubit insertion and deletion
 */

import { QuantumCircuit } from '../core/QuantumCircuit.js';

export class CircuitGrid {
  /**
   * @param {HTMLElement} container - Container element
   * @param {Object} options
   * @param {Function} options.onChange - Callback fired on circuit modification
   * @param {Function} options.onStepChange - Callback fired when timeline scrub changes
   */
  constructor(container, options = {}) {
    this.container = container;
    this.onChange = options.onChange || (() => {});
    this.onStepChange = options.onStepChange || (() => {});

    this.numQubits = options.numQubits || 2;
    this.numCols = options.numCols || 8;
    this.currentStep = this.numCols;
    this.selectedGateType = 'h';

    this.grid = this.createEmptyGrid(this.numCols, this.numQubits);
    this.render();
  }

  createEmptyGrid(cols, wires) {
    const grid = [];
    for (let c = 0; c < cols; c++) {
      grid.push(new Array(wires).fill(null));
    }
    return grid;
  }

  loadPreset(preset) {
    this.numQubits = preset.numQubits;
    
    let maxCol = 7;
    for (const g of preset.gates) {
      if (g.col >= maxCol) maxCol = g.col + 1;
    }
    this.numCols = Math.max(8, maxCol);
    this.grid = this.createEmptyGrid(this.numCols, this.numQubits);

    for (const g of preset.gates) {
      if (g.wire < this.numQubits && g.col < this.numCols) {
        this.grid[g.col][g.wire] = {
          type: g.type,
          target: g.target !== undefined ? g.target : g.wire,
          control: g.control !== undefined ? g.control : null,
          params: g.params || []
        };
      }
    }

    this.currentStep = this.numCols;
    this.render();
    this.notifyChange();
  }

  compileToCircuit(maxColIndex = this.numCols) {
    const qc = new QuantumCircuit(this.numQubits, this.numQubits);
    const limit = Math.min(maxColIndex, this.numCols);

    for (let c = 0; c < limit; c++) {
      for (let w = 0; w < this.numQubits; w++) {
        const cell = this.grid[c][w];
        if (!cell) continue;

        const { type, params, control, target } = cell;

        switch (type) {
          case 'h': qc.h(w); break;
          case 'x': qc.x(w); break;
          case 'y': qc.y(w); break;
          case 'z': qc.z(w); break;
          case 's': qc.s(w); break;
          case 't': qc.t(w); break;
          case 'rx': qc.rx(w, params[0] || (Math.PI / 2)); break;
          case 'ry': qc.ry(w, params[0] || (Math.PI / 2)); break;
          case 'rz': qc.rz(w, params[0] || (Math.PI / 2)); break;
          
          case 'cx_target':
            if (control !== null && control < this.numQubits) {
              qc.cx(control, w);
            }
            break;
          case 'cz_target':
            if (control !== null && control < this.numQubits) {
              qc.cz(control, w);
            }
            break;
          case 'swap_a':
            if (target !== null && target < this.numQubits) {
              qc.swap(w, target);
            }
            break;
        }
      }
    }

    return qc;
  }

  notifyChange() {
    const fullCircuit = this.compileToCircuit(this.numCols);
    const stepCircuit = this.compileToCircuit(this.currentStep);
    this.onChange(fullCircuit, stepCircuit, this.currentStep);
  }

  setStep(step) {
    this.currentStep = Math.max(0, Math.min(this.numCols, step));
    this.updatePlayheadVisuals();
    const stepCircuit = this.compileToCircuit(this.currentStep);
    this.onStepChange(stepCircuit, this.currentStep);
  }

  handleCellClick(col, wire) {
    const current = this.grid[col][wire];

    if (current) {
      if (current.type === 'cx_ctrl' && current.target !== undefined) {
        this.grid[col][current.target] = null;
      } else if (current.type === 'cx_target' && current.control !== undefined) {
        this.grid[col][current.control] = null;
      } else if (current.type === 'cz_ctrl' && current.target !== undefined) {
        this.grid[col][current.target] = null;
      } else if (current.type === 'cz_target' && current.control !== undefined) {
        this.grid[col][current.control] = null;
      }
      this.grid[col][wire] = null;
    } else {
      if (this.selectedGateType === 'cx') {
        const targetWire = (wire + 1) % this.numQubits;
        this.grid[col][wire] = { type: 'cx_ctrl', target: targetWire };
        this.grid[col][targetWire] = { type: 'cx_target', control: wire };
      } else if (this.selectedGateType === 'cz') {
        const targetWire = (wire + 1) % this.numQubits;
        this.grid[col][wire] = { type: 'cz_ctrl', target: targetWire };
        this.grid[col][targetWire] = { type: 'cz_target', control: wire };
      } else {
        this.grid[col][wire] = { type: this.selectedGateType, target: wire, params: [] };
      }
    }

    this.render();
    this.notifyChange();
  }

  addQubit() {
    if (this.numQubits >= 5) return;
    this.numQubits++;
    for (let c = 0; c < this.numCols; c++) {
      this.grid[c].push(null);
    }
    this.render();
    this.notifyChange();
  }

  removeQubit() {
    if (this.numQubits <= 1) return;
    this.numQubits--;
    for (let c = 0; c < this.numCols; c++) {
      this.grid[c].pop();
    }
    this.render();
    this.notifyChange();
  }

  clear() {
    this.grid = this.createEmptyGrid(this.numCols, this.numQubits);
    this.currentStep = this.numCols;
    this.render();
    this.notifyChange();
  }

  updatePlayheadVisuals() {
    const playhead = this.container.querySelector('.grid-playhead');
    const cols = this.container.querySelectorAll('.circuit-col');
    if (!playhead) return;

    if (this.currentStep === 0) {
      playhead.style.left = '48px';
    } else if (cols[this.currentStep - 1]) {
      const colEl = cols[this.currentStep - 1];
      playhead.style.left = `${colEl.offsetLeft + colEl.offsetWidth}px`;
    }
  }

  render() {
    this.container.innerHTML = '';

    const gridWrapper = document.createElement('div');
    gridWrapper.className = 'circuit-grid-wrapper';

    const headersCol = document.createElement('div');
    headersCol.className = 'wire-headers-col';

    for (let w = 0; w < this.numQubits; w++) {
      const header = document.createElement('div');
      header.className = 'wire-header';
      header.innerHTML = `<span class="qubit-name">q<sub>${w}</sub></span> <span class="qubit-init">|0⟩</span>`;
      headersCol.appendChild(header);
    }
    gridWrapper.appendChild(headersCol);

    const gridColumnsContainer = document.createElement('div');
    gridColumnsContainer.className = 'circuit-columns-container';

    for (let w = 0; w < this.numQubits; w++) {
      const wireLine = document.createElement('div');
      wireLine.className = 'wire-line';
      wireLine.style.top = `${w * 64 + 32}px`;
      gridColumnsContainer.appendChild(wireLine);
    }

    const playhead = document.createElement('div');
    playhead.className = 'grid-playhead';
    gridColumnsContainer.appendChild(playhead);

    for (let c = 0; c < this.numCols; c++) {
      const colEl = document.createElement('div');
      colEl.className = `circuit-col ${c >= this.currentStep ? 'dimmed' : ''}`;
      colEl.dataset.col = c;

      this.renderConnectorLines(colEl, c);

      for (let w = 0; w < this.numQubits; w++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'grid-cell';
        cellEl.dataset.col = c;
        cellEl.dataset.wire = w;

        const gateData = this.grid[c][w];
        if (gateData) {
          cellEl.appendChild(this.createGateElement(gateData));
        }

        cellEl.addEventListener('click', () => this.handleCellClick(c, w));
        colEl.appendChild(cellEl);
      }

      gridColumnsContainer.appendChild(colEl);
    }

    gridWrapper.appendChild(gridColumnsContainer);
    this.container.appendChild(gridWrapper);

    this.updatePlayheadVisuals();
  }

  renderConnectorLines(colEl, c) {
    for (let w = 0; w < this.numQubits; w++) {
      const cell = this.grid[c][w];
      if (cell && (cell.type === 'cx_ctrl' || cell.type === 'cz_ctrl') && cell.target !== undefined) {
        const minWire = Math.min(w, cell.target);
        const maxWire = Math.max(w, cell.target);
        
        const line = document.createElement('div');
        line.className = 'cx-vertical-line';
        line.style.top = `${minWire * 64 + 32}px`;
        line.style.height = `${(maxWire - minWire) * 64}px`;
        colEl.appendChild(line);
      }
    }
  }

  createGateElement(gate) {
    const el = document.createElement('div');
    el.className = `placed-gate gate-type-${gate.type}`;

    switch (gate.type) {
      case 'cx_ctrl':
      case 'cz_ctrl':
        el.className += ' gate-ctrl-dot';
        el.innerHTML = '●';
        break;
      case 'cx_target':
        el.className += ' gate-cx-target';
        el.innerHTML = '⊕';
        break;
      case 'cz_target':
        el.className += ' gate-cz-target';
        el.innerHTML = 'Z';
        break;
      default:
        el.textContent = gate.type.toUpperCase();
    }

    return el;
  }
}
