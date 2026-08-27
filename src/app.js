/**
 * app.js - Main Application Orchestrator with Video Lecture Academy
 */

import { CircuitGrid } from './components/CircuitGrid.js';
import { CodeViewer } from './components/CodeViewer.js';
import { AITutorPanel } from './components/AITutorPanel.js';
import { VideoLectureHub } from './components/VideoLectureHub.js';
import { AlgorithmPresets } from './core/AlgorithmPresets.js';
import { BlochSphere3D } from './visualizers/BlochSphere3D.js';
import { PhaseDiskVisualizer } from './visualizers/PhaseDiskVisualizer.js';
import { StateBarChart } from './visualizers/StateBarChart.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Containers
  const gridContainer = document.getElementById('circuit-grid-container');
  const codeContainer = document.getElementById('code-viewer-container');
  const aiTutorContainer = document.getElementById('ai-tutor-container');
  const videoLectureContainer = document.getElementById('video-lecture-container');
  const blochArrayContainer = document.getElementById('bloch-array');
  const phaseDiskContainer = document.getElementById('phase-disk-container');
  const barchartContainer = document.getElementById('barchart-container');

  // Controls
  const presetSelector = document.getElementById('preset-selector');
  const clearBtn = document.getElementById('clear-circuit-btn');
  const addQubitBtn = document.getElementById('add-qubit-btn');
  const removeQubitBtn = document.getElementById('remove-qubit-btn');
  const timelineScrubber = document.getElementById('timeline-scrubber');
  const stepPrevBtn = document.getElementById('step-prev-btn');
  const stepNextBtn = document.getElementById('step-next-btn');
  const stepLabel = document.getElementById('step-label');

  // Initialize Visualizers
  const phaseDisk = new PhaseDiskVisualizer(phaseDiskContainer);
  const barChart = new StateBarChart(barchartContainer);
  const codeViewer = new CodeViewer(codeContainer);

  let blochSpheres = [];

  function syncBlochSpheresCount(numQubits) {
    blochArrayContainer.innerHTML = '';
    blochSpheres = [];

    for (let w = 0; w < numQubits; w++) {
      const itemEl = document.createElement('div');
      itemEl.className = 'bloch-item';

      const titleEl = document.createElement('div');
      titleEl.className = 'bloch-item-title';
      titleEl.innerHTML = `Qubit q<sub>${w}</sub>`;
      itemEl.appendChild(titleEl);

      const viewportEl = document.createElement('div');
      viewportEl.className = 'bloch-item-viewport';
      itemEl.appendChild(viewportEl);

      blochArrayContainer.appendChild(itemEl);

      const bs = new BlochSphere3D(viewportEl, { size: 220 });
      blochSpheres.push(bs);
    }
  }

  function updateVisualizers(fullCircuit, stepCircuit, currentStep, totalSteps) {
    const currentState = stepCircuit.execute();

    // 1. Update 3D Bloch Spheres
    if (blochSpheres.length !== stepCircuit.numQubits) {
      syncBlochSpheresCount(stepCircuit.numQubits);
    }

    for (let w = 0; w < stepCircuit.numQubits; w++) {
      const blochCoords = currentState.getBlochCoordinates(w);
      if (blochSpheres[w]) {
        blochSpheres[w].setBlochState(blochCoords, 300);
      }
    }

    // 2. Update 2D Multi-Qubit Visualizers
    phaseDisk.render(currentState);
    barChart.render(currentState);

    // 3. Update Code Generator
    codeViewer.setCircuit(fullCircuit);

    // 4. Update AI Tutor Context
    aiTutor.updateState(fullCircuit, currentState);

    // 5. Update Scrubber UI
    timelineScrubber.max = totalSteps;
    timelineScrubber.value = currentStep;
    stepLabel.textContent = `Step ${currentStep} / ${totalSteps}`;
  }

  // Initialize Circuit Grid
  const circuitGrid = new CircuitGrid(gridContainer, {
    numQubits: 2,
    numCols: 8,
    onChange: (fullCircuit, stepCircuit, currentStep) => {
      updateVisualizers(fullCircuit, stepCircuit, currentStep, circuitGrid.numCols);
    },
    onStepChange: (stepCircuit, currentStep) => {
      const fullCircuit = circuitGrid.compileToCircuit(circuitGrid.numCols);
      updateVisualizers(fullCircuit, stepCircuit, currentStep, circuitGrid.numCols);
    }
  });

  // Initialize Video Lecture Hub
  const videoLectureHub = new VideoLectureHub(videoLectureContainer, {
    onLoadCircuit: (lectureCircuit) => {
      circuitGrid.loadPreset(lectureCircuit);
      syncBlochSpheresCount(lectureCircuit.numQubits);
    }
  });

  // Initialize AI Tutor Panel
  const aiTutor = new AITutorPanel(aiTutorContainer, {
    onLoadChallenge: (challenge) => {
      circuitGrid.numQubits = challenge.numQubits;
      circuitGrid.clear();
      syncBlochSpheresCount(challenge.numQubits);
    },
    onApplySolution: (challenge) => {
      if (challenge.solutionGates) {
        circuitGrid.loadPreset({
          numQubits: challenge.numQubits,
          gates: challenge.solutionGates
        });
        syncBlochSpheresCount(challenge.numQubits);
      }
    }
  });

  // Gate Palette Click Handlers
  document.querySelectorAll('.palette-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      circuitGrid.selectedGateType = btn.dataset.gate;
    });
  });

  // Algorithm Preset Selector Handler
  presetSelector.addEventListener('change', (e) => {
    const presetId = e.target.value;
    if (presetId && AlgorithmPresets[presetId]) {
      const preset = AlgorithmPresets[presetId];
      syncBlochSpheresCount(preset.numQubits);
      circuitGrid.loadPreset(preset);
    }
  });

  // Add / Remove Qubit Buttons
  addQubitBtn.addEventListener('click', () => {
    circuitGrid.addQubit();
    syncBlochSpheresCount(circuitGrid.numQubits);
  });

  removeQubitBtn.addEventListener('click', () => {
    circuitGrid.removeQubit();
    syncBlochSpheresCount(circuitGrid.numQubits);
  });

  // Clear Button
  clearBtn.addEventListener('click', () => {
    presetSelector.value = '';
    circuitGrid.clear();
  });

  // Timeline Scrubber & Step Navigation
  timelineScrubber.addEventListener('input', (e) => {
    const step = parseInt(e.target.value, 10);
    circuitGrid.setStep(step);
  });

  stepPrevBtn.addEventListener('click', () => {
    circuitGrid.setStep(circuitGrid.currentStep - 1);
  });

  stepNextBtn.addEventListener('click', () => {
    circuitGrid.setStep(circuitGrid.currentStep + 1);
  });

  // Load default Bell State preset to start
  syncBlochSpheresCount(2);
  circuitGrid.loadPreset(AlgorithmPresets.bell_phi_plus);
});
