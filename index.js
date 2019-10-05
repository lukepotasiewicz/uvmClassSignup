const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

const readDatabase = () => JSON.parse(fs.readFileSync('database.json'));

const getUser = (netId) => {
    const jsonData = readDatabase();
    const userData = jsonData[netId];
};

const writeDatabase = (data) => {
    const oldData = readDatabase();
    fs.writeFileSync('database.json',  JSON.stringify({...oldData, ...data}));
};

app.get('/', (req, res) => res.send("welcome to my proxy server"));

app.get('/health', (req, res) => res.status(200).json({healthy: true}));

// ----------- GET -----------
app.get('/getClasses', (req, res) => {
    if (!req.query.netId) return res.status(400).json({error: "Bad request"});
    const userData = getUser(req.query.netId);
    if (!userData) return res.status(500).json({error: "User not found"});
    return res.status(userData.error ? 500 : 200).json(userData);
});

// ----------- ADD -----------
app.get('/addUser', (req, res) => {
    if (!req.query.netId) return res.status(400).json({error: "Bad request"});
    const userData = getUser(req.query.netId);
    if (!userData) return res.status(500).json({error: "User not found"});
    const newUser = { netId: req.query.netId, classes: [] };
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
    if (!req.query.netId) return res.status(400).json({error: "Bad request"});
    return res.status(200).json({...req.query});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
