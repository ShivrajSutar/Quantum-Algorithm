/**
 * AlgorithmPresets.js - Standard Quantum Algorithm Presets & Educational Context
 */

export const AlgorithmPresets = {
  bell_phi_plus: {
    id: 'bell_phi_plus',
    name: 'Bell State (|Φ⁺⟩ = (|00⟩ + |11⟩)/√2)',
    numQubits: 2,
    category: 'Entanglement Fundamentals',
    description: 'Creates a maximally entangled 2-qubit Bell pair. Measuring one qubit instantaneously determines the state of the other.',
    gates: [
      { col: 0, wire: 0, type: 'h' },
      { col: 1, wire: 0, type: 'cx_ctrl', target: 1 },
      { col: 1, wire: 1, type: 'cx_target', control: 0 }
    ]
  },

  bell_psi_minus: {
    id: 'bell_psi_minus',
    name: 'Bell State (|Ψ⁻⟩ = (|01⟩ - |10⟩)/√2)',
    numQubits: 2,
    category: 'Entanglement Fundamentals',
    description: 'Creates the Singlet Bell State with opposite spin states and a relative negative phase.',
    gates: [
      { col: 0, wire: 0, type: 'x' },
      { col: 0, wire: 1, type: 'x' },
      { col: 1, wire: 0, type: 'h' },
      { col: 2, wire: 0, type: 'cx_ctrl', target: 1 },
      { col: 2, wire: 1, type: 'cx_target', control: 0 }
    ]
  },

  ghz_3qubit: {
    id: 'ghz_3qubit',
    name: '3-Qubit GHZ State ((|000⟩ + |111⟩)/√2)',
    numQubits: 3,
    category: 'Multi-Qubit Entanglement',
    description: 'A tripartite maximally entangled state. All 3 qubits share a non-local quantum correlation.',
    gates: [
      { col: 0, wire: 0, type: 'h' },
      { col: 1, wire: 0, type: 'cx_ctrl', target: 1 },
      { col: 1, wire: 1, type: 'cx_target', control: 0 },
      { col: 2, wire: 1, type: 'cx_ctrl', target: 2 },
      { col: 2, wire: 2, type: 'cx_target', control: 1 }
    ]
  },

  teleportation: {
    id: 'teleportation',
    name: 'Quantum Teleportation Protocol',
    numQubits: 3,
    category: 'Quantum Communication',
    description: 'Transfers the quantum state of q0 to q2 across space using an entangled Bell pair between q1 and q2 and Bell measurement.',
    gates: [
      // 1. Prepare arbitrary state on q0 (e.g. via H and S)
      { col: 0, wire: 0, type: 'h' },
      { col: 1, wire: 0, type: 't' },
      // 2. Create entangled Bell pair between Alice (q1) and Bob (q2)
      { col: 2, wire: 1, type: 'h' },
      { col: 3, wire: 1, type: 'cx_ctrl', target: 2 },
      { col: 3, wire: 2, type: 'cx_target', control: 1 },
      // 3. Alice performs Bell Measurement on q0 and q1
      { col: 4, wire: 0, type: 'cx_ctrl', target: 1 },
      { col: 4, wire: 1, type: 'cx_target', control: 0 },
      { col: 5, wire: 0, type: 'h' },
      // 4. Bob applies correction
      { col: 6, wire: 1, type: 'cx_ctrl', target: 2 },
      { col: 6, wire: 2, type: 'cx_target', control: 1 },
      { col: 7, wire: 0, type: 'cz_ctrl', target: 2 },
      { col: 7, wire: 2, type: 'cz_target', control: 0 }
    ]
  },

  deutsch_jozsa: {
    id: 'deutsch_jozsa',
    name: 'Deutsch-Jozsa Algorithm (Balanced Oracle)',
    numQubits: 2,
    category: 'Quantum Advantage',
    description: 'Determines if a function is constant or balanced in a single quantum query. For a balanced function, measurement of q0 yields |1⟩ with 100% certainty.',
    gates: [
      // Initialize q0=|0>, q1=|1>
      { col: 0, wire: 1, type: 'x' },
      // Create superposition on both wires
      { col: 1, wire: 0, type: 'h' },
      { col: 1, wire: 1, type: 'h' },
      // Balanced Oracle (CNOT)
      { col: 2, wire: 0, type: 'cx_ctrl', target: 1 },
      { col: 2, wire: 1, type: 'cx_target', control: 0 },
      // Interference Hadamard on q0
      { col: 3, wire: 0, type: 'h' }
    ]
  },

  grover_2qubit: {
    id: 'grover_2qubit',
    name: "Grover's Search (Search for target |11⟩)",
    numQubits: 2,
    category: 'Quantum Search',
    description: 'Uses Phase Inversion (Oracle) followed by Inversion about the Mean (Diffusion Operator) to amplify target |11⟩ amplitude to 100%.',
    gates: [
      // 1. Equal superposition
      { col: 0, wire: 0, type: 'h' },
      { col: 0, wire: 1, type: 'h' },
      // 2. Oracle for |11> (Controlled-Z flips phase of |11>)
      { col: 1, wire: 0, type: 'cz_ctrl', target: 1 },
      { col: 1, wire: 1, type: 'cz_target', control: 0 },
      // 3. Grover Diffusion Operator (H -> X -> CZ -> X -> H)
      { col: 2, wire: 0, type: 'h' },
      { col: 2, wire: 1, type: 'h' },
      { col: 3, wire: 0, type: 'x' },
      { col: 3, wire: 1, type: 'x' },
      { col: 4, wire: 0, type: 'cz_ctrl', target: 1 },
      { col: 4, wire: 1, type: 'cz_target', control: 0 },
      { col: 5, wire: 0, type: 'x' },
      { col: 5, wire: 1, type: 'x' },
      { col: 6, wire: 0, type: 'h' },
      { col: 6, wire: 1, type: 'h' }
    ]
  }
};
