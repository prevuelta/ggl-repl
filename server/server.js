import express from 'express';
import config from './config';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import { guid, generateName, saveThumbnail } from './util';
import { exec } from 'child_process';

const app = express();
const { port } = config;

const appDir = path.join(__dirname, '../dist');
const storage = `${__dirname}/../stored`;
const thumbDir = `${storage}/thumbs`;
const tmpDir = `${__dirname}/../tmp`;

app.use(express.static(appDir));
app.use('/thumbs', express.static(`${storage}/thumbs`));
app.use(express.json());

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5100'); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.route('/rune/:id?')
    .get((req, res) => {
        const { id } = req.params;
        if (id) {
            const filePath = path.join(storage, `${id}.json`);
            if (fs.existsSync(filePath)) {
                if (req.query.svg) {
                    const rune = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    res.send(rune.svg);
                } else {
                    res.sendFile(filePath);
                }
            } else {
                res.send(500);
            }
        } else {
            res.send(400);
        }
    })
    .post((req, res) => {
        const rune = req.body;

        const now = new Date().toJSON();
        rune.modified = now;

        if (!rune.created) {
            console.log('Adding created');
            rune.created = now;
        }

        const filePath = `${storage}/${rune.id}.json`;
        const thumbFileName = `${rune.id}.png`;
        const thumbPath = `${thumbDir}/${thumbFileName}`;
        rune.thumb = thumbFileName;

        console.log('Writing file');

        fs.writeFile(filePath, JSON.stringify(rune), err => {
            saveThumbnail(rune.svg, thumbPath, () => {
                if (err) {
                    res.status(500).send("Couldn't save file");
                }
                res.sendStatus(200);
            });
        });
    })
    .put((req, res) => {
        const now = new Date().toJSON();
        const { group } = req.body;
        const rune = {
            id: guid(),
            script: '',
            svg: '<svg></svg>',
            name: generateName(),
            group,
            modified: now,
            created: now,
        };
        const filePath = `${storage}/${rune.id}.json`;

        const thumbFileName = `${rune.id}.png`;
        const thumbPath = `${thumbDir}/${thumbFileName}`;
        rune.thumb = thumbFileName;

        fs.writeFile(filePath, JSON.stringify(rune), err => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            }
            saveThumbnail(rune.svg, thumbPath, err2 => {
                if (err2) {
                    console.log(err2);
                    res.sendStatus(500);
                }
                res.sendStatus(200);
            });
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
    console.log('Montage generated');
});

app.get('/preview', (req, res) => {
    const output = `${tmpDir}/montage.png`;
    exec(`montage ${storage}/thumbs/*.png ${output}`, (err, stdout, stderr) => {
        if (err) {
            res.sendStatus(500);
            return;
        }
        res.sendFile(path.resolve(output));
    });
});

function getRunes() {
    const runes = glob.sync(`${storage}/*.json`).map(f => {
        return JSON.parse(fs.readFileSync(f, 'utf-8'));
    });
    return runes;
}

app.get('/runes', (req, res) => {
    const runes = getRunes();
    runes.sort((a, b) => {
        const dateA = +new Date(a.created);
        const dateB = +new Date(b.created);
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        return 0;
    });
    res.send(runes);
});

app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
