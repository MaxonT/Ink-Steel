class PenTimer extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Cormorant Garamond', serif;
        }
        .timer-container {
          text-align: center;
        }
        .time-display {
          font-size: 3rem;
          margin: 1rem 0;
          color: #333;
        }
        button {
          background: #333;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          margin: 0.5rem;
          cursor: pointer;
          transition: background 0.3s ease;
          font-family: inherit;
          font-size: 1rem;
        }
        button:hover {
          background: #555;
        }
        .instructions {
          font-size: 0.9rem;
          color: #666;
          margin-top: 1.5rem;
        }
      </style>
      <div class="timer-container">
        <h3 class="text-xl font-light">Pen Cleaning Timer</h3>
        <div class="time-display">05:00</div>
        <button id="start-btn">Start</button>
        <button id="reset-btn">Reset</button>
        <p class="instructions">
          Recommended cleaning time: 5 minutes for most pens. 
          Flush until water runs clear.
        </p>
      </div>
    `;

    let timeLeft = 300; // 5 minutes in seconds
    let timerInterval;
    const timeDisplay = this.shadowRoot.querySelector('.time-display');
    const startBtn = this.shadowRoot.getElementById('start-btn');
    const resetBtn = this.shadowRoot.getElementById('reset-btn');

    const updateDisplay = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    startBtn.addEventListener('click', () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        startBtn.textContent = 'Start';
        timerInterval = null;
      } else {
        timerInterval = setInterval(() => {
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeDisplay.textContent = "Done!";
            return;
          }
          timeLeft--;
          updateDisplay();
        }, 1000);
        startBtn.textContent = 'Pause';
      }
    });

    resetBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      timeLeft = 300;
      updateDisplay();
      startBtn.textContent = 'Start';
      timerInterval = null;
    });

    updateDisplay();
  }
}

customElements.define('pen-timer', PenTimer);