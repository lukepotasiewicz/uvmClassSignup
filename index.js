const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.get('/read', (req, res) => {
  const contents = fs.readFileSync('database.json');
  const jsonData = JSON.parse(contents);
  res.status(200).json({data: jsonData});
});

app.get('/write', (req, res) => {
  const data = JSON.stringify(req.query);
  fs.writeFileSync('database.json', data);
  res.status(200).json({querySring: req.query});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
