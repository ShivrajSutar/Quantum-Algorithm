/**
 * VideoLectureHub.js - Interactive Video Academy & Synchronized Classroom
 */

import { LectureCurriculum } from '../core/LectureCurriculum.js';

export class VideoLectureHub {
  /**
   * @param {HTMLElement} container - DOM container element
   * @param {Object} options
   * @param {Function} options.onLoadCircuit - Callback when user clicks 'Load Lecture Circuit to Workspace'
   */
  constructor(container, options = {}) {
    this.container = container;
    this.onLoadCircuit = options.onLoadCircuit || (() => {});
    this.activeLecture = LectureCurriculum[0];
    this.render();
  }

  setLecture(lectureId) {
    const lec = LectureCurriculum.find(l => l.id === lectureId);
    if (!lec) return;
    this.activeLecture = lec;
    this.render();
  }

  render() {
    const active = this.activeLecture;

    this.container.innerHTML = `
      <div class="video-academy-card">
        <div class="video-academy-header">
          <div class="academy-title">
            <span class="academy-icon">🎓</span>
            <div>
              <h3>Quantum Algorithm Video Academy</h3>
              <p class="subtitle">Structured Theoretical Lectures with Live Interactive Circuit Synchronization</p>
            </div>
          </div>
        </div>

        <div class="video-academy-grid">
          <!-- Left: Video Player & Lecture Notes -->
          <div class="video-player-column">
            <div class="video-wrapper">
              <iframe
                src="${active.videoUrl}?rel=0&modestbranding=1"
                title="${active.title}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
              </iframe>
            </div>

            <div class="video-details-card">
              <div class="video-meta-top">
                <span class="video-badge">${active.category}</span>
                <span class="video-duration">⏱️ ${active.duration}</span>
                <button id="load-lecture-circuit-btn" class="btn btn-sm btn-primary" style="margin-left: auto;">
                  🚀 Load Lecture Circuit to Workspace
                </button>
              </div>

              <h3 class="video-title">${active.title}</h3>
              <p class="video-instructor">Instructor: <span>${active.instructor}</span></p>
              <p class="video-summary">${active.summary}</p>

              <div class="key-takeaways-box">
                <h4>🔑 Key Mathematical Takeaways:</h4>
                <ul>
                  ${active.keyTakeaways.map(t => `<li>${t}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>

          <!-- Right: Playlist Track Selector -->
          <div class="playlist-column">
            <div class="playlist-header">
              <h4>📚 Course Syllabus (${LectureCurriculum.length} Lectures)</h4>
            </div>
            <div class="playlist-items-list">
              ${LectureCurriculum.map(lec => `
                <div class="playlist-item ${lec.id === active.id ? 'active' : ''}" data-id="${lec.id}">
                  <div class="playlist-item-icon">${lec.thumbnail}</div>
                  <div class="playlist-item-info">
                    <div class="playlist-item-title">${lec.title}</div>
                    <div class="playlist-item-meta">
                      <span>${lec.category}</span> • <span>${lec.duration}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Playlist Item click listeners
    this.container.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', () => {
        this.setLecture(item.dataset.id);
      });
    });

    // Load Lecture Circuit button
    const loadBtn = this.container.querySelector('#load-lecture-circuit-btn');
    if (loadBtn && active.interactiveCircuit) {
      loadBtn.addEventListener('click', () => {
        this.onLoadCircuit(active.interactiveCircuit);
        loadBtn.textContent = '✅ Circuit Loaded in Workspace!';
        setTimeout(() => {
          loadBtn.textContent = '🚀 Load Lecture Circuit to Workspace';
        }, 2500);

        // Smooth scroll down to circuit grid
        const grid = document.getElementById('circuit-grid-container');
        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }
}
