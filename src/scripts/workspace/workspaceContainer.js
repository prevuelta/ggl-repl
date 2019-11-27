import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Source, Renderer, Browser, Preview, StatusBar, Dialog, EditRuneDialog } from './components';
import example from '../example.rs';
import { generateName, guid, globals, runeData } from '../util';
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

    async componentDidMount() {
        const runes = await this.getRunes();

        window.addEventListener('hashchange', e => {
            this.setRune(window.location.hash.substr(1));
        });

        if (window.location.hash) {
            this.setRune(window.location.hash.substr(1));
        } else {
            window.location.hash = runes[0].id;
        }
        if (AUTOSAVE_ON) {
            this.timer = setTimeout(() => this.autosave(), AUTOSAVE_TIMEOUT);
        }

        globals.onUpdate = () => {
            this.parseInput();
        };
    }

    autosave = () => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.autosave(), AUTOSAVE_TIMEOUT);
        this.setState({ message: `Autosaved at ${new Date()}` });
    };

    updateRune = rune => {
        // globals.rune = rune;
        // const index = this.state.runes.findIndex(r => r.id === rune.id);
        // if (index === -1) {
        // console.warn('Error updating rune: rune not found');
        // return;
        // }
        // const { runes } = this.state;
        // return new Promise((res, rej) => {
        //     this.setState({ rune, runes: runes.map(r => (r.id === rune.id ? rune : r)) }, res);
        // });
    };

    getRunes = async () => {
        const runes = await runeData.get();
        return new Promise((res, rej) => {
            this.setState({ runes }, () => {
                res(runes);
            });
        });
    };

    getRune = id => {
        return this.state.runes.find(r => r.id === id);
    };

    saveRune = async () => {
        const { source, runes, rune } = this.state;

        if (!rune) {
            return Promise.resolve();
        }

        const payload = {
            ...rune,
            script: source,
        };
        this.setState({ message: 'Saving...' });

        const res = await runeData.save(payload);
        let message;
        if (res.status === 200) {
            message = '~> Rune saved. <~';
        } else {
            message = '!!Problem saving Rune!!';
        }
        this.setState({ message });
        await this.getRunes();
    };

    newRune = async () => {
        await this.saveRune();
        const res = await runeData.new();
        await this.getRunes();
        if (res.status === 200) {
            this.setRune(this.state.runes[0]);
        }
    };

    deleteRune = async id => {
        await runeData.delete(id);
        this.getRunes();
    };

    setRune = rune => {
        if (typeof rune === 'string') {
            rune = this.getRune(rune);
        }
        if (rune) {
            console.log(rune);
            globals.rune = rune;
            this.setState({ rune }, () => {
                this.parseInput(rune.script);
            });
        }
    };

    startEditing = id => {
        this.setState({ showEditDialog: true });
    };

    finishEditing = rune => {
        console.log(this.state.runes, rune);
        // this.updateRune(rune).then(() => {
        //     this.hideEditDialog();
        // this.saveRune();
        // });
    };

    parseInput = source => {
        if (!source && this.state.rune) {
            source = this.state.rune.script;
        }

        const { rune } = this.state;
        // Create token list
        const lexed = lex(source);
        // Create
        console.log('TOKENS', lexed);
        const parsed = parse(lexed);
        // Create render tree
        console.log('PARSED', parsed);
        const padding = +rune.padding;
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

        const svgString = renderToStaticMarkup(<RenderLayer width={width} height={height} fill={'black'} PathElements={parse(lexed, false).paths} />);

        rune.svg = svgString;

        this.setState({
            source,
            parsed,
            lexed,
            width,
            height,
            rune,
        });
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
                {showEditDialog && <EditRuneDialog rune={rune} updateRune={this.finishEditing} close={this.hideEditDialog} />}
                <StatusBar mode={state.app.mode} rune={rune} save={this.saveRune} message={message} edit={this.startEditing} />
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
