/**
 * QuantumCircuit.js - Quantum Circuit Model, Stepper & Code Exporter
 * 
 * Supports:
 * 1. Step-by-step circuit execution (Time-Travel / Stepper)
 * 2. Instant full simulation
 * 3. Export to OpenQASM 3.0, Qiskit (Python), Google Cirq, and PennyLane
 */

import { QuantumState } from './QuantumState.js';
import { QuantumGates } from './QuantumGates.js';

export class QuantumCircuit {
  /**
   * @param {number} numQubits - Number of quantum bits
   * @param {number} numClbits - Number of classical bits
   */
  constructor(numQubits = 2, numClbits = 2) {
    this.numQubits = numQubits;
    this.numClbits = numClbits;
    this.gates = []; // Ordered array of gate execution steps
  }

  // ==========================================
  // CIRCUIT BUILDING METHODS (GATE INGESTION)
  // ==========================================

  addGate(type, targets, controls = [], params = []) {
    this.gates.push({
      type,
      targets: Array.isArray(targets) ? targets : [targets],
      controls: Array.isArray(controls) ? controls : [controls],
      params: Array.isArray(params) ? params : [params]
    });
    return this;
  }

  h(qubit) { return this.addGate('h', qubit); }
  x(qubit) { return this.addGate('x', qubit); }
  y(qubit) { return this.addGate('y', qubit); }
  z(qubit) { return this.addGate('z', qubit); }
  s(qubit) { return this.addGate('s', qubit); }
  sdag(qubit) { return this.addGate('sdag', qubit); }
  t(qubit) { return this.addGate('t', qubit); }
  tdag(qubit) { return this.addGate('tdag', qubit); }

  rx(qubit, theta) { return this.addGate('rx', qubit, [], [theta]); }
  ry(qubit, theta) { return this.addGate('ry', qubit, [], [theta]); }
  rz(qubit, theta) { return this.addGate('rz', qubit, [], [theta]); }
  u3(qubit, theta, phi, lambda) { return this.addGate('u3', qubit, [], [theta, phi, lambda]); }

  cx(control, target) { return this.addGate('cx', target, control); }
  cnot(control, target) { return this.cx(control, target); }
  cz(control, target) { return this.addGate('cz', target, control); }
  swap(qubitA, qubitB) { return this.addGate('swap', [qubitA, qubitB]); }
  toffoli(c1, c2, target) { return this.addGate('toffoli', target, [c1, c2]); }
  ccx(c1, c2, target) { return this.toffoli(c1, c2, target); }

  // ==========================================
  // EXECUTION & STEP-BY-STEP SIMULATION
  // ==========================================

  /**
   * Applies an individual gate object onto an existing QuantumState
   */
  static applyGateToState(gate, state) {
    const { type, targets, controls, params } = gate;

    switch (type) {
      case 'h':
        state.apply1QubitGate(QuantumGates.H, targets[0]);
        break;
      case 'x':
        state.apply1QubitGate(QuantumGates.X, targets[0]);
        break;
      case 'y':
        state.apply1QubitGate(QuantumGates.Y, targets[0]);
        break;
      case 'z':
        state.apply1QubitGate(QuantumGates.Z, targets[0]);
        break;
      case 's':
        state.apply1QubitGate(QuantumGates.S, targets[0]);
        break;
      case 'sdag':
        state.apply1QubitGate(QuantumGates.Sdag, targets[0]);
        break;
      case 't':
        state.apply1QubitGate(QuantumGates.T, targets[0]);
        break;
      case 'tdag':
        state.apply1QubitGate(QuantumGates.Tdag, targets[0]);
        break;
      case 'rx':
        state.apply1QubitGate(QuantumGates.Rx(params[0]), targets[0]);
        break;
      case 'ry':
        state.apply1QubitGate(QuantumGates.Ry(params[0]), targets[0]);
        break;
      case 'rz':
        state.apply1QubitGate(QuantumGates.Rz(params[0]), targets[0]);
        break;
      case 'u3':
        state.apply1QubitGate(QuantumGates.U3(params[0], params[1], params[2]), targets[0]);
        break;
      case 'cx':
      case 'cnot':
        state.applyCNOT(controls[0], targets[0]);
        break;
      case 'cz':
        state.applyCZ(controls[0], targets[0]);
        break;
      case 'swap':
        state.applySWAP(targets[0], targets[1]);
        break;
      case 'toffoli':
      case 'ccx':
        state.applyToffoli(controls[0], controls[1], targets[0]);
        break;
      default:
        console.warn(`Unknown gate type: ${type}`);
    }
  }

