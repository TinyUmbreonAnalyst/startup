const { MongoClient, MongoError } = require('mongodb');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('TinyDataCluster');
const userCollection = db.collection('user');
const totalScoreCollection = db.collection('totalScores');
const bestScoreCollection = db.collection('bestScores');
const timeScoreCollection = db.collection('timeScores');



// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  await client.connect();
  await db.command({ ping: 1 });
})().catch((ex) => {
  console.log(`Unable to connect to database with ${url} because ${ex.message}`);
  process.exit(1);
});

function getUser(email) {
  return userCollection.findOne({ email: email });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function createUser(email, password) {
  // Hash the password before we insert it into the database
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  await userCollection.insertOne(user);

  return user;
}

async function addTotalScore(score) {
  const options = {
    upsert: true
  }
  if (await totalScoreCollection.estimatedDocumentCount() > 0) {
    totalScoreCollection.updateOne({name: score.name}, {$inc: {score: score.score}, $set: {date: score.date}}, options);
  }
  else {
    totalScoreCollection.insertOne(score);
  }
}

async function addBestScore(score) {
  const options = {
    upsert: true
  }
  if (await bestScoreCollection.estimatedDocumentCount() > 0){
    bestScoreCollection.updateOne({name: score.name}, {$set:{date: score.date, score: {$max: score.score}}}, options);
  }
  else {
    bestScoreCollection.insertOne(score);
  }
}

async function addBestTime(score) {
  const options = {
    upsert: true
  }
  if (await timeScoreCollection.estimatedDocumentCount() > 0) {
    timeScoreCollection.updateOne({name: score.name}, {$set: {date: score.date, score: {$min: score.score}}}, options); //why
  }
  else {
    timeScoreCollection.insertOne(score);
  }
}

function getAllScores(name) {
  let database;
  switch (name) {
    case ('totalScores'):
      database = totalScoreCollection;
      break;
    case ('bestScores'):
      database = bestScoreCollection;
      break;
    case ('timeScores'):
      database = timeScoreCollection;
      break;
    default:
      throw new MongoError("Unknown Database Access");
      
  }
  //inactive people get score of 60001, if you recall.
  const query = { score: { $gt: 0, $lt: 60000 } }; 
  const options = {
    sort: { userName:  1}
  };
  const cursor = database.find(query, options);
  return cursor.toArray();
}

function getHighScores(name) {
  let database;
  let direction;
  switch (name) {
    case ('totalScores'):
      database = totalScoreCollection;
      direction = -1;
      break;
    case ('bestScores'):
      database = bestScoreCollection;
      direction = -1;
      break;
    case ('timeScores'):
      database = timeScoreCollection;
      direction = 1;
      break;
    default:
      throw new MongoError("Unknown Database Access");
  }
  const query = { score: { $gt: 0, $lt: 60000 } };
  const options = {
    sort: { score: direction },
    limit: 10,
  };
  const cursor = database.find(query, options);
  return cursor.toArray();
}

module.exports = {
  getUser,
  getUserByToken,
  createUser,
  addTotalScore,
  addBestScore,
  addBestTime,
  getHighScores,
  getAllScores,
};
