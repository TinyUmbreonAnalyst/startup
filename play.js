const btnDescriptions = [
    { file: 'mine.mp3'},
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
    val;

    constructor() {
      this.mode = false;
      this.button = new Map();
      this.allowPlayer = false;
      this.mineSound = loadSound('mine.mp3');
      this.boinkSound = loadSound('boink.mp3');
      this.score = 1000;
      this.time = 0;
      this.val = 0;
      this.setMode();
  
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
        const timeButtons = document.querySelector('#time');
        const top = document.querySelector(".top");
        const bottom = document.querySelector(".bottom");
        if (timeButtons.checked) {
            this.mode = true;
            top.classList.add("timer");
            top.classList.remove("score");
            bottom.classList.add("score");
            bottom.classList.remove("timer");
            this.setScore(0);
            this.setTimer(60.0);
        } else {
            this.mode = false;
            top.classList.add("score");
            top.classList.remove("timer");
            bottom.classList.add("timer");
            bottom.classList.remove("score");
            this.setScore(1000);
            this.setTimer(0.0);
        }
    }

    async startGame() {
        const modeBox = document.querySelector(".mode-box");
        modeBox.setAttribute("display", "none"); //hide it
        this.countdown();
        this.allowPlayer = true;
        await this.LaunchTimer(); //aka, play the game
        this.allowPlayer = false;
        //do some other stuff, like ferrying up the scores
    }

    async LaunchTimer() {
        if (this.mode) {
            //timer mode
            await this.Timer();
        } else {
            //score mode
            await this.Scorer();
        }
    }

    async Timer() {
        var id = setInterval(() => this.adjustTimer(), 100);
        while (this.time > 0) {
            delay(3000);
            this.hideWeakSpot();
            this.generateWeakSpot();
        }
        clearInterval(id);
    }

    countDown() {
        
    }

    async Scorer() {
        const s = this.score;
        const count = 0;
        while (score > 0 && count < 20) {
            delay(3000);
            this.hideWeakSpot();
            this.generateWeakSpot();
            if (this.score === s) { //inactivity timer
                count = count + 1;
            }
            else {
                count = 0;
            }
        }
    }

    hideWeakSpot() {
        document.querySelectorAll(".X").forEach((el, i) => {
        if (el.style.zindex >= 0) {
            if (el.classList.contains("red")) {
                el.style.setProperty("z-index", "-2");
            } else {
                el.style.setProperty("z-index", "-3");
            }
        }
        const weakContainer = document.querySelector(".weakContainer");
        if (weakContainer.style.zindex >= 0) {
            weakContainer.style.setProperty("z-index", "-5");
        }
        const weakPoint = document.querySelector(".weakPoint");
        if (weakPoint.style.zindex >= 0) {
            weakPoint.setProperty("z-index", "-4");
        }
       });
    }

    generateWeakSpot() {
        const rand = Math.random() * 10;
        if (rand >= 5) {
            const ypos = Math.random() *100 - 50;
            const xpos = Math.random() * 100;
            while (this.checkDistance(xpos, ypos, 50, 0) > 50 ** 2) {
                ypos = Math.random() *100 - 50;
                xpos = Math.random() * 100;
            }
            this.val = Math.random() * 50;
            if (rand >= 9.5 ) {
                const gold = document.querySelector(".gold");
                gold.style.setProperty("z-index", "3");
                this.val = this.val + 150;
                //umb maybe?
            }
            else {
                const red = document.querySelector(".red");
                red.style.setProperty("z-index", "2");
                this.val = val + 10;
            }
            const weakContainer = document.querySelector("weakContainer");
            weakContainer.style.setProperty("margin-left", `${xpos}%`);
            weakContainer.style.setProperty("margin-top", `${ypos}%`);
        }
    }

    checkDistance(xpos, ypos, cxpos, cypos) {
        return (xpos - cxpos) **2 + (ypos - cypos) **2;
    }

    adjustTimer() {
        this.time = this.time + .1 * this.modeCount();
        this.setTimer(this.time);
    }

    setScore(number) {
        const scorer = document.querySelector(".score");
        scorer.textContent = `${number}`;
    }

    setTimer(time) {
        const scorer = document.querySelector(".timer");
        scorer.textContent = `${time}`;
    }
  
    async pressButton(button) {
      if (this.allowPlayer) {
        this.mineSound.play();
        this.score = this.score + this.modeCount();
        this.setScore(this.score);
        } else {
          this.boinkSound.play();
        }
    }

    modeCount() {
        if (mode) {
            return 1;
        }
        return -1;
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
    let audio = new Audio('assets/' + filename);
    return audio;
  }
  
  // Simulate chat messages that will come over WebSocket
  setInterval(() => {
    const score = Math.floor(Math.random() * 100);
    const chatText = document.querySelector('#player-messages');
    chatText.innerHTML = chatText.innerHTML
       +`<div class="event"><span class="player-event">Tiny</span> broke rock in ${score} seconds!</div>`;
    if (chatText.childElementCount > 9) {
        while (chatText.childElementCount > 9) {
            chatText.removeChild(chatText.childNodes[0]);
        }
    }
  }, 60000);
  