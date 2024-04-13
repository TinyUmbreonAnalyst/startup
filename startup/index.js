const express = require('express');
const app = express();

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middle ware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Trust headers that are forwarded from the proxy so we can determine IP addresses
app.set('trust proxy', true);

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth token for a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await DB.getUser(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await DB.createUser(req.body.email, req.body.password);

    // Set the cookie
    setAuthCookie(res, user.token);

    res.send({
      id: user._id,
    });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const user = await DB.getUser(req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      setAuthCookie(res, user.token);
      res.send({ id: user._id });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth token if stored in cookie
apiRouter.delete('/auth/logout', (_req, res) => {
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// GetUser returns information about a user
apiRouter.get('/user/:email', async (req, res) => {
  const user = await DB.getUser(req.params.email);
  if (user) {
    const token = req?.cookies.token;
    res.send({ email: user.email, authenticated: token === user.token });
    return;
  }
  res.status(404).send({ msg: 'Unknown' });
});


// secureApiRouter verifies credentials for endpoints
var secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});


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
  bestScores = updateBestScores(req.body, bestScores, true);
  res.send(bestScores);
});

apiRouter.post('/timeScore', (req, res) => {
  timeScores = updateBestScores(req.body, timeScores, false);
  res.send(timeScores);
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

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

function updateBestScores(scoreData, scores, mode) {
  const userName = scoreData.userName;
  const score = scoreData.score;
  const date = new Date().toLocaleDateString();
  let index = -2;
  for(const [i, validScore] of scores.entries()) {
    if(userName === validScore.name ) {
      index = -1;
      if(isBetterThan(score, validScore.score, mode)){
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

function isBetterThan(newScore, oldScore, mode) {
  if(mode) {
    return (newScore > oldScore);
  }
  return (newScore < oldScore); //time here
}





