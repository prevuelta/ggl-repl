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

    parseInput = string => {
        const rune = this.props.state.current;
        const lexed = lexer(string, {
            unit: rune.gridUnit,
            height: rune.y * rune.gridUnit,
            width: rune.x * rune.gridUnit,
        });
        console.log('Lexed', lexed[0].tokens);
        const parsed = parser(lexed);
        console.log('Parsed', parsed);
        this.setState({
            parsed,
            lexed,
        });
        // Store.updateRune('source', parsedInput);
    };

    render() {
        const { props } = this;
        const { parsed, lexed } = this.state;

        return (
            <div className="workspace">
                <StatusBar mode={props.state.app.mode} />
                <Source parseInput={this.parseInput} />
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
