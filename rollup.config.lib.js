import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
// import includePaths from 'rollup-plugin-includepaths';
// import eslint from 'rollup-plugin-eslint';
import commonjs from 'rollup-plugin-commonjs';
// import string from 'rollup-plugin-string';
// import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';
// import builtins from 'rollup-plugin-node-builtins';
import { uglify } from 'rollup-plugin-uglify';

var includePathOptions = {
    paths: ['node_modules'],
};

export default {
    input: './src/scripts/lib.js',
    cache: false,
    output: {
        format: 'iife',
        name: 'RuneModules',
        file: './dist/lib.min.js',
        globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react-dom/server': 'ReactDOMServer',
            'react-ace': 'AceEditor',
        },
    },
    plugins: [
        resolve({
            mainFields: ['main', 'browser', 'module'],
        }),
        // globals(),
        // json(),
        // builtins(),
        commonjs({
            sourceMap: false,
            include: './node_modules/**',
            namedExports: {
                'node_modules/react/index.js': [
                    'createElement',
                    'Component',
                    'PureComponent',
                    'useState',
                ],
                'node_modules/react-dom/server.browser.js': [
                    'renderToStaticMarkup',
                ],
                'node_modules/react-dom/index.js': ['findDOMNode'],
                'node_modules/react-is/index.js': ['isValidElementType'],
            },
        }),
        babel({
            externalHelpers: true,
            exclude: 'node_modules/**',
        }),
        uglify(),
        // string({
        // Required to be specified
        // include: ['**/*.json'],
        // }),
        // eslint(),
    ],
};
