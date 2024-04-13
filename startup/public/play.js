const btnDescriptions = [
    { file: 'mine.mp3'},
  ];
  
  class Rock {
    constructor(description, el) {
      this.el = el;
      this.sound = loadSound(description.file);
    }
  
  
    async press(volume = 1.0) {
      return new Promise(async (pressResolve) => {
        await this.playSound(volume);
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
    boinkSound;
    score;
    time;
    mode;
    val;

    constructor() {
      this.mode = true;
      this.button = new Map();
      this.allowPlayer = false;
      this.boinkSound = loadSound('boink.mp3');
      this.score = 0;
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
        this.setMode();
        document.querySelectorAll(".mode-box").forEach((el) => {
            el.style.setProperty("display", "none");
        });
        await this.countDown();
        await this.LaunchTimer(); //aka, play the game
        this.allowPlayer = false;
        document.querySelectorAll(".mode-box").forEach((el) => {
            el.style.setProperty("display", "block");
        });
        this.hideWeakSpot();
        this.val = 0;
        const totalScore = this.getOreTotal();
        await this.saveScore(totalScore); //ferry up the scores
    }

    getOreTotal() {
        if (this.mode) {
            return this.score;
        }
        else {
            return 1000 - this.score; //overflow check
        }
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
        var id = setInterval(() => this.adjustTimer(), 1000);
        while (this.time > 0) {
            for (let i = 0; i < 30; i++) {
                if(this.time <= 0) {
                    break;
                }
                await delay(100); 
            } //for more precision
            this.hideWeakSpot();
            this.generateWeakSpot();
        }
        clearInterval(id);
        const rock = document.querySelector(".rock-text");
        rock.textContent = `Score: ${this.score} ore`;
    }
    
    async countDown() {
        const rock = document.querySelector(".rock-text");
        rock.style.setProperty("color", "rgb(31, 148, 23)");
        this.playSound(1.0);
        rock.textContent = "3";
        await delay(1000);
        rock.style.setProperty("color", "yellow");
        rock.textContent = "2";
        await delay(1000);
        rock.style.setProperty("color", "red");
        rock.textContent= "1";
        await delay(1000);
        this.allowPlayer = true;
        rock.style.setProperty("color", "rgb(213, 204, 42)");
        rock.textContent= "Start!";
        this.removeText(rock);
    }

    async removeText(rock) {
        await delay(1000);
        rock.textContent =  "";
    }

    async playSound(volume) {
        const sound = loadSound("CountDown.wav");
        return new Promise((playResolve) => {
          sound.volume = volume;
          sound.onended = playResolve;
          sound.play();
        });
    }

   async Scorer() {
        var id = setInterval(() => this.adjustTimer(), 1000);
        let s = this.score;
        let count = 0;
        while (this.score > 0 && count < 20) {
            for (let i = 0; i < 30; i++) {
                if(this.score <= 0) {
                    break;
                }
                await delay(100); 
            }
            this.hideWeakSpot();
            this.generateWeakSpot();
            if (this.score === s) { //inactivity timer
                count = count + 1;
            }
            else {
                count = 0;
                s = this.score;
            }
        }
        clearInterval(id);
        if (count == 20) {
          this.time = 60001; //this is the highest time you can take to do this, theorettically
        }
        const rock = document.querySelector(".rock-text");
        rock.textContent =  `Time: ${this.time} seconds`;
    }

    hideWeakSpot() {
        document.querySelectorAll(".X").forEach((el) => {
            if (el.style.zIndex >= 0) {
                if (el.classList.contains("red")) {
                    el.style.setProperty("z-index", "-2");
                } else {
                    el.style.setProperty("z-index", "-3");
                }
            }
        });
        const weakContainer = document.querySelector(".weakContainer");
        if (weakContainer.style.zIndex >= 0) {
            weakContainer.style.setProperty("z-index", "-5");
        }
        const weakPoint = document.querySelector(".weakPoint");
        if (weakPoint.style.zIndex >= 0) {
            weakPoint.style.setProperty("z-index", "-4");
        }
    }

    async weakPointHit () {
        this.setScore(this.score + this.val);
        this.val = 0;
        this.hideWeakSpot();
    }

    generateWeakSpot() {
        const rand = Math.random() * 10;
        if (rand >= 5) {
            let ypos = Math.random() *100 - 50;
            let xpos = Math.random() * 100 - 50;
            while (this.checkDistance(xpos, ypos, 0, 0) > 50 ** 2) {
                ypos = Math.random() *100 - 50;
                xpos = Math.random() * 100;
            }
            this.val = Math.round(Math.random() * 50)* this.modeCount()* -1;
            if (rand >= 9.5 ) {
                const gold = document.querySelector(".gold");
                gold.style.setProperty("z-index", "5");
                this.val = this.val + 150 * this.modeCount()* -1;
                //umb maybe?
            }
            else {
                const red = document.querySelector(".red");
                red.style.setProperty("z-index", "5");
                this.val = this.val + 10 * this.modeCount()* -1;
            }
            const weakContainer = document.querySelector("div .weakContainer")
            weakContainer.style.setProperty("z-index", "4");
            const weakPoint = document.querySelector(".weakPoint");
            weakPoint.style.setProperty("z-index", "6");
            weakContainer.style.setProperty("margin-left", `${xpos}%`);
            weakContainer.style.setProperty("margin-top", `${ypos}%`);
        }
    }

    checkDistance(xpos, ypos, cxpos, cypos) {
        return (xpos - cxpos) **2 + (ypos - cypos) **2;
    }

    adjustTimer() {
        this.time = this.time + this.modeCount();
        this.setTimer(this.time);
    }

    setScore(number) {
        const scorer = document.querySelector(".score");
        scorer.textContent = `${number}`;
        this.score = number;
    }

    setTimer(time) {
        const scorer = document.querySelector(".timer");
        scorer.textContent = `${time}`;
        this.time = time;
    }
  
    async pressButton(button) {
      if (this.allowPlayer) {
        this.button.get(button.id).press(1.0);
        this.score = this.score - this.modeCount();
        this.setScore(this.score);
        } else {
          this.boinkSound.play();
        }
    }

    modeCount() {
        if (this.mode) {
            return -1;
        }
        return 1;
    }
  
  
    getPlayerName() {
      const name = localStorage.getItem('userName') ?? 'Mystery player';
      if (name === "") {
        return 'Mystery player';
      }
      return name;
    }
      
  
  
    async saveScore(totalScore) {
      const userName = this.getPlayerName();
      const date = new Date().toLocaleDateString();
      if (userName !== "Mystery player") { //not offline game
        const bestScore = this.getBestScore();
        // The only reson we have this is to ensure that, in case of an outage, the game can still run.
        // Probably could be optimized away, but I am too lazy to do it. Service calls for this still exist.
        let scores = await this.getScoreArray(); 
        let bests = await this.getBestArray();
        try {
          const response = await fetch('/api/totalScore', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({userName: userName, score: totalScore, date: date}),
          });
    
          // Store what the service gave us as the high scores
          scores = await response.json();
        } catch {
          // If there was an error then just track scores locally
          scores = this.updateTotalScoresLocal(userName, totalScore, scores);
        }

        try {
          const m = this.getString();
          const response = await fetch(`/api/${m}Score`, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({userName: userName, score: bestScore, date: date}),
          });

          bests = await response.json();
        } catch {
          bests = this.updateBestScoresLocal(userName, bestScore, bests);
        }
        localStorage.setItem('totalScores', JSON.stringify(scores));
        if(this.mode) {
            localStorage.setItem("bestScores", JSON.stringify(bests));
        } else {
            localStorage.setItem("bestTimes", JSON.stringify(bests));
        }
      }
    }

    getString() {
      if (this.mode) {
        return "best";
      }
      return "time";
    }

    getBestScore() {
        if (this.mode) {
            return this.score;
        }
        return this.time;
    }

    async getScoreArray() {
      try {
        const totalResponse = await fetch('/api/totalScores');
        return await totalResponse.json();
      } catch {
        const scoresText = localStorage.getItem('totalScores');
        if (scoresText) {
          return JSON.parse(scoresText);
        }
        return [];
      }
    }

    async getBestArray() {
      if (this.mode) {
        try {
          const bestResponse = await fetch('/api/bestScores');
          return await bestResponse.json();
        } catch {
          const text = localStorage.getItem("bestScores");
          if (text) {
            return JSON.parse(text);
          }
          return [];
        }
      }
      else {
        try {
          const timeResponse = await fetch('/api/timeScores');
          return await timeResponse.json();
        } catch  {
          const text = localStorage.getItem("bestTimes");
          if (text) {
            return JSON.parse(text);
          }
          return [];
        }
      }
    }

  
    //in this case, add score. 
    updateTotalScoresLocal(userName, score, scores) {
      const date = new Date().toLocaleDateString();
      let index = -1;
      let prevScore = 0;
      for(const [i, validScore] of scores.entries()) {
        if(userName === validScore.userName) {
            prevScore = validScore.score;
            index = i;
            break;
        }
      }
      const newScore = { userName: userName, score: score + prevScore, date: date};
      if (prevScore === 0) {
        scores.push(newScore); //new username
      } else {
        scores.splice(index, 1, newScore);
      }
      return scores;
    }

    updateBestScoresLocal(userName, score, scores) {
        const date = new Date().toLocaleDateString();
        let index = -2;
        for(const [i, validScore] of scores.entries()) {
          if(userName === validScore.userName ) {
            index = -1;
            if(this.isBetterThan(score, validScore.score)){
                index = i;
            }
            break;
          }
        }
        const newScore = { name: userName, score: score, date: date};
        if (index === -2) {
          scores.push(newScore); //new username
        } else if(index !== -1){
          scores.splice(index, 1, newScore); //better score
        }
        return scores;
      }

    isBetterThan(newScore, oldScore) {
        if(this.mode) {
            return (newScore > oldScore);
        }
        return (newScore < oldScore); //time here
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
  