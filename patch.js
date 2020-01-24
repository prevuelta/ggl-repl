import glob from 'glob';
import fs from 'fs';

const files = glob.sync('./stored/*.json');

files.forEach(file => {
    const rune = JSON.parse(fs.readFileSync(file, 'utf-8'));

    if (rune.script) {
        rune.source = rune.script;
        delete rune.script;
    }

    fs.writeFileSync(file, JSON.stringify(rune));
});