  /**
   * Executes the entire circuit and returns the final QuantumState
   */
  execute() {
    const state = new QuantumState(this.numQubits);
    for (const gate of this.gates) {
      QuantumCircuit.applyGateToState(gate, state);
    }
    return state;
  }

  /**
   * Simulates the circuit up to stepIndex (0 to gates.length)
   * Essential for time-travel scrubber and step-by-step tutorial modes!
   */
  step(stepIndex) {
    const state = new QuantumState(this.numQubits);
    const limit = Math.min(stepIndex, this.gates.length);
    for (let i = 0; i < limit; i++) {
      QuantumCircuit.applyGateToState(this.gates[i], state);
    }
    return state;
  }

  /**
   * Returns state history after every gate execution
   */
  getExecutionTrace() {
    const history = [];
    const state = new QuantumState(this.numQubits);
    history.push({ step: 0, gate: null, state: state.clone() });

    for (let i = 0; i < this.gates.length; i++) {
      const gate = this.gates[i];
      QuantumCircuit.applyGateToState(gate, state);
      history.push({
        step: i + 1,
        gate,
        state: state.clone()
      });
    }

    return history;
  }

  // ==========================================
  // MULTI-FRAMEWORK CODE EXPORTERS
  // ==========================================

  /**
   * Exports circuit to OpenQASM 3.0 standard string
   */
  toOpenQASM() {
    let qasm = `OPENQASM 3.0;\ninclude "stdgates.inc";\n\n`;
    qasm += `qubit[${this.numQubits}] q;\n`;
    if (this.numClbits > 0) {
      qasm += `bit[${this.numClbits}] c;\n\n`;
    }

    for (const g of this.gates) {
      switch (g.type) {
        case 'h':
        case 'x':
        case 'y':
        case 'z':
        case 's':
        case 't':
          qasm += `${g.type} q[${g.targets[0]}];\n`;
          break;
        case 'rx':
        case 'ry':
        case 'rz':
          qasm += `${g.type}(${g.params[0]}) q[${g.targets[0]}];\n`;
          break;
        case 'cx':
          qasm += `cx q[${g.controls[0]}], q[${g.targets[0]}];\n`;
          break;
        case 'cz':
          qasm += `cz q[${g.controls[0]}], q[${g.targets[0]}];\n`;
          break;
        case 'swap':
          qasm += `swap q[${g.targets[0]}], q[${g.targets[1]}];\n`;
          break;
        case 'ccx':
        case 'toffoli':
          qasm += `ccx q[${g.controls[0]}], q[${g.controls[1]}], q[${g.targets[0]}];\n`;
          break;
      }
    }
    return qasm;
  }

