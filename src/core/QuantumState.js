/**
 * QuantumState.js - High-Performance N-Qubit Statevector Simulator
 * 
 * Manages the 2^n complex amplitude vector. Uses flat Float64Arrays
 * for optimal V8 engine performance, zero memory fragmentation, and 60fps rendering.
 */

import { Complex } from './Complex.js';

export class QuantumState {
  /**
   * @param {number} numQubits - Number of qubits (1 to 14 recommended for client-side)
   */
  constructor(numQubits = 1) {
    if (numQubits < 1 || numQubits > 16) {
      throw new Error(`Invalid qubit count: ${numQubits}. Supported range: 1 to 16.`);
    }
    this.numQubits = numQubits;
    this.dim = 1 << numQubits; // 2^n dimension

    // Flat arrays for real and imaginary parts of amplitudes
    this.real = new Float64Array(this.dim);
    this.imag = new Float64Array(this.dim);

    this.reset();
  }

  /**
   * Initializes the state to |00...0>
   * Amplitude for index 0 is 1.0 + 0i, all other amplitudes are 0.
   */
  reset() {
    this.real.fill(0);
    this.imag.fill(0);
    this.real[0] = 1.0;
  }

  /**
   * Clone the current quantum state
   */
  clone() {
    const copy = new QuantumState(this.numQubits);
    copy.real.set(this.real);
    copy.imag.set(this.imag);
    return copy;
  }

  /**
   * Returns the amplitude at index k as a Complex object
   */
  getAmplitude(index) {
    return new Complex(this.real[index], this.imag[index]);
  }

  /**
   * Sets the amplitude at index k
   */
  setAmplitude(index, complexVal) {
    this.real[index] = complexVal.real;
    this.imag[index] = complexVal.imag;
  }

  /**
   * Applies a 2x2 Unitary Gate to a single target qubit.
   * 
   * MATHEMATICAL ALGORITHM (O(2^n) time):
   * For target qubit q, basis states are grouped into pairs (i0, i1)
   * where i0 has bit q = 0 and i1 has bit q = 1 (separated by 2^q).
   * 
   * [v0'] = [u00  u01] [v0]
   * [v1'] = [u10  u11] [v1]
   * 
   * @param {Array<Array<Complex>>} matrix - 2x2 Unitary Matrix
   * @param {number} targetQubit - 0-indexed qubit index
   */
  apply1QubitGate(matrix, targetQubit) {
    const u00 = matrix[0][0];
    const u01 = matrix[0][1];
    const u10 = matrix[1][0];
    const u11 = matrix[1][1];

    const step = 1 << targetQubit;       // 2^q
    const doubleStep = step << 1;        // 2^(q+1)

    for (let i = 0; i < this.dim; i += doubleStep) {
      for (let j = 0; j < step; j++) {
        const i0 = i + j;
        const i1 = i0 + step;

        const r0 = this.real[i0];
        const m0 = this.imag[i0];
        const r1 = this.real[i1];
        const m1 = this.imag[i1];

        // v0' = u00 * v0 + u01 * v1
        const new_r0 = (u00.real * r0 - u00.imag * m0) + (u01.real * r1 - u01.imag * m1);
        const new_m0 = (u00.real * m0 + u00.imag * r0) + (u01.real * m1 + u01.imag * r1);

        // v1' = u10 * v0 + u11 * v1
        const new_r1 = (u10.real * r0 - u10.imag * m0) + (u11.real * r1 - u11.imag * m1);
        const new_m1 = (u10.real * m0 + u10.imag * r0) + (u11.real * m1 + u11.imag * r1);

        this.real[i0] = new_r0;
        this.imag[i0] = new_m0;
        this.real[i1] = new_r1;
        this.imag[i1] = new_m1;
      }
    }
  }

