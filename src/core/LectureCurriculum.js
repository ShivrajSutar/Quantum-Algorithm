/**
 * LectureCurriculum.js - Curated Video Lecture Tracks & Synchronized Quantum Circuits
 */

export const LectureCurriculum = [
  {
    id: 'lec_foundations',
    title: 'Lecture 1: The Qubit & Superposition',
    instructor: 'Quantum Computing Fundamentals',
    duration: '14:20',
    category: 'Foundations',
    thumbnail: '⚛️',
    videoUrl: 'https://www.youtube.com/embed/JhHMJCUmq28',
    summary: 'Discover how a quantum bit differs from a classical bit, why probability amplitudes are complex numbers, and how the Hadamard gate creates 50/50 superposition.',
    keyTakeaways: [
      'A qubit state is |ψ⟩ = α|0⟩ + β|1⟩ where |α|² + |β|² = 1.',
      'Measurement collapses the wave function probabilistically (Born Rule).',
      'The Hadamard gate rotates the Bloch vector from |0⟩ (North Pole) to |+⟩ (Equator).'
    ],
    interactiveCircuit: {
      presetId: 'superposition_demo',
      numQubits: 1,
      gates: [
        { col: 0, wire: 0, type: 'h' }
      ]
    }
  },

  {
    id: 'lec_bloch_sphere',
    title: 'Lecture 2: The Bloch Sphere & Single-Qubit Rotations',
    instructor: 'Quantum Geometry & Math',
    duration: '18:45',
    category: 'Foundations',
    thumbnail: '🌐',
    videoUrl: 'https://www.youtube.com/embed/5Gj3KxQW9m4',
    summary: 'Master the 3D geometry of the Bloch sphere, polar angle θ (latitude), azimuthal angle φ (longitude), and how Pauli X, Y, Z, and S gates rotate states on the unit sphere.',
    keyTakeaways: [
      'Every pure single-qubit state is parameterized as |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩.',
      'Pauli-X rotates 180° around X-axis (NOT), Pauli-Z rotates 180° around Z-axis (Phase flip).',
      'Global phase e^(iγ) is physically unobservable, but relative phase φ creates interference.'
    ],
    interactiveCircuit: {
      presetId: 'bloch_rotations_demo',
      numQubits: 1,
      gates: [
        { col: 0, wire: 0, type: 'h' },
        { col: 1, wire: 0, type: 's' },
        { col: 2, wire: 0, type: 't' }
      ]
    }
  },

  {
    id: 'lec_entanglement',
    title: 'Lecture 3: Quantum Entanglement & Bell States',
    instructor: 'Multi-Qubit Systems',
    duration: '22:10',
    category: 'Entanglement',
    thumbnail: '🔗',
    videoUrl: 'https://www.youtube.com/embed/m7sZ_7B-60E',
    summary: 'Explore Einstein-Podolsky-Rosen (EPR) paradox, non-local quantum correlations, how CNOT gates create entanglement, and why individual Bloch spheres shrink.',
    keyTakeaways: [
      'An entangled state cannot be decomposed into individual tensor products: |ψ⟩ ≠ |ψ₁⟩ ⊗ |ψ₂⟩.',
      'Creating a Bell state: |00⟩ ──H──► (|00⟩ + |10⟩)/√2 ──CNOT──► (|00⟩ + |11⟩)/√2.',
      'Measuring one entangled qubit immediately collapses the second qubit regardless of physical distance.'
    ],
    interactiveCircuit: {
      presetId: 'bell_phi_plus',
      numQubits: 2,
      gates: [
        { col: 0, wire: 0, type: 'h' },
        { col: 1, wire: 0, type: 'cx_ctrl', target: 1 },
        { col: 1, wire: 1, type: 'cx_target', control: 0 }
      ]
    }
  },

  {
    id: 'lec_teleportation',
    title: 'Lecture 4: Quantum Teleportation Protocol',
    instructor: 'Quantum Information & Communication',
    duration: '20:30',
    category: 'Communication',
    thumbnail: '🚀',
    videoUrl: 'https://www.youtube.com/embed/DxQK1WDY5gs',
    summary: 'Learn how an unknown quantum state can be teleported across space using a shared Bell pair and 2 classical bits without violating the No-Cloning theorem.',
    keyTakeaways: [
      'The No-Cloning theorem forbids creating identical copies of an arbitrary unknown quantum state.',
      'Teleportation destroys the original quantum state at the sender (Alice) while reconstructing it at Bob.',
      'Requires both quantum entanglement and classical communication (speed of light limit holds).'
    ],
    interactiveCircuit: {
      presetId: 'teleportation',
      numQubits: 3,
      gates: [
        { col: 0, wire: 0, type: 'h' },
        { col: 1, wire: 0, type: 't' },
        { col: 2, wire: 1, type: 'h' },
        { col: 3, wire: 1, type: 'cx_ctrl', target: 2 },
        { col: 3, wire: 2, type: 'cx_target', control: 1 },
        { col: 4, wire: 0, type: 'cx_ctrl', target: 1 },
        { col: 4, wire: 1, type: 'cx_target', control: 0 },
        { col: 5, wire: 0, type: 'h' }
      ]
    }
  },

  {
    id: 'lec_deutsch_jozsa',
    title: 'Lecture 5: Quantum Advantage & Deutsch-Jozsa Algorithm',
    instructor: 'Quantum Algorithms',
    duration: '19:15',
    category: 'Algorithms',
    thumbnail: '⚡',
    videoUrl: 'https://www.youtube.com/embed/5xsyx-fcCXs',
    summary: 'Discover the historic algorithm that proved quantum computing can solve a problem in 1 query where classical computers require 2^(n-1) + 1 queries.',
    keyTakeaways: [
      'Solves the black-box oracle problem: Is f(x) constant (same output for all inputs) or balanced (50% 0s, 50% 1s)?',
      'Uses Phase Kickback to encode function evaluation into amplitude phases.',
      'Constructive interference ensures constant functions yield |00...0⟩ and balanced functions yield non-zero bitstrings.'
    ],
    interactiveCircuit: {
      presetId: 'deutsch_jozsa',
      numQubits: 2,
      gates: [
        { col: 0, wire: 1, type: 'x' },
        { col: 1, wire: 0, type: 'h' },
        { col: 1, wire: 1, type: 'h' },
        { col: 2, wire: 0, type: 'cx_ctrl', target: 1 },
        { col: 2, wire: 1, type: 'cx_target', control: 0 },
        { col: 3, wire: 0, type: 'h' }
      ]
    }
  },

  {
    id: 'lec_grover',
    title: "Lecture 6: Grover's Search & Amplitude Amplification",
    instructor: 'Quantum Algorithms',
    duration: '26:40',
    category: 'Algorithms',
    thumbnail: '🔍',
    videoUrl: 'https://www.youtube.com/embed/IT-O-KSWucE',
    summary: 'Learn how to search an unsorted database of N items in O(√N) steps using geometric reflections, phase oracles, and the Grover diffusion operator.',
    keyTakeaways: [
      'Grover search achieves a quadratic speedup over the best possible classical search (O(√N) vs O(N)).',
      'Step 1 (Oracle): Inverts the phase of the target marked item (|x*⟩ → -|x*⟩).',
      'Step 2 (Diffusion): Reflects all amplitudes across the average mean amplitude, amplifying the target.'
    ],
    interactiveCircuit: {
      presetId: 'grover_2qubit',
      numQubits: 2,
      gates: [
        { col: 0, wire: 0, type: 'h' },
        { col: 0, wire: 1, type: 'h' },
        { col: 1, wire: 0, type: 'cz_ctrl', target: 1 },
        { col: 1, wire: 1, type: 'cz_target', control: 0 },
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
  }
];
