(() => {
  'use strict';

  /* ================= Config ================= */
  const CHOICES = {
    rock:     { emoji: '✊', name: 'Taş',   beats: 'scissors' },
    paper:    { emoji: '✋', name: 'Kağıt',  beats: 'rock' },
    scissors: { emoji: '✌️', name: 'Makas', beats: 'paper' }
  };

  const STORAGE_KEY = 'tkm_scores_v1';
  const SOUND_KEY = 'tkm_sound_v1';

  /* ================= DOM ================= */
  const playerHandEl = document.getElementById('playerHand');
  const computerHandEl = document.getElementById('computerHand');
  const playerHandEmoji = playerHandEl.querySelector('.hand-emoji');
  const computerHandEmoji = computerHandEl.querySelector('.hand-emoji');

  const playerScoreEl = document.getElementById('playerScore');
  const computerScoreEl = document.getElementById('computerScore');
  const roundCountEl = document.getElementById('roundCount');

  const resultBadge = document.getElementById('resultBadge');
  const countdownEl = document.getElementById('countdown');
  const messageText = document.getElementById('messageText');

  const choiceButtons = Array.from(document.querySelectorAll('.choice-btn'));
  const historyList = document.getElementById('historyList');

  const soundBtn = document.getElementById('soundBtn');
  const resetBtn = document.getElementById('resetBtn');

  /* ================= State ================= */
  let state = {
    playerScore: 0,
    computerScore: 0,
    round: 0,
    history: [],
    soundOn: true
  };

  let isPlaying = false;

  /* ================= Persistence ================= */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        state.playerScore = saved.playerScore || 0;
        state.computerScore = saved.computerScore || 0;
        state.round = saved.round || 0;
        state.history = saved.history || [];
      }
      const soundRaw = localStorage.getItem(SOUND_KEY);
      state.soundOn = soundRaw === null ? true : soundRaw === '1';
    } catch (e) {
      /* ignore corrupted storage */
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        playerScore: state.playerScore,
        computerScore: state.computerScore,
        round: state.round,
        history: state.history.slice(-20)
      }));
      localStorage.setItem(SOUND_KEY, state.soundOn ? '1' : '0');
    } catch (e) {
      /* storage unavailable */
    }
  }

  /* ================= Audio (WebAudio, no files needed) ================= */
  let audioCtx = null;
  function getCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }

  function beep({ freq = 440, duration = 0.12, type = 'sine', volume = 0.2, delay = 0 }) {
    if (!state.soundOn) return;
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const startTime = ctx.currentTime + delay;
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  function playTickSound() {
    beep({ freq: 320, duration: 0.09, type: 'square', volume: 0.15 });
  }
  function playSelectSound() {
    beep({ freq: 520, duration: 0.1, type: 'triangle', volume: 0.18 });
  }
  function playWinSound() {
    beep({ freq: 523.25, duration: 0.14, type: 'sine', volume: 0.22, delay: 0 });
    beep({ freq: 659.25, duration: 0.14, type: 'sine', volume: 0.22, delay: 0.12 });
    beep({ freq: 783.99, duration: 0.2, type: 'sine', volume: 0.22, delay: 0.24 });
  }
  function playLoseSound() {
    beep({ freq: 300, duration: 0.18, type: 'sawtooth', volume: 0.18, delay: 0 });
    beep({ freq: 200, duration: 0.24, type: 'sawtooth', volume: 0.18, delay: 0.16 });
  }
  function playDrawSound() {
    beep({ freq: 440, duration: 0.15, type: 'square', volume: 0.16, delay: 0 });
    beep({ freq: 440, duration: 0.15, type: 'square', volume: 0.16, delay: 0.16 });
  }

  /* ================= Game logic ================= */
  function getComputerChoice() {
    const keys = Object.keys(CHOICES);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  function decideWinner(player, computer) {
    if (player === computer) return 'draw';
    if (CHOICES[player].beats === computer) return 'win';
    return 'lose';
  }

  function updateScoreUI() {
    playerScoreEl.textContent = state.playerScore;
    computerScoreEl.textContent = state.computerScore;
    roundCountEl.textContent = `Tur ${state.round}`;
  }

  function bumpScore(el) {
    el.classList.remove('bump');
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('bump');
  }

  function setChoicesDisabled(disabled) {
    choiceButtons.forEach(btn => {
      btn.disabled = disabled;
    });
  }

  function clearHandStates() {
    [playerHandEl, computerHandEl].forEach(el => {
      el.classList.remove('win', 'lose', 'draw', 'reveal', 'shaking');
    });
    resultBadge.classList.add('hidden');
    resultBadge.classList.remove('win', 'lose', 'draw');
  }

  function resetHandsDisplay() {
    playerHandEmoji.textContent = '❔';
    computerHandEmoji.textContent = '❔';
  }

  function addHistoryEntry(result, playerChoice) {
    state.history.push({ result, playerChoice });
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    const recent = state.history.slice(-15);
    if (recent.length === 0) {
      const span = document.createElement('span');
      span.className = 'history-empty';
      span.textContent = 'Henüz oyun oynanmadı';
      historyList.appendChild(span);
      return;
    }
    recent.forEach(entry => {
      const item = document.createElement('div');
      item.className = `history-item ${entry.result}`;
      item.title = entry.result === 'win' ? 'Kazandın' : entry.result === 'lose' ? 'Kaybettin' : 'Berabere';
      item.textContent = CHOICES[entry.playerChoice].emoji;
      historyList.appendChild(item);
    });
    historyList.scrollLeft = historyList.scrollWidth;
  }

  function launchConfetti() {
    const colors = ['#00e5ff', '#ff2e63', '#08d9d6', '#ffca28', '#00e676'];
    const count = 26;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const size = 6 + Math.random() * 8;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * 0.4}px`;
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      const duration = 1.8 + Math.random() * 1.4;
      piece.style.animationDuration = `${duration}s`;
      piece.style.opacity = '1';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), duration * 1000 + 200);
    }
  }

  function setMessage(text) {
    messageText.textContent = text;
  }

  async function playRound(playerChoice) {
    if (isPlaying) return;
    isPlaying = true;

    setChoicesDisabled(true);
    clearHandStates();
    resetHandsDisplay();

    // highlight selected button briefly
    choiceButtons.forEach(btn => btn.classList.toggle('selected', btn.dataset.choice === playerChoice));
    playSelectSound();

    playerHandEmoji.textContent = CHOICES[playerChoice].emoji;
    playerHandEl.classList.add('shaking');
    computerHandEl.classList.add('shaking');

    countdownEl.classList.remove('hidden');
    setMessage('Hazır ol...');

    const steps = ['3', '2', '1'];
    for (const step of steps) {
      countdownEl.textContent = step;
      playTickSound();
      await wait(430);
    }

    countdownEl.classList.add('hidden');
    playerHandEl.classList.remove('shaking');
    computerHandEl.classList.remove('shaking');

    const computerChoice = getComputerChoice();
    computerHandEmoji.textContent = CHOICES[computerChoice].emoji;

    playerHandEl.classList.add('reveal');
    computerHandEl.classList.add('reveal');

    const result = decideWinner(playerChoice, computerChoice);
    state.round += 1;

    let badgeText = '';
    if (result === 'win') {
      state.playerScore += 1;
      playerHandEl.classList.add('win');
      computerHandEl.classList.add('lose');
      resultBadge.classList.add('win');
      badgeText = '🎉 Kazandın!';
      setMessage(`${CHOICES[playerChoice].name}, ${CHOICES[computerChoice].name}'ı yendi!`);
      bumpScore(playerScoreEl);
      playWinSound();
      launchConfetti();
    } else if (result === 'lose') {
      state.computerScore += 1;
      playerHandEl.classList.add('lose');
      computerHandEl.classList.add('win');
      resultBadge.classList.add('lose');
      badgeText = '💥 Kaybettin!';
      setMessage(`${CHOICES[computerChoice].name}, ${CHOICES[playerChoice].name}'ı yendi!`);
      bumpScore(computerScoreEl);
      playLoseSound();
    } else {
      playerHandEl.classList.add('draw');
      computerHandEl.classList.add('draw');
      resultBadge.classList.add('draw');
      badgeText = '🤝 Berabere!';
      setMessage('İkiniz de aynı seçimi yaptınız.');
      playDrawSound();
    }

    resultBadge.textContent = badgeText;
    resultBadge.classList.remove('hidden');

    updateScoreUI();
    addHistoryEntry(result, playerChoice);
    saveState();

    choiceButtons.forEach(btn => btn.classList.remove('selected'));
    setChoicesDisabled(false);
    isPlaying = false;
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ================= Reset ================= */
  function resetGame() {
    if (isPlaying) return;
    state.playerScore = 0;
    state.computerScore = 0;
    state.round = 0;
    state.history = [];
    updateScoreUI();
    renderHistory();
    clearHandStates();
    resetHandsDisplay();
    setMessage('Skor sıfırlandı. Yeniden başla!');
    saveState();
  }

  /* ================= Sound toggle ================= */
  function updateSoundBtn() {
    soundBtn.textContent = state.soundOn ? '🔊' : '🔇';
    soundBtn.title = state.soundOn ? 'Ses Aç/Kapat (Açık)' : 'Ses Aç/Kapat (Kapalı)';
  }

  function toggleSound() {
    state.soundOn = !state.soundOn;
    updateSoundBtn();
    saveState();
    if (state.soundOn) beep({ freq: 600, duration: 0.08, type: 'sine', volume: 0.15 });
  }

  /* ================= Event bindings ================= */
  choiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playRound(btn.dataset.choice);
    });
  });

  soundBtn.addEventListener('click', toggleSound);
  resetBtn.addEventListener('click', resetGame);

  // Keyboard shortcuts: R, P, S
  window.addEventListener('keydown', (e) => {
    if (isPlaying) return;
    const key = e.key.toLowerCase();
    if (key === 'r') playRound('rock');
    else if (key === 'p') playRound('paper');
    else if (key === 's') playRound('scissors');
  });

  /* ================= Init ================= */
  function init() {
    loadState();
    updateScoreUI();
    renderHistory();
    updateSoundBtn();
    setMessage('Bir seçim yap ve oyunu başlat!');
  }

  init();
})();
