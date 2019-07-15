import express from 'express';
import config from './config';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import { guid } from './util';
import sharp from 'sharp';

const app = express();
const { port } = config;

const appDir = path.join(__dirname, '../dist');
const storage = `${__dirname}/stored`;

// Test

app.use(express.static(appDir));
app.use(express.json());

// app.get('/', function(req, res) {
//     res.sendFile(`${appDir}/index.html`);
// });

app.route('/rune').post((req, res) => {
    const rune = req.body;
    if (!rune.id) {
        rune.id = guid();
    }
    const filePath = `${storage}/${rune.id}.json`;
    // const file = fs.statSync(filePath);

    fs.writeFile(filePath, JSON.stringify(rune), err => {
        if (err) {
            console.log('Error saving', err);
            res.sendStatus(500);
        }
        console.log('Rune saved');
        res.sendStatus(200);
    });
});

app.get('/runes', (req, res) => {
    const runes = glob.sync(`${storage}/*`).map(f => {
        return JSON.parse(fs.readFileSync(f, 'utf-8'));
    });
    console.log('runes', runes);
    // if (runes) {
    res.send(runes);
});

app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
