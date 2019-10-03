const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send("welcome to my proxy server"));
app.get('/health', (req, res) => res.status(200).json({healthy: true}));

app.get('/getClasses', (req, res) => {
    res.status(200).json({
        user: req.query.user,
        classes: [
            {crn: 123, name: "Yeet Class"},
            {crn: 234, name: "Yote Class"},
            {crn: 345, name: "Yurt Class"},
            {crn: 456, name: "Turtle Class"},
        ]
    })
});

app.post('/addClass', (req, res) => {
    res.status(200).json({...req.query})
});

app.post('/createUser', (req, res) => {
    res.status(200).json({...req.query})
});

app.delete('/deleteClass', (req, res) => {
    res.status(200).json({...req.query})
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));