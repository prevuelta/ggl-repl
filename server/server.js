import express from 'express';
import config from './config';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import { guid } from './util';
import svg2img from 'svg2img';
// import gm from 'gm';
// const im = gm.subClass({ imageMagick: true });

const app = express();
const { port } = config;

const appDir = path.join(__dirname, '../dist');
const storage = `${__dirname}/stored`;
const thumbDir = `${storage}/stored`;

app.use(express.static(appDir));
app.use('/thumbs', express.static(`${storage}/thumbs`));
app.use(express.json());

// app.get('/', function(req, res) {
//     res.sendFile(`${appDir}/index.html`);
// });

app
    .route('/rune')
    .post((req, res) => {
        const rune = req.body;
        if (!rune.id) {
            rune.id = guid();
        }

        const filePath = `${storage}/${rune.id}.json`;

        svg2img(rune.svg, (error, buffer) => {
            //returns a Buffer
            const thumbFileName = `${rune.id}.png`;
            const thumbPath = `${storage}/thumbs/${thumbFileName}`;
            fs.writeFileSync(thumbPath, buffer);
            rune.thumb = thumbFileName;

            fs.writeFile(filePath, JSON.stringify(rune), err => {
                if (err) {
                    res.sendStatus(500);
                }
                res.sendStatus(200);
            });
        });

        // const buf = new Buffer(rune.svg);
        // im(buf)
        //     .resize(100, 100)
        // .write(`${storage}/thumbs/test.png`, err => {
        //     console.log('Error', err);
        // });
    })
    .delete((req, res) => {
        const { id } = req.body;
        console.log(id);
        fs.unlinkSync(`${storage}/thumbs/${id}.png`);
        fs.unlinkSync(`${storage}/${id}.json`);
        return 200;
    });

app.get('/runes', (req, res) => {
    console.log('Storage', storage);
    const runes = glob.sync(`${storage}/*.json`).map(f => {
        return JSON.parse(fs.readFileSync(f, 'utf-8'));
    });
    // console.log('Runes', runes);
    // if (runes) {
    res.send(runes);
});

app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
