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
            parsedElements: [],
        };
    }

    parseInput = string => {
        const tokens = lexer(string);
        console.log('Lexed', tokens);
        const parsed = parser(tokens);
        console.log('Parsed', parsed);
        this.setState({
            parsedElements: parsed,
        });
        // Store.updateRune('source', parsedInput);
    };

    render() {
        const { props } = this;
        const { parsedElements } = this.state;

        return (
            <div className="workspace">
                <StatusBar mode={props.state.app.mode} />
                <Source parseInput={this.parseInput} />
                <Renderer
                    rune={props.state.current}
                    elements={parsedElements}
                />
            </div>
        );
    }
}

// <Renderer />;

export default Workspace;