  /**
   * Exports circuit to executable Python (Qiskit) code
   */
  toQiskit() {
    let py = `from qiskit import QuantumCircuit, Aer, execute\n\n`;
    py += `# Initialize Quantum Circuit with ${this.numQubits} qubits\n`;
    py += `qc = QuantumCircuit(${this.numQubits}, ${this.numClbits})\n\n`;

    for (const g of this.gates) {
      switch (g.type) {
        case 'h':
        case 'x':
        case 'y':
        case 'z':
        case 's':
        case 't':
          py += `qc.${g.type}(${g.targets[0]})\n`;
          break;
        case 'rx':
        case 'ry':
        case 'rz':
          py += `qc.${g.type}(${g.params[0]}, ${g.targets[0]})\n`;
          break;
        case 'cx':
          py += `qc.cx(${g.controls[0]}, ${g.targets[0]})\n`;
          break;
        case 'cz':
          py += `qc.cz(${g.controls[0]}, ${g.targets[0]})\n`;
          break;
        case 'swap':
          py += `qc.swap(${g.targets[0]}, ${g.targets[1]})\n`;
          break;
        case 'ccx':
        case 'toffoli':
          py += `qc.ccx(${g.controls[0]}, ${g.controls[1]}, ${g.targets[0]})\n`;
          break;
      }
    }

    py += `\n# Execute on Statevector Simulator\n`;
    py += `backend = Aer.get_backend('statevector_simulator')\n`;
    py += `result = execute(qc, backend).result()\n`;
    py += `statevector = result.get_statevector(qc)\n`;
    py += `print("Statevector:", statevector)\n`;

    return py;
  }

  /**
   * Exports circuit to executable Python (Cirq) code
   */
  toCirq() {
    let py = `import cirq\n\n`;
    py += `# Create qubits\n`;
    py += `qubits = [cirq.LineQubit(i) for i in range(${this.numQubits})]\n`;
    py += `circuit = cirq.Circuit()\n\n`;

    for (const g of this.gates) {
      switch (g.type) {
        case 'h':
          py += `circuit.append(cirq.H(qubits[${g.targets[0]}]))\n`;
          break;
        case 'x':
          py += `circuit.append(cirq.X(qubits[${g.targets[0]}]))\n`;
          break;
        case 'y':
          py += `circuit.append(cirq.Y(qubits[${g.targets[0]}]))\n`;
          break;
        case 'z':
          py += `circuit.append(cirq.Z(qubits[${g.targets[0]}]))\n`;
          break;
        case 'cx':
          py += `circuit.append(cirq.CNOT(qubits[${g.controls[0]}], qubits[${g.targets[0]}]))\n`;
          break;
        case 'cz':
          py += `circuit.append(cirq.CZ(qubits[${g.controls[0]}], qubits[${g.targets[0]}]))\n`;
          break;
        case 'swap':
          py += `circuit.append(cirq.SWAP(qubits[${g.targets[0]}], qubits[${g.targets[1]}]))\n`;
          break;
        case 'ccx':
        case 'toffoli':
          py += `circuit.append(cirq.TOFFOLI(qubits[${g.controls[0]}], qubits[${g.controls[1]}], qubits[${g.targets[0]}]))\n`;
          break;
      }
    }

    py += `\nsimulator = cirq.Simulator()\n`;
    py += `result = simulator.simulate(circuit)\n`;
    py += `print("Final State:\\n", result)\n`;

    return py;
  }

  /**
   * Exports circuit to PennyLane (Quantum Machine Learning) code
   */
  toPennyLane() {
    let py = `import pennylane as qml\n\n`;
    py += `dev = qml.device("default.qubit", wires=${this.numQubits})\n\n`;
    py += `@qml.qnode(dev)\n`;
    py += `def circuit():\n`;

    for (const g of this.gates) {
      switch (g.type) {
        case 'h':
          py += `    qml.Hadamard(wires=${g.targets[0]})\n`;
          break;
        case 'x':
          py += `    qml.PauliX(wires=${g.targets[0]})\n`;
          break;
        case 'y':
          py += `    qml.PauliY(wires=${g.targets[0]})\n`;
          break;
        case 'z':
          py += `    qml.PauliZ(wires=${g.targets[0]})\n`;
          break;
        case 'cx':
          py += `    qml.CNOT(wires=[${g.controls[0]}, ${g.targets[0]}])\n`;
          break;
        case 'cz':
          py += `    qml.CZ(wires=[${g.controls[0]}, ${g.targets[0]}])\n`;
          break;
        case 'swap':
          py += `    qml.SWAP(wires=[${g.targets[0]}, ${g.targets[1]}])\n`;
          break;
      }
    }

    py += `    return qml.state()\n\n`;
    py += `print("PennyLane State:", circuit())\n`;

    return py;
  }
}
