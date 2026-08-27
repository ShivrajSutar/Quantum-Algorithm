/**
 * QuantumAIAdvisor.js - Intelligent Quantum Circuit Analyzer & Pedagogical Explainer
 */

export class QuantumAIAdvisor {
  /**
   * Generates a step-by-step physical explanation of what the user's circuit does
   * @param {QuantumCircuit} circuit
   * @param {QuantumState} state
   */
  static explainCircuit(circuit, state) {
    if (!circuit || circuit.gates.length === 0) {
      return {
        title: "Empty Circuit (Ground State)",
        summary: "The quantum register is currently in its ground state |0...0⟩. No gates have been applied yet.",
        steps: ["All qubits are initialized to the pure state |0⟩ with 100% probability."]
      };
    }

    const steps = [];
    let hasSuperposition = false;
    let hasEntanglement = false;
    let hasPhaseShift = false;

    circuit.gates.forEach((g, idx) => {
      switch (g.type) {
        case 'h':
          hasSuperposition = true;
          steps.push(`**Step ${idx + 1} (H on q${g.targets[0]}):** Created an equal quantum superposition (|0⟩ + |1⟩)/√2. The state vector was rotated from the North Pole to the Equator (+X axis).`);
          break;
        case 'x':
          steps.push(`**Step ${idx + 1} (X on q${g.targets[0]}):** Applied a Pauli-X (Quantum NOT) gate, performing a 180° rotation around the X-axis and flipping |0⟩ ↔ |1⟩.`);
          break;
        case 'y':
          steps.push(`**Step ${idx + 1} (Y on q${g.targets[0]}):** Applied a Pauli-Y gate, introducing a 180° rotation around the Y-axis with a complex phase factor.`);
          break;
        case 'z':
          hasPhaseShift = true;
          steps.push(`**Step ${idx + 1} (Z on q${g.targets[0]}):** Applied a Pauli-Z phase flip, inverting the sign of the |1⟩ amplitude from (+) to (-).`);
          break;
        case 's':
          hasPhaseShift = true;
          steps.push(`**Step ${idx + 1} (S on q${g.targets[0]}):** Rotated the relative quantum phase by +90° (+π/2) around the Z-axis.`);
          break;
        case 't':
          hasPhaseShift = true;
          steps.push(`**Step ${idx + 1} (T on q${g.targets[0]}):** Rotated the relative quantum phase by +45° (+π/4) around the Z-axis.`);
          break;
        case 'cx':
        case 'cnot':
          hasEntanglement = true;
          steps.push(`**Step ${idx + 1} (CNOT q${g.controls[0]} → q${g.targets[0]}):** Controlled-NOT gate executed. If control qubit q${g.controls[0]} is |1⟩, target qubit q${g.targets[0]} is flipped. This generates non-local quantum entanglement!`);
          break;
        case 'cz':
          hasPhaseShift = true;
          steps.push(`**Step ${idx + 1} (CZ q${g.controls[0]} → q${g.targets[0]}):** Controlled-Z gate applied. Flips the phase of the joint basis state |11⟩.`);
          break;
        case 'swap':
          steps.push(`**Step ${idx + 1} (SWAP q${g.targets[0]} ↔ q${g.targets[1]}):** Interchanged the quantum states of qubits q${g.targets[0]} and q${g.targets[1]}.`);
          break;
      }
    });

    let summary = "";
    if (hasEntanglement && hasSuperposition) {
      summary = "Your circuit generates multi-qubit **quantum entanglement**. Measuring any one qubit will instantly collapse the state of the other entangled qubits.";
    } else if (hasSuperposition) {
      summary = "Your circuit prepares qubits in **superposition**, enabling quantum parallelism across multiple computational basis states simultaneously.";
    } else if (hasPhaseShift) {
      summary = "Your circuit manipulates **quantum phases**, which is fundamental for constructive and destructive interference in quantum algorithms.";
    } else {
      summary = "Your circuit performs deterministic classical-equivalent basis transformations.";
    }

    return {
      title: "Circuit Physics Analysis",
      summary,
      steps
    };
  }

