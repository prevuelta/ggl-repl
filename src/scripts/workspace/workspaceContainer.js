import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Source, Renderer, Browser, Preview, StatusBar, Dialog, EditRuneDialog } from './components';
import example from '../example.rs';
import { generateName, guid } from '../util';
import { lex, parse } from '../compiler';
import { RenderLayer } from './components/layers';

const defaultHeight = 50;
const defaultWidth = 50;

const AUTOSAVE_TIMEOUT = 10000;
const AUTOSAVE_ON = false;

class Workspace extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parsed: null,
            lexed: null,
            runes: [],
            rune: null,
            showEditGroup: true,
            message: '',
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
            if (AUTOSAVE_ON) {
                this.timer = setTimeout(() => this.autosave(), AUTOSAVE_TIMEOUT);
            }
        });
    }

    autosave = () => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.autosave(), AUTOSAVE_TIMEOUT);
        this.setState({ message: `Autosaved at ${new Date()}` });
    };

    updateRune = rune => {
        const index = this.state.runes.findIndex(r => r.id === rune.id);
        if (index === -1) {
            console.warn('Error updating rune: rune not found');
            return;
        }
        const { runes } = this.state;
        this.setState({ rune, runes: runes.map(r => (r.id === rune.id ? rune : r)) });
    };

    updateAndSaveRune = rune => {
        this.updateRune(rune);
        this.hideEditDialog();
        this.saveRune();
    };

    getRunes = () => {
        return fetch('/runes')
            .then(res => res.json())
            .then(runes => {
                return this.setState({ runes });
            });
    };

    getRune = id => {
        return this.state.runes.find(r => r.id === id);
    };

    saveRune = () => {
        const { source, runes, rune } = this.state;

        if (!rune) {
            return Promise.resolve();
        }

        const payload = {
            ...rune,
            script: source,
        };
        this.setState({ message: 'Saving...' });

        return fetch('/rune', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then(res => {
            this.setState({ message: 'Rune saved.' });
            this.getRunes();
        });
    };

    newRune = () => {
        this.saveRune().then(() => {
            fetch('/rune', {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ group: 'ungrouped' }),
            }).then(res => {
                console.log(res.status);
                if (res.status === 200) {
                    this.getRunes().then(() => {
                        this.setRune(this.state.runes[0]);
                    });
                }
            });
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
            rune = this.getRune(rune);
        }
        console.log('Setting rune', rune);
        if (rune) {
            this.setState({ rune }, () => {
                this.parseInput(rune.script);
            });
        }
    };

    editRune = id => {
        this.setState({ showEditDialog: true });
    };

    parseInput = (source, event) => {
        // Create token list
        const lexed = lex(source);
        // Create
        console.log('TOKENS', lexed);
        const parsed = parse(lexed);
        // Create render tree
        console.log('PARSED', parsed);
        const { width, height } = lexed
            .filter(t => t.name.includes('grid'))
            .reduce(
                (a, b) => {
                    if (b.name === 'circlegrid') {
                        a.width = Math.max(b.args[0] * 2, a.width);
                        a.height = Math.max(b.args[0] * 2, a.height);
                    } else {
                        a.width = Math.max(b.args[0] * b.args[2], a.width);
                        a.height = Math.max(b.args[1] * b.args[2], a.height);
                    }
                    return a;
                },
                { width: defaultWidth, height: defaultHeight }
            );

        const svgString = renderToStaticMarkup(<RenderLayer width={width} height={height} stroke={'none'} fill={'black'} PathElements={parse(lexed, false).paths} />);

        this.setState({
            source,
            parsed,
            lexed,
            width,
            height,
        });

        const { rune } = this.state;
        rune.svg = svgString;
        this.updateRune(rune);
    };

    cursorChange = selection => {
        // console.log('Cursor change', selection.lead.row, selection);
    };

    setExample = source => {
        this.parseInput(source);
    };

    hideEditDialog = () => {
        this.setState({ showEditDialog: false });
    };

    render() {
        const { props } = this;
        const { state } = props;
        const { parsed, lexed, source, runes, rune, width, height, message, showEditDialog } = this.state;

        return (
            <div className="workspace">
                {showEditDialog && <EditRuneDialog rune={rune} updateRune={this.updateAndSaveRune} close={this.hideEditDialog} />}
                <StatusBar mode={state.app.mode} rune={rune} save={this.saveRune} message={message} edit={this.editRune} />
                <Browser rune={rune} runes={runes} newRune={this.newRune} deleteRune={this.deleteRune} active={rune && rune.id} />
                <Source value={source} parseInput={this.parseInput} setExample={this.setExample} handleCursorChange={this.cursorChange} />
                {parsed && rune && (
                    <>
                        <Preview rendered={rune.svg} />
                        <Renderer mode={state.app.mode} width={width} height={height} rune={rune} elements={parsed} lexed={lexed} />
                    </>
                )}
            </div>
        );
    }
}

export default Workspace;