  /**
   * Applies a Controlled 1-Qubit Gate.
   * Transforms target qubit ONLY when control qubit is |1>.
   * 
   * @param {Array<Array<Complex>>} matrix - 2x2 Unitary matrix
   * @param {number} controlQubit - Control qubit index
   * @param {number} targetQubit - Target qubit index
   */
  applyControlled1QubitGate(matrix, controlQubit, targetQubit) {
    if (controlQubit === targetQubit) {
      throw new Error("Control and target qubits cannot be the same.");
    }

    const u00 = matrix[0][0];
    const u01 = matrix[0][1];
    const u10 = matrix[1][0];
    const u11 = matrix[1][1];

    const controlMask = 1 << controlQubit;
    const targetStep = 1 << targetQubit;
    const doubleTargetStep = targetStep << 1;

    for (let i = 0; i < this.dim; i += doubleTargetStep) {
      for (let j = 0; j < targetStep; j++) {
        const i0 = i + j;
        const i1 = i0 + targetStep;

        // Apply transformation only if the control bit is 1
        if ((i0 & controlMask) !== 0) {
          const r0 = this.real[i0];
          const m0 = this.imag[i0];
          const r1 = this.real[i1];
          const m1 = this.imag[i1];

          this.real[i0] = (u00.real * r0 - u00.imag * m0) + (u01.real * r1 - u01.imag * m1);
          this.imag[i0] = (u00.real * m0 + u00.imag * r0) + (u01.real * m1 + u01.imag * r1);

          this.real[i1] = (u10.real * r0 - u10.imag * m0) + (u11.real * r1 - u11.imag * m1);
          this.imag[i1] = (u10.real * m0 + u10.imag * r0) + (u11.real * m1 + u11.imag * r1);
        }
      }
    }
  }

  /**
   * Applies CNOT (Controlled-NOT / CX)
   * Flips target qubit if control qubit is 1.
   */
  applyCNOT(controlQubit, targetQubit) {
    const controlMask = 1 << controlQubit;
    const targetMask = 1 << targetQubit;

    for (let i = 0; i < this.dim; i++) {
      // Look at pairs where control is 1 and target is 0
      if ((i & controlMask) !== 0 && (i & targetMask) === 0) {
        const j = i | targetMask; // Paired index where target is 1

        // Swap amplitudes
        const tmpR = this.real[i];
        const tmpM = this.imag[i];
        this.real[i] = this.real[j];
        this.imag[i] = this.imag[j];
        this.real[j] = tmpR;
        this.imag[j] = tmpM;
      }
    }
  }

  /**
   * Applies CZ (Controlled-Z / Phase Flip)
   * Multiplies amplitude by -1 if both control and target are 1.
   */
  applyCZ(controlQubit, targetQubit) {
    const mask = (1 << controlQubit) | (1 << targetQubit);
    for (let i = 0; i < this.dim; i++) {
      if ((i & mask) === mask) {
        this.real[i] = -this.real[i];
        this.imag[i] = -this.imag[i];
      }
    }
  }

  /**
   * Applies SWAP gate between two qubits
   */
  applySWAP(qubitA, qubitB) {
    if (qubitA === qubitB) return;
    const maskA = 1 << qubitA;
    const maskB = 1 << qubitB;

    for (let i = 0; i < this.dim; i++) {
      // Only swap when bit A and bit B differ (e.g. 01 and 10)
      const bitA = (i & maskA) !== 0;
      const bitB = (i & maskB) !== 0;
      if (bitA && !bitB) {
        const j = (i ^ maskA) | maskB;
        const tmpR = this.real[i];
        const tmpM = this.imag[i];
        this.real[i] = this.real[j];
        this.imag[i] = this.imag[j];
        this.real[j] = tmpR;
        this.imag[j] = tmpM;
      }
    }
  }

  /**
   * Applies Toffoli (CCNOT) Gate
   * Flips target if and only if both control1 and control2 are 1.
   */
  applyToffoli(control1, control2, target) {
    const cMask = (1 << control1) | (1 << control2);
    const targetMask = 1 << target;

    for (let i = 0; i < this.dim; i++) {
      if ((i & cMask) === cMask && (i & targetMask) === 0) {
        const j = i | targetMask;
        const tmpR = this.real[i];
        const tmpM = this.imag[i];
        this.real[i] = this.real[j];
        this.imag[i] = this.imag[j];
        this.real[j] = tmpR;
        this.imag[j] = tmpM;
      }
    }
  }

  /**
   * Returns exact theoretical probability distribution for all 2^n basis states
   * P(k) = |c_k|^2 = real[k]^2 + imag[k]^2
   */
  getProbabilities() {
    const probs = new Float64Array(this.dim);
    for (let i = 0; i < this.dim; i++) {
      probs[i] = this.real[i] * this.real[i] + this.imag[i] * this.imag[i];
    }
    return probs;
  }

