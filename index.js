const express = require('express');
const fs = require('fs');
const app = express();
const port = 6789;


const {
    Builder,
    By,
    Key,
    until
} = require('selenium-webdriver');
let webdriver = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let chromedriver = require('chromedriver');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());


const readDatabase = () => JSON.parse(fs.readFileSync('database.json'));

const getUser = (res, netId, pass, test = false) => {
    const jsonData = readDatabase();
    if (test) {
        return jsonData[netId];
    }
    if (!jsonData[netId]) {
        res.status(500).json({error: "User not found"}).end();
        return null;
    }
    if (jsonData[netId].password !== pass) {
        res.status(401).json({error: "authentication failed"}).end();
        return null;
    }
    return jsonData[netId];
};

const writeDatabase = (data) => {
    const oldData = readDatabase();
    fs.writeFileSync('database.json', JSON.stringify({...oldData, ...data}));
};

app.get('/', (req, res) => res.send(
    `<h1>Welcome to UVM2: proxy server.</h1>
    <h3>/getUser?netId=netid&password=password</h3>
        returns user information</br>
    <h3>/addUser?netId=netid&password=password</h3>
        creates user</br>
        returns query</br>
    <h3>/addClasses?netId=netid&password=password&classes=RN1,RN2,RN3</h3>
        adds classes to user</br>
        returns query</br>
    <h3>/deleteClass?netId=netid&password=password&classes=RN1,RN2,RN3</h3>
        removes classes from user</br>
        returns query</br>
    <h4>For testing (so your "test" password saved on the DB isn't used): </h4>
    <h3>/register?netId=netid&password=password&classes=RN1,RN2,RN3&test=true</h3>
        using selenium, goes to banner, logs in, clicks to the registration page and registers you for up to 7 classes</br>
        sends back and image file (downloaded), showing you the results from banner</br>
    <h4>For use if the password in the DB is your actual password (dont use):</h4>
    <h3>/register?netId=netid&password=password</h3>
        using selenium, goes to banner, logs in, clicks to the registration page and registers you for up to 7 classes</br>
        sends back and image file (downloaded), showing you the results from banner</br>
    `
));

app.get('/health', (req, res) => res.status(200).json({healthy: true}));

// ----------- GET -----------
app.get('/getUser', (req, res) => {
    if (!req.query.netId || !req.query.password) return res.status(400).json({error: "Bad request"});
    const userData = getUser(res, req.query.netId, req.query.password);
    if (!userData) return null;
    return res.status(userData.error ? 500 : 200).json(userData);
});

// ----------- ADD -----------
app.get('/addUser', (req, res) => {
    if (!req.query.netId || !req.query.password) return res.status(400).json({error: "Bad request"});
    const newUser = {netId: req.query.netId, password: req.query.password, classes: []};
    writeDatabase({[req.query.netId]: newUser});
    return res.status(200).json({queryString: req.query});
});

app.get('/addClasses', (req, res) => {
    if (!req.query.netId || !req.query.classes || !req.query.password) return res.status(400).json({error: "Bad request"});
    const userData = getUser(res, req.query.netId, req.query.password);
    if (!userData) return null;
    userData.classes = userData.classes.concat(req.query.classes.split(','));
    writeDatabase({[req.query.netId]: userData});
    return res.status(200).json({queryString: req.query});
});

// ----------- DELETE -----------
app.get('/deleteClass', (req, res) => {
    if (!req.query.netId || !req.query.classes || !req.query.password) return res.status(400).json({error: "Bad request"});
    const userData = getUser(res, req.query.netId, req.query.password);
    if (!userData) return null;
    const classesToRemove = req.query.classes.split(',');
    userData.classes = userData.classes.reduce((acc, c) => classesToRemove.includes(c) ? acc : [...acc, c], []);
    writeDatabase({[req.query.netId]: userData});
    return res.status(200).json({...req.query});
});

app.get("/register", async (req, res) => {
    if (!req.query.netId || !req.query.password) return res.status(400).json({error: "Bad request"});
    let userData = getUser(res, req.query.netId, req.query.password, true);
    if (req.query.test === "true") {
        userData = {};
        userData.netId = req.query.netId;
        userData.password = req.query.password;
        userData.classes = req.query.classes.split(',');
    }
    if (!userData) return null;
    try {
        const driver = new webdriver.Builder()
            .withCapabilities(webdriver.Capabilities.chrome())
            .build();
        await driver.get('https://aisweb1.uvm.edu/pls/owa_prod/bwskfreg.P_AltPin');

        const usernameInput = driver.findElement(By.xpath("//input[@id='UserID']"));
        await usernameInput.click();
        await usernameInput.sendKeys(userData.netId);
        const passwordInput = driver.findElement(By.xpath("//input[@name='PIN']"));
        await passwordInput.click();
        await passwordInput.sendKeys(userData.password, Key.RETURN);

        await driver.findElement(By.xpath("//a[contains(text(),'Registration')]")).click();
        await driver.findElement(By.xpath("//a[contains(text(),'Register/Add/Drop/Withdraw Classes')]")).click();
        await driver.findElement(By.xpath("//input[@value='Submit']")).click();
        for (let i = 0; i < 7; i++) {
            if (userData.classes[i]) {
                const crnInput = driver.findElement(By.xpath("//input[@id='crn_id" + (i + 1) + "']"));
                if (userData.classes[i + 1]) {
                    await crnInput.sendKeys(userData.classes[i]);
                } else {
                    await crnInput.sendKeys(userData.classes[i], Key.RETURN);
                }
            }
        }
        let image = await driver.takeScreenshot();
        fs.writeFileSync('out.png', image, 'base64');
        driver.quit();
        res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment; filename=out.png"
        });
        fs.createReadStream("./out.png").pipe(res);
    } catch (e) {
      console.log(e);
      return res.status(200).json({success: false, error: e});
    }
    return res.status(200).json({success: true});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
