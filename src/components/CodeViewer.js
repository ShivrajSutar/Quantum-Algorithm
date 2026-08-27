/**
 * CodeViewer.js - Live Code Generator & Syntax Viewer for Qiskit, OpenQASM, Cirq, PennyLane
 */

export class CodeViewer {
  /**
   * @param {HTMLElement} container - DOM container element
   */
  constructor(container) {
    this.container = container;
    this.activeTab = 'qiskit';
    this.currentCircuit = null;
    this.render();
  }

  setCircuit(circuit) {
    this.currentCircuit = circuit;
    this.updateCode();
  }

  setTab(tab) {
    this.activeTab = tab;
    this.container.querySelectorAll('.code-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    this.updateCode();
  }

  updateCode() {
    if (!this.currentCircuit) return;

    let code = '';
    switch (this.activeTab) {
      case 'qiskit':
        code = this.currentCircuit.toQiskit();
        break;
      case 'qasm':
        code = this.currentCircuit.toOpenQASM();
        break;
      case 'cirq':
        code = this.currentCircuit.toCirq();
        break;
      case 'pennylane':
        code = this.currentCircuit.toPennyLane();
        break;
    }

    const codeEl = this.container.querySelector('code');
    if (codeEl) {
      codeEl.textContent = code;
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="code-viewer-header">
        <div class="code-tabs">
          <button class="code-tab-btn active" data-tab="qiskit">🐍 Python Qiskit</button>
          <button class="code-tab-btn" data-tab="qasm">📄 OpenQASM 3.0</button>
          <button class="code-tab-btn" data-tab="cirq">🌐 Google Cirq</button>
          <button class="code-tab-btn" data-tab="pennylane">⚡ PennyLane (QML)</button>
        </div>
        <button id="copy-code-btn" class="btn btn-sm btn-secondary">📋 Copy Code</button>
      </div>
      <div class="code-content-wrapper">
        <pre><code class="language-python"># Quantum Circuit Code will appear here...</code></pre>
      </div>
    `;

    this.container.querySelectorAll('.code-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTab(btn.dataset.tab);
      });
    });

    const copyBtn = this.container.querySelector('#copy-code-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const codeText = this.container.querySelector('code').textContent;
        navigator.clipboard.writeText(codeText).then(() => {
          copyBtn.textContent = '✅ Copied!';
          setTimeout(() => { copyBtn.textContent = '📋 Copy Code'; }, 2000);
        });
      });
    }
  }
}
