/**
 * Complex.js - High-Precision Complex Number Library for Quantum Simulation
 * 
 * In quantum mechanics, state amplitudes are complex numbers: z = a + bi
 * This class handles addition, subtraction, multiplication, division,
 * magnitude squared (probability), complex conjugate, and polar conversions.
 */

export class Complex {
  /**
   * @param {number} real - Real component (a)
   * @param {number} imag - Imaginary component (b)
   */
  constructor(real = 0, imag = 0) {
    this.real = real;
    this.imag = imag;
  }

  /**
   * Creates a complex number from polar coordinates: r * e^(i * theta)
   * @param {number} r - Magnitude / radius
   * @param {number} theta - Phase angle in radians
   */
  static fromPolar(r, theta) {
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
  }

  /** Zero complex number 0 + 0i */
  static zero() {
    return new Complex(0, 0);
  }

  /** One complex number 1 + 0i */
  static one() {
    return new Complex(1, 0);
  }

  /** Imaginary unit 0 + 1i */
  static i() {
    return new Complex(0, 1);
  }

  /** Clone this complex number */
  clone() {
    return new Complex(this.real, this.imag);
  }

  /** Addition: (a + bi) + (c + di) = (a + c) + (b + d)i */
  add(other) {
    return new Complex(this.real + other.real, this.imag + other.imag);
  }

  /** Subtraction: (a + bi) - (c + di) = (a - c) + (b - d)i */
  sub(other) {
    return new Complex(this.real - other.real, this.imag - other.imag);
  }

  /** 
   * Multiplication: (a + bi) * (c + di) = (ac - bd) + (ad + bc)i
   */
  mul(other) {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }

  /** Scalar multiplication */
  scale(scalar) {
    return new Complex(this.real * scalar, this.imag * scalar);
  }

  /** Complex conjugate: (a + bi)* = a - bi */
  conj() {
    return new Complex(this.real, -this.imag);
  }

  /** Magnitude: |z| = sqrt(a^2 + b^2) */
  abs() {
    return Math.hypot(this.real, this.imag);
  }

  /** 
   * Magnitude squared (Probability): |z|^2 = a^2 + b^2
   * In quantum mechanics, Born's rule states P = |amplitude|^2
   */
  absSq() {
    return this.real * this.real + this.imag * this.imag;
  }

  /** Phase / Argument: theta = atan2(b, a) in radians [-pi, pi] */
  phase() {
    return Math.atan2(this.imag, this.real);
  }

  /** Division: z1 / z2 */
  div(other) {
    const denom = other.absSq();
    if (denom === 0) throw new Error("Division by zero in Complex.div");
    return new Complex(
      (this.real * other.real + this.imag * other.imag) / denom,
      (this.imag * other.real - this.real * other.imag) / denom
    );
  }

  /** Formatting for display: e.g. "0.707 + 0.707i" */
  toString(precision = 4) {
    const r = Number(this.real.toFixed(precision));
    const i = Number(this.imag.toFixed(precision));
    
    if (i === 0) return `${r}`;
    if (r === 0) return `${i === 1 ? '' : i === -1 ? '-' : i}i`;
    const sign = i > 0 ? '+' : '-';
    const absI = Math.abs(i);
    return `${r} ${sign} ${absI === 1 ? '' : absI}i`;
  }
}
