const express = require('express');
const app = express();

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// GetScores
apiRouter.get('/totalScores', (_req, res) => {
  res.send(totalScores);
});

apiRouter.get('/bestScores', (_req, res) => {
  res.send(bestScores);
});

apiRouter.get('/timeScores', (_req, res) => {
  res.send(timeScores);
});

// SubmitScore
apiRouter.post('/totalScore', (req, res) => {
  totalScores = updateTotalScores(req.body, totalScores);
  res.send(totalScores);
});

apiRouter.post('/bestScore', (req, res) => {
  totalScores = updateBestScores(req.body, bestScores, true);
  res.send(bestScores);
});

apiRouter.post('/timeScore', (req, res) => {
  totalScores = updateBestScores(req.body, timeScores, false);
  res.send(timeScores);
});


// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// updateScores considers a new score for inclusion in the high scores.
// The high scores are saved in memory and disappear whenever the service is restarted.

let totalScores = [];
let bestScores = [];
let timeScores = [];
function updateTotalScores(scoreData, scores) {
  const userName = scoreData.userName;
  const score = scoreData.score;
  const date = new Date().toLocaleDateString();
      let index = -1;
      let prevScore = 0;
      for(const [i, validScore] of scores.entries()) {
        if(userName === validScore.name) {
            prevScore = validScore.score;
            index = i;
            break;
        }
      }
      const newScore = { name: userName, score: score + prevScore, date: date};
      if (prevScore === 0) {
        scores.push(newScore); //new username
      } else {
        scores.splice(index, 1, newScore);
      }
      return scores;
}