  /**
   * Calculates the 3D Bloch Sphere Coordinates (x, y, z, theta, phi, purity)
   * for an individual qubit by calculating its Reduced Density Matrix (Partial Trace).
   * 
   * MATHEMATICAL FORMULAS:
   * rho00 = sum |c_k|^2  for k where bit q = 0
   * rho11 = sum |c_k|^2  for k where bit q = 1
   * rho01 = sum c_k * c_(k ^ 2^q)*  for k where bit q = 0
   * 
   * Bloch vector:
   * x = 2 * Re(rho01)
   * y = -2 * Imag(rho01)
   * z = rho00 - rho11
   */
  getBlochCoordinates(targetQubit) {
    const mask = 1 << targetQubit;
    let rho00 = 0;
    let rho11 = 0;
    let rho01_real = 0;
    let rho01_imag = 0;

    for (let i0 = 0; i0 < this.dim; i0++) {
      if ((i0 & mask) === 0) {
        const i1 = i0 | mask;

        const r0 = this.real[i0];
        const m0 = this.imag[i0];
        const r1 = this.real[i1];
        const m1 = this.imag[i1];

        // Diagonal elements
        rho00 += r0 * r0 + m0 * m0;
        rho11 += r1 * r1 + m1 * m1;

        // Off-diagonal element: c0 * conj(c1) = (r0 + m0*i) * (r1 - m1*i)
        // = (r0*r1 + m0*m1) + (m0*r1 - r0*m1)i
        rho01_real += (r0 * r1 + m0 * m1);
        rho01_imag += (m0 * r1 - r0 * m1);
      }
    }

    const x = 2 * rho01_real;
    const y = -2 * rho01_imag;
    const z = rho00 - rho11;

    // Radius / Purity: 1.0 for pure state, < 1.0 if entangled/mixed
    const r = Math.sqrt(x * x + y * y + z * z);
    
    // Polar angle theta [0, pi]
    const clampedZ = r > 1e-7 ? Math.max(-1, Math.min(1, z / r)) : 0;
    const theta = Math.acos(clampedZ);

    // Azimuthal angle phi [-pi, pi]
    const phi = Math.atan2(y, x);

    return {
      x, y, z,
      r,
      theta,
      phi,
      isEntangled: r < 0.999 // If length < 1, qubit is entangled with others
    };
  }

  /**
   * Measures a single qubit, collapsing the statevector according to the Born rule.
   * Returns measurement outcome: 0 or 1.
   */
  measureQubit(targetQubit, rng = Math.random) {
    const mask = 1 << targetQubit;
    let prob0 = 0;

    for (let i = 0; i < this.dim; i++) {
      if ((i & mask) === 0) {
        prob0 += this.real[i] * this.real[i] + this.imag[i] * this.imag[i];
      }
    }

    const outcome = rng() < prob0 ? 0 : 1;
    const norm = Math.sqrt(outcome === 0 ? prob0 : (1 - prob0));

    if (norm < 1e-12) {
      return outcome;
    }

    // Collapse and renormalize state
    const targetBitMask = outcome === 0 ? 0 : mask;
    for (let i = 0; i < this.dim; i++) {
      if ((i & mask) === targetBitMask) {
        this.real[i] /= norm;
        this.imag[i] /= norm;
      } else {
        this.real[i] = 0;
        this.imag[i] = 0;
      }
    }

    return outcome;
  }

  /**
   * Non-destructively sample measurement outcomes over N shots (Monte Carlo).
   * Returns count dictionary: { '00': 512, '11': 512 }
   */
  sample(shots = 1024, rng = Math.random) {
    const probs = this.getProbabilities();
    const counts = {};

    // Build cumulative distribution function (CDF)
    const cdf = new Float64Array(this.dim);
    let accum = 0;
    for (let i = 0; i < this.dim; i++) {
      accum += probs[i];
      cdf[i] = accum;
    }

    for (let s = 0; s < shots; s++) {
      const r = rng();
      let low = 0, high = this.dim - 1;
      let outcomeIndex = high;
      while (low <= high) {
        const mid = (low + high) >> 1;
        if (r <= cdf[mid]) {
          outcomeIndex = mid;
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      const bitstring = outcomeIndex.toString(2).padStart(this.numQubits, '0');
      counts[bitstring] = (counts[bitstring] || 0) + 1;
    }

    return counts;
  }
}
