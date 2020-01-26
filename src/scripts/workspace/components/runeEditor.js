import React from 'react';
import AceEditor from 'react-ace';
import CustomRsMode from './customRuneScriptMode';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.aceEditor = React.createRef();
    }
    componentDidMount() {
        const customRsMode = new CustomRsMode();
        this.aceEditor.current.editor.getSession().setMode(customRsMode);
    }

    render() {
        return (
            <AceEditor
                {...this.props}
                ref={this.aceEditor}
                theme="github"
                mode="text"
                onChange={val => console.log(val)}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
                ref={this.aceEditor}
            />
        );
    }
}
