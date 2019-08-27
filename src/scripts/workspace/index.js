import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Source, Renderer, Browser, Preview, StatusBar } from './components';
import example from '../example.rs';
import { generateName, guid } from '../util';
import { lex, parse } from '../compiler';
import { RenderLayer } from './components/layers';

const { Fragment } = React;

const defaultHeight = 50;
const defaultWidth = 50;

class Workspace extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parsed: null,
            lexed: null,
            runes: [],
            rune: null,
        };
    }

    componentDidMount() {
        window.addEventListener('hashchange', e => {
            this.setRune(window.location.hash.substr(1));
        });
        this.getRunes().then(runes => {
            if (window.location.hash) {
                this.setRune(window.location.hash.substr(1));
            } else {
                window.location.hash = runes[0].id;
            }
            this.setState({ runes });
        });
    }

    getRunes = () => {
        return fetch('/runes')
            .then(res => res.json())
            .then(json => {
                this.setState({ runes: json });
                return json;
            });
    };

    parseInput = (source, event) => {
        const { rune } = this.state;
        if (rune) {
            // Create token list
            const lexed = lex(source);
            // Create
            console.log('TOKENS', lexed);
            const parsed = parse(lexed);
            // Create render tree
            console.log('PARSED', parsed);
            const { width, height } = lexed
                .filter(t => t.name === 'grid')
                .reduce(
                    (a, b) => {
                        a.width = Math.max(b.args[0] * b.args[2], a.width);
                        a.height = Math.max(b.args[1] * b.args[2], a.height);
                        return a;
                    },
                    { width: defaultWidth, height: defaultHeight }
                );

            const svgString = renderToStaticMarkup(
                <RenderLayer
                    width={width}
                    height={height}
                    stroke={'none'}
                    fill={'black'}
                    PathElements={parse(lexed, false).paths}
                />
            );
            rune.svg = svgString;

            this.setState({
                source,
                parsed,
                lexed,
                width,
                height,
                rune,
            });
        }
        // Store.updateRune('source', parsedInput);
    };

    cursorChange = selection => {
        // console.log('Cursor change', selection.lead.row, selection);
    };

    setExample = source => {
        this.parseInput(source);
    };

    saveRune = () => {
        console.log('Save rune');
        const { rune, source } = this.state;

        const payload = {
            ...rune,
            script: source,
        };
        console.log('payload', payload);

        return fetch('/rune', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then(res => {
            this.getRunes();
        });
    };

    newRune = () => {
        console.log('Creating rune...');
        return fetch('/rune', {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            if (res.status === 200) {
                this.getRunes();
            }
        });
    };

    deleteRune = id => {
        fetch('/rune', {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
            .then(res => {
                this.getRunes();
            })
            .catch(err => {
                console.log(err);
            });
    };

    setRune = rune => {
        if (typeof rune === 'string') {
            rune = this.state.runes.find(r => r.id === rune);
        }
        if (rune) {
            this.setState({ rune });
            this.parseInput(rune.script);
        }
    };

    render() {
        const { props } = this;
        const { state } = props;
        const {
            parsed,
            lexed,
            source,
            runes,
            rune,
            width,
            height,
        } = this.state;

        return (
            <div className="workspace">
                <StatusBar mode={state.app.mode} save={this.saveRune} />
                <Browser
                    runes={runes}
                    newRune={this.newRune}
                    deleteRune={this.deleteRune}
                    active={rune && rune.id}
                />
                <Source
                    value={source}
                    parseInput={this.parseInput}
                    setExample={this.setExample}
                    handleCursorChange={this.cursorChange}
                />
                {parsed &&
                    rune && (
                        <Fragment>
                            <Preview rendered={rune.svg} />
                            <Renderer
                                mode={state.app.mode}
                                width={width}
                                height={height}
                                rune={rune}
                                elements={parsed}
                                lexed={lexed}
                            />
                        </Fragment>
                    )}
            </div>
        );
    }
}

export default Workspace;
