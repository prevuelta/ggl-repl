import React, { Component } from 'react';
import { MODE_TAGS } from '../util/constants';
import { Source, Renderer } from './components';
import { lexer, parser } from '../util';

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
        };
    }

    componentDidMount() {
        this.parseInput('p0 0,50 0,50 50,0 50,0 0');
    }

    parseInput = source => {
        const rune = this.props.state.current;
        const lexed = lexer(source, {
            unit: rune.gridUnit,
            height: rune.y * rune.gridUnit,
            width: rune.x * rune.gridUnit,
        });
        console.log('Lexed', lexed[0].tokens);
        const parsed = parser(lexed);
        console.log('Parsed', parsed);
        this.setState({
            source,
            parsed,
            lexed,
        });
        // Store.updateRune('source', parsedInput);
    };

    setExample = source => {
        this.parseInput(source);
    };

    render() {
        const { props } = this;
        const { parsed, lexed, source } = this.state;

        return (
            <div className="workspace">
                <StatusBar mode={props.state.app.mode} />
                <Source
                    value={source}
                    parseInput={this.parseInput}
                    setExample={this.setExample}
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
