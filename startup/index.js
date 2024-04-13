const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const DB = require('./database.js');

const authCookieName = 'token';

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middle ware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('startup/public'));

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

//getHighScore, for the Leaderboard. This is restricted to top 10, for now.
secureApiRouter.get('/highTotalScores', async (_req, res) => {
  const scores = await DB.getHighScores('totalScores')
  res.send(scores);
  });

secureApiRouter.get('/highBestScores', async (_req, res) => {
    const scores = await DB.getHighScores('bestScores');
    res.send(scores);
  });

secureApiRouter.get('/highTimeScores', async (_req, res) => {
  const scores = await DB.getHighScores('timeScores');
  res.send(scores);
});

// GetScores (for play, we need to still check username for flagging to update PB)
secureApiRouter.get('/totalScores', async (_req, res) => {
  const scores = await DB.getAllScores('totalScores');
  res.send(scores);
});

secureApiRouter.get('/bestScores', async (_req, res) => {
  const scores = await DB.getAllScores('bestScores');
  res.send(scores);
});

secureApiRouter.get('/timeScores',  async (_req, res) => {
  const scores = await DB.getAllScores('timeScores');
  res.send(scores);
});

// SubmitScore
secureApiRouter.post('/totalScore',  async(req, res) => {
  const totalScore = { ...req.body, ip: req.ip };
  await DB.addTotalScore(totalScore);
  const scores = DB.getHighScores("totalScores");
  res.send(scores);
});

secureApiRouter.post('/bestScore', async (req, res) => {
  const totalScore = { ...req.body, ip: req.ip };
  await DB.addBestScore(totalScore);
  const scores = DB.getHighScores("bestScores");
  res.send(scores);
});

secureApiRouter.post('/timeScore', async (req, res) => {
  const totalScore = { ...req.body, ip: req.ip };
  await DB.addBestTime(totalScore);
  const scores = DB.getHighScores("timeScores");
  res.send(scores);
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'startup/public' });
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






