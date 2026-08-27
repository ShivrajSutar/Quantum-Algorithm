/**
 * AITutorPanel.js - Interactive AI Tutor & Quantum Challenge Hub Component
 */

import { QuantumAIAdvisor } from '../core/QuantumAIAdvisor.js';
import { QuantumChallenges, calculateFidelity } from '../core/QuantumChallenges.js';

export class AITutorPanel {
  /**
   * @param {HTMLElement} container - DOM container element
   * @param {Object} options
   * @param {Function} options.onLoadChallenge - Callback when a challenge is selected
   * @param {Function} options.onApplySolution - Callback when user clicks reveal solution
   */
  constructor(container, options = {}) {
    this.container = container;
    this.onLoadChallenge = options.onLoadChallenge || (() => {});
    this.onApplySolution = options.onApplySolution || (() => {});
    this.currentChallenge = null;
    this.hintIndex = 0;
    this.activeTab = 'challenges';
    this.currentCircuit = null;
    this.currentState = null;

    this.render();
  }

  updateState(circuit, state) {
    this.currentCircuit = circuit;
    this.currentState = state;

    if (this.activeTab === 'explainer') {
      this.renderExplainer();
    }
  }

  setTab(tab) {
    this.activeTab = tab;
    this.container.querySelectorAll('.ai-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const bodyEl = this.container.querySelector('.ai-panel-body');
    if (tab === 'challenges') this.renderChallengesList();
    else if (tab === 'explainer') this.renderExplainer();
    else if (tab === 'ask') this.renderAskAI();
  }

  loadChallenge(challengeId) {
    const ch = QuantumChallenges.find(c => c.id === challengeId);
    if (!ch) return;
    this.currentChallenge = ch;
    this.hintIndex = 0;
    this.onLoadChallenge(ch);
    this.renderActiveChallenge();
  }

  renderChallengesList() {
    const bodyEl = this.container.querySelector('.ai-panel-body');
    bodyEl.innerHTML = `
      <div class="challenge-list-header">
        <h3>🎯 Quantum Puzzles & Guided Challenges</h3>
        <p class="subtitle">Complete levels to build mastery over superposition, entanglement, and quantum gates.</p>
      </div>
      <div class="challenge-cards-grid">
        ${QuantumChallenges.map(ch => `
          <div class="challenge-card" data-id="${ch.id}">
            <div class="challenge-badge">Level ${ch.level}</div>
            <div class="challenge-card-title">${ch.title}</div>
            <div class="challenge-card-desc">${ch.description}</div>
            <div class="challenge-card-footer">
              <span class="gate-limit">Max Gates: ${ch.maxGates}</span>
              <button class="btn btn-sm btn-primary play-challenge-btn" data-id="${ch.id}">Start Level ▶</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    bodyEl.querySelectorAll('.play-challenge-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.loadChallenge(btn.dataset.id);
      });
    });
  }

  renderActiveChallenge() {
    const bodyEl = this.container.querySelector('.ai-panel-body');
    const ch = this.currentChallenge;

    bodyEl.innerHTML = `
      <div class="active-challenge-container">
        <div class="active-challenge-header">
          <button id="back-to-challenges-btn" class="btn btn-sm btn-secondary">◀ All Levels</button>
          <span class="badge">Level ${ch.level}: ${ch.title}</span>
        </div>

        <div class="challenge-task-box">
          <h4>Goal:</h4>
          <p>${ch.description}</p>
          <div class="challenge-meta-row">
            <span>⚡ Qubits: <strong>${ch.numQubits}</strong></span>
            <span>🔒 Gate Limit: <strong>${ch.maxGates}</strong></span>
          </div>
        </div>

        <div class="challenge-actions-row">
          <button id="verify-solution-btn" class="btn btn-primary">✅ Test & Grade Solution</button>
          <button id="get-hint-btn" class="btn btn-secondary">💡 Get Socratic Hint</button>
          <button id="reveal-solution-btn" class="btn btn-secondary" style="margin-left: auto;">👁️ Reveal & Load Solution</button>
        </div>

        <div id="challenge-feedback-box" class="feedback-box hidden"></div>
        <div id="hint-display-box" class="hint-box hidden"></div>
      </div>
    `;

    bodyEl.querySelector('#back-to-challenges-btn').addEventListener('click', () => {
      this.currentChallenge = null;
      this.renderChallengesList();
    });

    bodyEl.querySelector('#get-hint-btn').addEventListener('click', () => {
      const hintBox = bodyEl.querySelector('#hint-display-box');
      if (this.hintIndex < ch.hints.length) {
        const hint = ch.hints[this.hintIndex];
        hintBox.innerHTML = `<strong>Hint ${this.hintIndex + 1}:</strong> ${hint}`;
        hintBox.classList.remove('hidden');
        this.hintIndex++;
      } else {
        hintBox.innerHTML = `<em>No more hints! You can click "Reveal & Load Solution" to see the full circuit.</em>`;
      }
    });

    bodyEl.querySelector('#verify-solution-btn').addEventListener('click', () => {
      this.gradeActiveChallenge();
    });

    bodyEl.querySelector('#reveal-solution-btn').addEventListener('click', () => {
      const feedbackBox = bodyEl.querySelector('#challenge-feedback-box');
      feedbackBox.classList.remove('hidden');
      feedbackBox.className = 'feedback-box warning';
      feedbackBox.innerHTML = `
        <strong>💡 Solution Circuit Loaded:</strong><br>
        ${ch.solutionExplanation || 'The correct gate sequence has been loaded onto the circuit board.'}
      `;

      if (ch.solutionGates) {
        this.onApplySolution(ch);
      }
    });
  }

  gradeActiveChallenge() {
    const ch = this.currentChallenge;
    const feedbackBox = this.container.querySelector('#challenge-feedback-box');
    feedbackBox.classList.remove('hidden');

    if (!this.currentState) {
      feedbackBox.className = 'feedback-box error';
      feedbackBox.innerHTML = '❌ No circuit executed yet.';
      return;
    }

    const gateCount = this.currentCircuit.gates.length;
    if (gateCount > ch.maxGates) {
      feedbackBox.className = 'feedback-box error';
      feedbackBox.innerHTML = `⚠️ <strong>Gate Limit Exceeded:</strong> You used ${gateCount} gates, but the maximum allowed for this level is ${ch.maxGates}. Try simplifying your circuit!`;
      return;
    }

    if (ch.targetState) {
      const fidelity = calculateFidelity(this.currentState, ch.targetState);
      if (fidelity >= 0.999) {
        feedbackBox.className = 'feedback-box success';
        feedbackBox.innerHTML = `🎉 <strong>Challenge Solved! (Fidelity: 100%)</strong><br>You successfully prepared the target quantum state!`;
      } else {
        feedbackBox.className = 'feedback-box warning';
        feedbackBox.innerHTML = `❌ <strong>Fidelity: ${(fidelity * 100).toFixed(1)}%</strong>.<br>The state does not match the target. Check your phase rotations or gate order.`;
      }
    }
  }

  renderExplainer() {
    const bodyEl = this.container.querySelector('.ai-panel-body');
    const analysis = QuantumAIAdvisor.explainCircuit(this.currentCircuit, this.currentState);
    const optimizations = QuantumAIAdvisor.optimizeCircuit(this.currentCircuit);

    bodyEl.innerHTML = `
      <div class="explainer-container">
        <div class="explainer-section">
          <h3>🤖 AI Circuit Step-by-Step Breakdown</h3>
          <p class="summary-text">${analysis.summary}</p>
          <div class="steps-timeline">
            ${analysis.steps.map(s => `<div class="step-card">${s}</div>`).join('')}
          </div>
        </div>

        <div class="explainer-section">
          <h3>⚡ Circuit Optimization & Diagnostics</h3>
          <div class="optimization-list">
            ${optimizations.map(opt => `<div class="opt-item">${opt}</div>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderAskAI() {
    const bodyEl = this.container.querySelector('.ai-panel-body');
    bodyEl.innerHTML = `
      <div class="ask-ai-container">
        <h3>💬 Ask the AI Quantum Mentor</h3>
        <p class="subtitle">Ask any concept question (Superposition, Phase Kickback, Entanglement, Grover, etc.)</p>

        <div class="quick-questions">
          <button class="quick-q-chip" data-q="What is superposition and how does the Hadamard gate create it?">What is superposition?</button>
          <button class="quick-q-chip" data-q="Why does the Bloch sphere vector shrink during entanglement?">Why does Bloch vector shrink?</button>
          <button class="quick-q-chip" data-q="How does Grover's search achieve quadratic speedup?">How does Grover search work?</button>
          <button class="quick-q-chip" data-q="How does the Quantum Teleportation protocol work?">Explain Quantum Teleportation</button>
        </div>

        <div class="ask-input-row">
          <input type="text" id="ai-query-input" placeholder="Type a quantum computing question..." />
          <button id="ai-submit-btn" class="btn btn-primary">Ask AI</button>
        </div>

        <div id="ai-response-box" class="ai-response-box hidden"></div>
      </div>
    `;

    const input = bodyEl.querySelector('#ai-query-input');
    const submitBtn = bodyEl.querySelector('#ai-submit-btn');
    const responseBox = bodyEl.querySelector('#ai-response-box');

    const handleAsk = (query) => {
      if (!query.trim()) return;
      const res = QuantumAIAdvisor.answerConcept(query);
      responseBox.classList.remove('hidden');
      responseBox.innerHTML = `
        <div class="response-topic">💡 ${res.topic}</div>
        <div class="response-text">${res.answer}</div>
      `;
    };

    submitBtn.addEventListener('click', () => handleAsk(input.value));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAsk(input.value); });

    bodyEl.querySelectorAll('.quick-q-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        input.value = chip.dataset.q;
        handleAsk(chip.dataset.q);
      });
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="ai-tutor-card">
        <div class="ai-tutor-header">
          <div class="ai-title">
            <span class="ai-sparkle">✨</span>
            <div>
              <h3>AI Quantum Tutor & Challenge Hub</h3>
              <p class="subtitle">Personalized Socratic Guidance, Circuit Debugging & Assessment</p>
            </div>
          </div>

          <div class="ai-tabs">
            <button class="ai-tab-btn active" data-tab="challenges">🎯 Challenges</button>
            <button class="ai-tab-btn" data-tab="explainer">🔍 Circuit Explainer</button>
            <button class="ai-tab-btn" data-tab="ask">💬 Ask AI</button>
          </div>
        </div>

        <div class="ai-panel-body"></div>
      </div>
    `;

    this.container.querySelectorAll('.ai-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTab(btn.dataset.tab);
      });
    });

    this.renderChallengesList();
  }
}
