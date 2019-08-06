import svg2img from 'svg2img';
import fs from 'fs';

export default function(svg, path, cb) {
    svg2img(svg, (err, buffer) => {
        console.log('SVG to IMG error', err, path);
        fs.writeFileSync(path, buffer);
        cb && cb(err);
    });
}
