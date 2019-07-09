import React, { Component } from 'react';
import { MODE_TAGS } from '../util/constants';
import { Source, Renderer, Browser } from './components';
import { lexer, parser } from '../util';
import example from '../example.rs';

const StatusBar = props => (
    <div className="statusbar">
        <span className="tag">{MODE_TAGS[props.mode]} mode</span>
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
        fetch('/runes')
            .then(res => res.json())
            .then(json => {
                this.setState({ runes: json });
            });
        this.parseInput(example);
    }

    parseInput = (source, event) => {
        if (event) {
            console.log('Editor', event.end.row);
        }
        console.log('Source', source);
        const rune = this.props.state.current;
        const lexed = lexer(source, {
            unit: rune.gridUnit,
            height: rune.y * rune.gridUnit,
            width: rune.x * rune.gridUnit,
        });
        console.log('Lexed', lexed);
        const parsed = parser(lexed);
        console.log('Parsed', parsed);
        this.setState({
            source,
            parsed,
            lexed,
        });
        // Store.updateRune('source', parsedInput);
    };

    cursorChange = selection => {
        console.log('Cursor change', selection.lead.row, selection);
    };

    setExample = source => {
        this.parseInput(source);
    };

    render() {
        const { props } = this;
        const { parsed, lexed, source, runes } = this.state;

        return (
            <div className="workspace">
                <StatusBar mode={props.state.app.mode} />
                <Browser runes={runes} />
                <Source
                    value={source}
                    parseInput={this.parseInput}
                    setExample={this.setExample}
                    handleCursorChange={this.cursorChange}
                />
                <Renderer
                    rune={props.state.current}
                    elements={parsed}
                    lexed={lexed}
                />
            </div>
        );
    }
}

// <Renderer />;

export default Workspace;