  /**
   * Analyzes circuit for optimization opportunities (e.g. self-inverse gate cancellations)
   */
  static optimizeCircuit(circuit) {
    const suggestions = [];
    if (!circuit || !circuit.gates) return suggestions;
    const gates = circuit.gates;

    for (let i = 0; i < gates.length - 1; i++) {
      const g1 = gates[i];
      const g2 = gates[i + 1];

      if (g1.type === 'h' && g2.type === 'h' && g1.targets[0] === g2.targets[0]) {
        suggestions.push(`**Redundant Gates Detected:** Two consecutive Hadamard (H) gates on wire q${g1.targets[0]} cancel each other out (H · H = I). You can remove both.`);
      }
      if (g1.type === 'x' && g2.type === 'x' && g1.targets[0] === g2.targets[0]) {
        suggestions.push(`**Redundant NOTs:** Two consecutive Pauli-X gates on wire q${g1.targets[0]} cancel each other out (X · X = I).`);
      }
      if (g1.type === 'z' && g2.type === 'z' && g1.targets[0] === g2.targets[0]) {
        suggestions.push(`**Redundant Phase Flips:** Consecutive Z gates on wire q${g1.targets[0]} cancel each other out (Z · Z = I).`);
      }
    }

    if (suggestions.length === 0) {
      suggestions.push("✨ Your circuit is clean and compact! No redundant self-cancelling gate pairs were found.");
    }

    return suggestions;
  }

  /**
   * Answers quantum computing concept questions with domain-grounded knowledge
   */
  static answerConcept(query) {
    const q = query.toLowerCase();

    if (q.includes('superposition') || q.includes('hadamard')) {
      return {
        topic: 'Superposition & Hadamard Gate',
        answer: 'Superposition allows a quantum bit to exist in a linear combination of |0⟩ and |1⟩: |ψ⟩ = α|0⟩ + β|1⟩. Applying a Hadamard (H) gate to |0⟩ creates the equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2, where measurement has a 50% probability of yielding 0 and 50% probability of yielding 1.'
      };
    }

    if (q.includes('entanglement') || q.includes('bell') || q.includes('shrink')) {
      return {
        topic: 'Quantum Entanglement & Reduced Density',
        answer: 'Entanglement occurs when two or more qubits share a unified quantum state that cannot be factored into individual qubit states (e.g. |Φ⁺⟩ = (|00⟩ + |11⟩)/√2). When qubits are entangled, their individual 3D Bloch vectors shrink towards the center (R < 1) because neither qubit has a definite state on its own until measured.'
      };
    }

    if (q.includes('phase') || q.includes('bloch') || q.includes('latitude') || q.includes('longitude')) {
      return {
        topic: 'Relative Phase & The Bloch Sphere',
        answer: 'On the Bloch Sphere, polar angle θ represents latitude (the balance of |0⟩ vs |1⟩ probabilities), while azimuthal angle φ represents longitude (the relative quantum phase e^(iφ)). Gates like Z, S, and T rotate around the Z-axis, changing phase φ without altering measurement probabilities until interference occurs.'
      };
    }

    if (q.includes('cnot') || q.includes('cx') || q.includes('control')) {
      return {
        topic: 'Controlled-NOT (CNOT / CX) Gate',
        answer: 'A CNOT gate flips the target qubit if and only if the control qubit is in state |1⟩. When the control qubit is in superposition (|+⟩), the CNOT creates non-local entanglement between the control and target wires.'
      };
    }

    if (q.includes('grover') || q.includes('search') || q.includes('oracle')) {
      return {
        topic: "Grover's Search Algorithm",
        answer: "Grover's algorithm searches an unsorted database of N items in O(√N) queries instead of classical O(N). It alternates between two steps: 1) An Oracle that flips the phase of the marked target item, and 2) A Diffusion Operator (Inversion about the Mean) that amplifies the target item's amplitude while suppressing others."
      };
    }

    if (q.includes('teleportation')) {
      return {
        topic: 'Quantum Teleportation Protocol',
        answer: 'Quantum Teleportation transfers an unknown quantum state |ψ⟩ from Alice to Bob without physically transmitting the qubit itself. It uses a shared entangled Bell pair and 2 classical bits sent over a conventional channel, respecting the No-Cloning Theorem.'
      };
    }

    return {
      topic: 'Quantum Computing Principle',
      answer: 'Quantum computing leverages superposition, interference, and entanglement to solve specific computational problems exponentially or quadratically faster than classical supercomputers.'
    };
  }
}
