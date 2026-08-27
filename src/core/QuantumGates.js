/**
 * QuantumGates.js - Standard and Parametric Quantum Gates
 * 
 * Every quantum gate is a Unitary Matrix (U^dag * U = I).
 * For 1-qubit gates, matrices are 2x2: [[u00, u01], [u10, u11]]
 */

import { Complex } from './Complex.js';

const INV_SQRT2 = 1 / Math.SQRT2;

export class QuantumGates {
  // ==========================================
  // 1-QUBIT STANDARD GATES
  // ==========================================

  /** Identity Gate: I = [[1, 0], [0, 1]] */
  static I = [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(1, 0)]
  ];

  /** Pauli-X (Quantum NOT / Bit Flip): X = [[0, 1], [1, 0]] */
  static X = [
    [new Complex(0, 0), new Complex(1, 0)],
    [new Complex(1, 0), new Complex(0, 0)]
  ];

  /** Pauli-Y Gate: Y = [[0, -i], [i, 0]] */
  static Y = [
    [new Complex(0, 0), new Complex(0, -1)],
    [new Complex(0, 1), new Complex(0, 0)]
  ];

  /** Pauli-Z Gate (Phase Flip): Z = [[1, 0], [0, -1]] */
  static Z = [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(-1, 0)]
  ];

  /** 
   * Hadamard Gate: H = (1/sqrt(2)) * [[1, 1], [1, -1]]
   * Creates equal superposition: H|0> = |+>, H|1> = |->
   */
  static H = [
    [new Complex(INV_SQRT2, 0), new Complex(INV_SQRT2, 0)],
    [new Complex(INV_SQRT2, 0), new Complex(-INV_SQRT2, 0)]
  ];

  /** S Gate (Phase Gate pi/2): S = [[1, 0], [0, i]] */
  static S = [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, 1)]
  ];

  /** S-Dagger Gate (-pi/2): Sdag = [[1, 0], [0, -i]] */
  static Sdag = [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(0, -1)]
  ];

  /** T Gate (pi/4 Phase): T = [[1, 0], [0, e^(i*pi/4)]] */
  static T = [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(INV_SQRT2, INV_SQRT2)]
  ];

  /** T-Dagger Gate (-pi/4 Phase): Tdag = [[1, 0], [0, e^(-i*pi/4)]] */
  static Tdag = [
    [new Complex(1, 0), new Complex(0, 0)],
    [new Complex(0, 0), new Complex(INV_SQRT2, -INV_SQRT2)]
  ];

  // ==========================================
  // 1-QUBIT PARAMETRIC ROTATION GATES
  // ==========================================

  /**
   * Rx(theta) - Rotation around X-axis by theta radians
   * Rx(theta) = [[cos(theta/2), -i*sin(theta/2)], [-i*sin(theta/2), cos(theta/2)]]
   */
  static Rx(theta) {
    const half = theta / 2;
    const c = Math.cos(half);
    const s = Math.sin(half);
    return [
      [new Complex(c, 0), new Complex(0, -s)],
      [new Complex(0, -s), new Complex(c, 0)]
    ];
  }

  /**
   * Ry(theta) - Rotation around Y-axis by theta radians
   * Ry(theta) = [[cos(theta/2), -sin(theta/2)], [sin(theta/2), cos(theta/2)]]
   */
  static Ry(theta) {
    const half = theta / 2;
    const c = Math.cos(half);
    const s = Math.sin(half);
    return [
      [new Complex(c, 0), new Complex(-s, 0)],
      [new Complex(s, 0), new Complex(c, 0)]
    ];
  }

  /**
   * Rz(theta) - Rotation around Z-axis by theta radians
   * Rz(theta) = [[e^(-i*theta/2), 0], [0, e^(i*theta/2)]]
   */
  static Rz(theta) {
    const half = theta / 2;
    return [
      [Complex.fromPolar(1, -half), new Complex(0, 0)],
      [new Complex(0, 0), Complex.fromPolar(1, half)]
    ];
  }

  /**
   * Phase Shift Gate: P(lambda) = [[1, 0], [0, e^(i*lambda)]]
   */
  static Phase(lambda) {
    return [
      [new Complex(1, 0), new Complex(0, 0)],
      [new Complex(0, 0), Complex.fromPolar(1, lambda)]
    ];
  }

  /**
   * General Single-Qubit Unitary Gate U3(theta, phi, lambda)
   */
  static U3(theta, phi, lambda) {
    const half = theta / 2;
    const c = Math.cos(half);
    const s = Math.sin(half);
    return [
      [new Complex(c, 0), Complex.fromPolar(-s, lambda)],
      [Complex.fromPolar(s, phi), Complex.fromPolar(c, phi + lambda)]
    ];
  }
}
