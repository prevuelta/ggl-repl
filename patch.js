import glob from 'glob';
import fs from 'fs';

const files = glob.sync('./stored/*.json');

files.forEach(file => {
    const rune = JSON.parse(fs.readFileSync(file, 'utf-8'));

    const pattern = /sg:(.+)/g;

    let { source } = rune;

    let matches;

    do {
        matches = pattern.exec(rune.source);
        if (matches) {
            const [oldString] = matches;

            const [x, y, unit, div] = matches[1].split(' ');
            const newString = `sg:${unit * x} ${unit * y} ${x} ${y} ${div}`;
            rune.source = source.replace(oldString, newString);
        }
    } while (matches);

    if (process.argv[2] === '--for-real') {
        fs.writeFileSync(file, JSON.stringify(rune));
    }
});

// sg:200 100 5 8 2
