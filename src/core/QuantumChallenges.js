/**
 * QuantumChallenges.js - Structured Gamified Challenges, Solution Circuits & Auto-Grading Suite
 */

import { Complex } from './Complex.js';

export const QuantumChallenges = [
  {
    id: 'lvl1_superposition',
    level: 1,
    title: 'Superposition Pioneer',
    numQubits: 1,
    maxGates: 1,
    description: 'Transform qubit q0 from the ground state |0⟩ into the equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2.',
    hints: [
      'Think about which gate creates an equal 50/50 superposition from |0⟩.',
      'The Hadamard (H) gate rotates the state vector from the North Pole to the Equator (+X axis).'
    ],
    solutionExplanation: 'Applying a Hadamard (H) gate to |0⟩ rotates the Bloch vector by 180° around the (X+Z)/√2 axis, landing exactly on the equator (+X axis) with state |+⟩.',
    solutionGates: [
      { col: 0, wire: 0, type: 'h' }
    ],
    targetState: [
      new Complex(1 / Math.SQRT2, 0),
      new Complex(1 / Math.SQRT2, 0)
    ]
  },

  {
    id: 'lvl2_phase_shift',
    level: 2,
    title: 'The Complex Phase Shifter',
    numQubits: 1,
    maxGates: 3,
    description: 'Transform |0⟩ into the state |-i⟩ = (|0⟩ - i|1⟩)/√2 on the equator of the Bloch sphere.',
    hints: [
      'First create equal superposition with an H gate.',
      'Then apply a phase rotation around the Z-axis (like S, Z, or S†) to rotate the phase to -π/2 (-90°).'
    ],
    solutionExplanation: 'Step 1: H creates (|0⟩ + |1⟩)/√2. Step 2: S rotates phase to +i. Step 3: Z inverts the phase to -i, resulting in |-i⟩ = (|0⟩ - i|1⟩)/√2.',
    solutionGates: [
      { col: 0, wire: 0, type: 'h' },
      { col: 1, wire: 0, type: 's' },
      { col: 2, wire: 0, type: 'z' }
    ],
    targetState: [
      new Complex(1 / Math.SQRT2, 0),
      new Complex(0, -1 / Math.SQRT2)
    ]
  },

  {
    id: 'lvl3_bell_singlet',
    level: 3,
    title: 'The Singlet Bell State',
    numQubits: 2,
    maxGates: 4,
    description: 'Create the maximally entangled Singlet State |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2.',
    hints: [
      'Start by flipping both qubits with X gates or creating a standard Bell state.',
      'A combination of X, H, and CNOT will generate the anti-correlated entangled state.'
    ],
    solutionExplanation: '1) Apply X to q0 and q1 (|11⟩). 2) Apply H to q0. 3) Apply CNOT(q0 → q1). This produces the Singlet Bell state (|01⟩ - |10⟩)/√2.',
    solutionGates: [
      { col: 0, wire: 0, type: 'x' },
      { col: 0, wire: 1, type: 'x' },
      { col: 1, wire: 0, type: 'h' },
      { col: 2, wire: 0, type: 'cx_ctrl', target: 1 },
      { col: 2, wire: 1, type: 'cx_target', control: 0 }
    ],
    targetState: [
      new Complex(0, 0),
      new Complex(1 / Math.SQRT2, 0),
      new Complex(-1 / Math.SQRT2, 0),
      new Complex(0, 0)
    ]
  },

  {
    id: 'lvl4_ghz_state',
    level: 4,
    title: '3-Qubit GHZ Entanglement',
    numQubits: 3,
    maxGates: 3,
    description: 'Entangle 3 qubits into the GHZ state (|000⟩ + |111⟩)/√2 using only 3 gates!',
    hints: [
      'Apply H to qubit q0 first.',
      'Cascade entanglement using two CNOT gates: q0 -> q1, then q1 -> q2.'
    ],
    solutionExplanation: '1) H on q0 creates (|000⟩ + |100⟩)/√2. 2) CNOT(q0 → q1) entangles q1 to form (|000⟩ + |110⟩)/√2. 3) CNOT(q1 → q2) entangles q2, completing the 3-qubit GHZ state (|000⟩ + |111⟩)/√2.',
    solutionGates: [
      { col: 0, wire: 0, type: 'h' },
      { col: 1, wire: 0, type: 'cx_ctrl', target: 1 },
      { col: 1, wire: 1, type: 'cx_target', control: 0 },
      { col: 2, wire: 1, type: 'cx_ctrl', target: 2 },
      { col: 2, wire: 2, type: 'cx_target', control: 1 }
    ],
    targetState: [
      new Complex(1 / Math.SQRT2, 0),
      new Complex(0, 0),
      new Complex(0, 0),
      new Complex(0, 0),
      new Complex(0, 0),
      new Complex(0, 0),
      new Complex(0, 0),
      new Complex(1 / Math.SQRT2, 0)
    ]
  },

  {
    id: 'lvl5_cnot_swap',
    level: 5,
    title: 'The 3-CNOT SWAP Theorem',
    numQubits: 2,
    maxGates: 3,
    description: 'Did you know you can SWAP the states of two qubits using ONLY 3 CNOT gates? Construct the circuit!',
    hints: [
      'You need 3 CNOT gates with alternating control and target wires.',
      'Pattern: CNOT(0->1), CNOT(1->0), CNOT(0->1).'
    ],
    solutionExplanation: 'Applying 3 alternating CNOT gates (CNOT 0→1, CNOT 1→0, CNOT 0→1) mathematically performs a perfect state interchange (SWAP) between the two qubits with zero additional gates!',
    solutionGates: [
      { col: 0, wire: 0, type: 'cx_ctrl', target: 1 },
      { col: 0, wire: 1, type: 'cx_target', control: 0 },
      { col: 1, wire: 1, type: 'cx_ctrl', target: 0 },
      { col: 1, wire: 0, type: 'cx_target', control: 1 },
      { col: 2, wire: 0, type: 'cx_ctrl', target: 1 },
      { col: 2, wire: 1, type: 'cx_target', control: 0 }
    ],
    isStructural: true,
    requiredPattern: ['cx(0,1)', 'cx(1,0)', 'cx(0,1)']
  },

  {
    id: 'lvl6_oracle_inversion',
    level: 6,
    title: "Grover's Oracle (Target |10⟩)",
    numQubits: 2,
    maxGates: 5,
    description: 'Construct a 2-qubit phase oracle that flips the phase of ONLY the state |10⟩ from + to -.',
    hints: [
      'Standard CZ flips the phase of |11⟩.',
      'To flip |10⟩ instead of |11⟩, invert qubit q0 with X gates before and after the CZ!'
    ],
    solutionExplanation: '1) Prepare superposition with H on q0 and q1. 2) Apply X on q0. 3) Apply CZ(q0 → q1). 4) Apply X on q0. This inverts the phase of only |10⟩ while leaving |00⟩, |01⟩, and |11⟩ positive!',
    solutionGates: [
      { col: 0, wire: 0, type: 'h' },
      { col: 0, wire: 1, type: 'h' },
      { col: 1, wire: 0, type: 'x' },
      { col: 2, wire: 0, type: 'cz_ctrl', target: 1 },
      { col: 2, wire: 1, type: 'cz_target', control: 0 },
      { col: 3, wire: 0, type: 'x' }
    ],
    targetState: [
      new Complex(0.5, 0),
      new Complex(0.5, 0),
      new Complex(-0.5, 0),
      new Complex(0.5, 0)
    ]
  }
];

export function calculateFidelity(state, targetState) {
  if (state.dim !== targetState.length) return 0;

  let dotReal = 0;
  let dotImag = 0;

  for (let k = 0; k < state.dim; k++) {
    const sR = state.real[k];
    const sI = state.imag[k];
    const tR = targetState[k].real;
    const tI = targetState[k].imag;

    dotReal += (tR * sR + tI * sI);
    dotImag += (tR * sI - tI * sR);
  }

  return dotReal * dotReal + dotImag * dotImag;
}
