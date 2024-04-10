const btnDescriptions = [
    { file: 'mine.wav'},
  ];
  
  class Rock {
    constructor(description, el) {
      this.el = el;
      this.hue = description.hue;
      this.sound = loadSound(description.file);
      this.paint(25);
    }
  
    paint(level) {
      const background = `hsl(${this.hue}, 100%, ${level}%)`;
      this.el.style.backgroundColor = background;
    }
  
    async press(volume = 1.0) {
      return new Promise(async (pressResolve) => {
        this.paint(50);
        await this.playSound(volume);
        this.paint(25);
        pressResolve();
      });
    }
  
    async playSound(volume) {
      return new Promise((playResolve) => {
        this.sound.volume = volume;
        this.sound.onended = playResolve;
        this.sound.play();
      });
    }
  }
  
  class Game {
    button;
    allowPlayer;
    mineSound;
    boinkSound;
    score;
    time;
    mode;

    constructor() {
      this.mode = setMode();
      this.button = new Map();
      this.allowPlayer = false;
      this.mineSound = loadSound('mine.wav');
      this.mineSound.playbackRate = 5;
      this.boinkSound = loadSound('boink.wav');
      this.boinkSound.playbackRate = 5;
      this.score = setScore(this.mode);
      this.time = setTime(this.time);
      
  
      document.querySelectorAll('.rock').forEach((el, i) => {
        if (i < btnDescriptions.length) {
          this.button.set(el.id, new Rock(btnDescriptions[i], el));
        }
      });
  
      const playerNameEl = document.querySelector('.player-name');
      playerNameEl.textContent = this.getPlayerName();
    }

    //time is true
    setMode() {
        document.getElementById('#time')
    }
  
    async pressButton(button) {
      if (this.allowPlayer) {
        this.boinkSound.play();
        } else {
          this.mineSound.play();
        }
    }
  
  
    getPlayerName() {
      return localStorage.getItem('userName') ?? 'Mystery player';
    }
  
    //TODO: Add 3 more objects
    updateScore(score) {
      const scoreEl = document.querySelector('#score');
      scoreEl.textContent = score;
    }
  
  
    saveScore(score) {
      const userName = this.getPlayerName();
      let scores = [];
      const scoresText = localStorage.getItem('scores');
      if (scoresText) {
        scores = JSON.parse(scoresText);
      }
      scores = this.updateScores(userName, score, scores);
  
      localStorage.setItem('scores', JSON.stringify(scores));
    }
  
    updateScores(userName, score, scores) {
      const date = new Date().toLocaleDateString();
      const newScore = { name: userName, score: score, date: date };
  
      let found = false;
      for (const [i, prevScore] of scores.entries()) {
        if (score > prevScore.score) {
          scores.splice(i, 0, newScore);
          found = true;
          break;
        }
      }
  
      if (!found) {
        scores.push(newScore);
      }
  
      if (scores.length > 10) {
        scores.length = 10;
      }
  
      return scores;
    }
  }
  
  const game = new Game();
  
  function delay(milliseconds) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, milliseconds);
    });
  }
  
  function loadSound(filename) {
    return new Audio('assets/' + filename);
  }
  
  // Simulate chat messages that will come over WebSocket
  setInterval(() => {
    const score = Math.floor(Math.random() * 100);
    const chatText = document.querySelector('#player-messages');
    chatText.innerHTML =
      `<div class="event"><span class="player-event">Tiny</span> scored ${score}</div>` +
      chatText.innerHTML;
  }, 60000);
  