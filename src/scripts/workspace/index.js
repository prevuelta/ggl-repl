import React, { Component } from 'react';
import { MODE_TAGS } from '../util/constants';
import { Source, Renderer, Browser } from './components';
import example from '../example.rs';
import { generateName, guid, lexer, parser } from '../util';

const StatusBar = props => (
    <div className="statusbar">
        <span className="tag">{MODE_TAGS[props.mode]} mode</span>
        <button onClick={props.save}>Save</button>
    </div>
);

class Workspace extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parsed: [],
            lexed: [],
            runes: [],
        };
    }

    componentDidMount() {
        this.getRunes().then(runes => this.setRune(runes[0]));
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
            const lexed = lexer(source);
            console.log('Lexed', lexed);
            const parsed = parser(lexed);
            console.log('Parsed', parsed);
            this.setState({
                source,
                parsed,
                lexed,
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

    onRender = svg => {
        console.log(svg);
    };

    saveRune = () => {
        const { rune, source } = this.state;
        const payload = {
            script: source,
            svg: 'svgstring',
            name: rune.name,
            id: rune.id,
        };
        console.log('Payload', payload);
        fetch('/rune', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }).then(res => {
            console.log(res.statusCode);
            this.getRunes();
        });
    };

    newRune = () => {
        const newRune = {
            script: '',
            svg: '',
            name: generateName(),
        };
        this.setState({ runes: [...this.state.runes, newRune], rune: newRune });
    };

    setRune = rune => {
        console.log('Setting rune', rune);
        this.setState({ rune });
        this.parseInput(rune.script);
    };

    render() {
        const { props } = this;
        const { parsed, lexed, source, runes, rune } = this.state;

        return (
            <div className="workspace">
                <StatusBar mode={props.state.app.mode} save={this.saveRune} />
                <Browser
                    runes={runes}
                    setRune={this.setRune}
                    newRune={this.newRune}
                    active={rune && rune.id}
                />
                <Source
                    value={source}
                    parseInput={this.parseInput}
                    setExample={this.setExample}
                    handleCursorChange={this.cursorChange}
                />
                {rune && (
                    <Renderer
                        rune={rune}
                        elements={parsed}
                        lexed={lexed}
                        onRender={this.onRender}
                    />
                )}
            </div>
        );
    }
}

// <Renderer />;

export default Workspace;
