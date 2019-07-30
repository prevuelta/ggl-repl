import express from 'express';
import config from './config';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import { guid, generateName } from './util';
import svg2img from 'svg2img';
import { exec } from 'child_process';

const app = express();
const { port } = config;

const appDir = path.join(__dirname, '../dist');
const storage = `${__dirname}/stored`;
const thumbDir = `${storage}/thumbs`;
const tmpDir = `${__dirname}/tmp`;

app.use(express.static(appDir));
app.use('/thumbs', express.static(`${storage}/thumbs`));
app.use(express.json());

// app.get('/', function(req, res) {
//     res.sendFile(`${appDir}/index.html`);
// });

app.route('/rune')
    .post((req, res) => {
        const rune = req.body;

        rune.modified = +new Date();

        if (!rune.id) {
            rune.id = guid();
            rune.created = +new Date();
        }

        const filePath = `${storage}/${rune.id}.json`;

        console.log('Saving svg', rune.svg);

        svg2img(rune.svg, (error, buffer) => {
            //returns a Buffer
            const thumbFileName = `${rune.id}.png`;
            const thumbPath = `${thumbDir}/${thumbFileName}`;
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
    .put((req, res) => {
        const newRune = {
            id: guid(),
            script: '',
            svg: '',
            name: generateName(),
            modified: +new Date(),
            created: +new Date(),
        };
        const filePath = `${storage}/${newRune.id}.json`;
        fs.writeFile(filePath, JSON.stringify(newRune), err => {
            if (err) {
                res.sendStatus(500);
            }
            res.sendStatus(200);
        });
    })
    .delete((req, res) => {
        const { id } = req.body;
        fs.unlink(`${storage}/${id}.json`, err => {
            if (err) console.log('huh', err);
            const thumbPath = `${storage}/thumbs/${id}.png`;
            if (fs.existsSync(thumbPath)) {
                fs.unlink(thumbPath, err => {
                    if (err) console.log('Wat', err);
                    res.sendStatus(204);
                });
            } else {
                res.sendStatus(204);
            }
        });
    });

const output = `${tmpDir}/montage.png`;
exec(`montage ${storage}/thumbs/*.png ${output}`, (err, stdout, stderr) => {
    console.log(err, stdout, stderr);
});

app.get('/preview', (req, res) => {
    const output = `${tmpDir}/montage.png`;
    exec(`montage ${storage}/thumbs/*.png ${output}`, (err, stdout, stderr) => {
        if (err) {
            res.sendStatus(500);
        }
        res.sendFile(output);
    });
});

app.get('/runes', (req, res) => {
    const runes = glob.sync(`${storage}/*.json`).map(f => {
        return JSON.parse(fs.readFileSync(f, 'utf-8'));
    });
    runes.sort((a, b) => {
        return +a.created > +b.created ? 1 : +a.created < +b.created ? -1 : 0;
    });
    res.send(runes);
});

app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
