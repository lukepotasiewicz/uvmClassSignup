const express = require('express');
const fs = require('fs');
const app = express();
const port = 6969;

const readDatabase = () => JSON.parse(fs.readFileSync('database.json'));

const getUser = (netId) => {
  const jsonData = readDatabase();
  return jsonData[netId];
};

const writeDatabase = (data) => {
  const oldData = readDatabase();
  fs.writeFileSync('database.json', JSON.stringify({...oldData, ...data}));
};

app.get('/', (req, res) => res.send(
    `<h1>Welcome to UVM2: proxy server.</h1>
    <h3>/getUser?netId=netid</h3>
        returns user information</br>
    <h3>/addUser?netId=netid</h3>
        creates user</br>
        returns query</br>
    <h3>/addClasses?netId=netid&classes=RN1,RN2,RN3</h3>
        adds classes to user</br>
        returns query</br>
    <h3>/deleteClass?netId=netid&classes=RN1,RN2,RN3</h3>
        removes classes from user</br>
        returns query</br>
    `
    ));

app.get('/health', (req, res) => res.status(200).json({healthy: true}));

// ----------- GET -----------
app.get('/getUser', (req, res) => {
  if (!req.query.netId) return res.status(400).json({error: "Bad request"});
  const userData = getUser(req.query.netId);
  if (!userData) return res.status(500).json({error: "User not found"});
  return res.status(userData.error ? 500 : 200).json(userData);
});

// ----------- ADD -----------
app.get('/addUser', (req, res) => {
  if (!req.query.netId) return res.status(400).json({error: "Bad request"});
  const newUser = {netId: req.query.netId, classes: []};
  writeDatabase({[req.query.netId]: newUser});
  return res.status(200).json({queryString: req.query});
});

app.get('/addClasses', (req, res) => {
  if (!req.query.netId || !req.query.classes) return res.status(400).json({error: "Bad request"});
  const userData = getUser(req.query.netId);
  if (!userData) return res.status(500).json({error: "User not found"});
  userData.classes = userData.classes.concat(req.query.classes.split(','));
  writeDatabase({[req.query.netId]: userData});
  return res.status(200).json({queryString: req.query});
});

// ----------- DELETE -----------
app.get('/deleteClass', (req, res) => {
  if (!req.query.netId || !req.query.classes) return res.status(400).json({error: "Bad request"});
  const userData = getUser(req.query.netId);
  if (!userData) return res.status(500).json({error: "User not found"});
  const classesToRemove = req.query.classes.split(',');
  userData.classes = userData.classes.reduce((acc, c) => classesToRemove.includes(c) ? acc : [...acc, c], []);
  writeDatabase({[req.query.netId]: userData});
  return res.status(200).json({...req.query});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
