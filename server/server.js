import express from 'express';
import config from './config';
import path from 'path';
import glob from 'glob';
import fs from 'fs';

const app = express();
const { port } = config;

const appDir = path.join(__dirname, '../dist');

console.log(appDir);

app.use(express.static(appDir));
app.use(express.json());

// app.get('/', function(req, res) {
//     res.sendFile(`${appDir}/index.html`);
// });
app.post('/save', (req, res) => {
    const { svg, runeScript } = req.body;
    console.log(req.body, svg, runeScript);
    res.send(req.body);
});

app.get('/runes', (req, res) => {
    const runes = glob.sync(`${__dirname}/stored/*`).map(f => {
        return JSON.parse(fs.readFileSync(f, 'utf-8'));
    });
    console.log('runes', runes);
    // if (runes) {
    res.send(runes);
});

app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
