import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Button,
  Source,
  Renderer,
  Browser,
  Preview,
  StatusBar,
  Dialog,
  Modal,
  EditRuneDialog,
} from './components';
import {
  generateName,
  guid,
  globals,
  runeData,
  getDocumentSize,
} from '../util';
import { lex, parse } from '../compiler';
import { RenderLayer } from './components/layers';

const defaultHeight = 50;
const defaultWidth = 50;

const AUTOSAVE_TIMEOUT = 10000;
const AUTOSAVE_ON = true;

export default class Workspace extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parsed: null,
      lexed: null,
      runes: [],
      rune: null,
      showEditGroup: true,
      message: '',
      showHelpDialog: false,
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
  }

  autosave = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.autosave(), AUTOSAVE_TIMEOUT);
    this.setState({ message: `Autosaved at ${new Date()}` });
  };

  updateRune = rune => {
    // globals.rune = rune;
    const index = this.state.runes.findIndex(r => r.id === rune.id);
    if (index === -1) {
      console.warn('Error updating rune: rune not found');
      return;
    }
    const { runes } = this.state;
    return new Promise((res, rej) => {
      this.setState(
        { rune, runes: runes.map(r => (r.id === rune.id ? rune : r)) },
        res
      );
    });
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

    rune.ratio = this.state.ratio;

    const payload = {
      ...rune,
      source,
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
      const rune = this.state.runes[0];
      window.location.hash = rune.id;
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
      // globals.rune = rune;
      this.setState({ rune }, () => {
        console.log('Set rune', rune);
        this.parseInput(rune.source);
      });
    }
  };

  startEditing = id => {
    this.setState({ showEditDialog: true });
  };

  finishEditing = rune => {
    console.log(this.state.runes, rune);
    this.updateRune(rune).then(() => {
      this.hideEditDialog();
      this.saveRune();
    });
  };

  parseInput = source => {
    // if (!source && this.state.rune) {
    //     source = this.state.rune.source;
    // }

    const { rune } = this.state;
    // Create token list
    //
    let lexed;
    try {
      lexed = lex(source);
    } catch (err) {
      console.log('Failed to lex', err);
      return;
    }
    // Create
    console.log('TOKENS', lexed);
    let parsed = { paths: () => null, grids: () => null };
    try {
      parsed = parse(lexed);
    } catch (err) {
      console.log('Failed to parse', err);
    }

    let svgString = '';

    try {
      // Create render tree
      svgString = renderToStaticMarkup(
        <RenderLayer PathElements={parse(lexed, false).paths} />
      );
    } catch (err) {
      console.log(err);
    }

    rune.svg = svgString;

    let width, height;

    const size = getDocumentSize(lexed);

    if (lexed.length && lexed[0].name === 'document') {
      const [w, h] = lexed[0].args;
      const padding = (lexed[0].args[2] || 0) * 2;
      width = (w === 'a' ? size.width : w) + padding;
      height = (h === 'a' ? size.height : h) + padding;
    } else {
      width = size.width;
      height = size.height;
    }

    this.setState({
      source,
      parsed,
      lexed,
      width,
      height,
      ratio: width / height,
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

  showHelpDialog = () => {
    this.setState({ showHelpDialog: true });
  };

  hideHelpDialog = () => {
    this.setState({ showHelpDialog: false });
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
      ratio,
      message,
      showEditDialog,
      showHelpDialog,
    } = this.state;

    return (
      <div className="workspace">
        {showEditDialog && (
          <EditRuneDialog
            rune={rune}
            updateRune={this.finishEditing}
            close={this.hideEditDialog}
          />
        )}
        {showHelpDialog && (
          <Dialog close={this.hideHelpDialog} title="Help">
            <p>Basic usage:</p>
            {'<command>: <args>'}
            <table>
              <thead>
                <tr>
                  <th>Command</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <td>d</td>
                <td>Document</td>
              </tbody>
            </table>
          </Dialog>
        )}
        <StatusBar
          rune={rune}
          save={this.saveRune}
          message={message}
          edit={this.startEditing}
          help={this.showHelpDialog}
        />
        <Browser
          rune={rune}
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
        {parsed && rune && (
          <>
            <Preview rendered={rune.svg} />
            <Renderer
              mode={state.app.mode}
              width={width}
              height={height}
              ratio={ratio}
              rune={rune}
              elements={parsed}
              lexed={lexed}
            />
          </>
        )}
      </div>
    );
  }
}
