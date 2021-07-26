import React, { Component } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Button,
  Source,
  Renderer,
  Browser,
  Preview,
  StatusBar,
  HelpDialog,
  Modal,
  EditRuneDialog,
} from "./components";
import {
  generateName,
  guid,
  globals,
  runeData,
  getDocumentSize,
} from "../util";
import { lex, parse } from "../compiler";
import { RenderLayer } from "./components/layers";

const defaultHeight = 50;
const defaultWidth = 50;

const AUTOSAVE_TIMEOUT = 10000;
const AUTOSAVE_ON = false;

export default class Workspace extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parsed: null,
      lexed: null,
      activeProject: null,
      projects: {},
      activeRune: null,
      runes: [],
      showEditGroup: true,
      message: "",
      showHelpDialog: false,
      source: "",
    };
  }

  async componentDidMount() {
    const projects = await runeData.getProjects();
    const activeProject = Object.keys(projects)[0];
    this.setState({
      projects,
      activeProject,
    });

    await this.getRunes();

    const activeRuneId = localStorage.getItem("activeRune");
    const activeRune =
      this.state.runes.find((rune) => rune.id === activeRuneId) ||
      this.state.runes[0];

    this.setActiveRune(activeRune);
    if (AUTOSAVE_ON) {
      this.timer = setTimeout(() => this.autosave(), AUTOSAVE_TIMEOUT);
    }
  }

  autosave = async () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.autosave(), AUTOSAVE_TIMEOUT);
    await this.saveRune();
    this.setState({ message: `Autosaved at ${new Date()}` });
  };

  updateRune = (rune) => {
    // globals.rune = rune;
    const index = this.state.runes.findIndex((r) => r.id === rune.id);
    if (index === -1) {
      console.warn("Error updating rune: rune not found");
      return;
    }
    const { runes } = this.state;
    return new Promise((res, rej) => {
      this.setState(
        { rune, runes: runes.map((r) => (r.id === rune.id ? rune : r)) },
        res
      );
    });
  };

  getRunes = async () => {
    const runes = await runeData.getRunes(this.state.activeProject);
    return new Promise((res, rej) => {
      this.setState({ runes }, () => {
        res(runes);
      });
    });
  };

  getRune = (id) => {
    return this.state.runes.find((r) => r.id === id);
  };

  saveRune = async () => {
    const { source, runes, activeRune, activeProject } = this.state;

    console.log(source);

    if (!activeRune) {
      return Promise.resolve();
    }

    activeRune.ratio = this.state.ratio;

    const payload = {
      ...activeRune,
      source,
    };
    this.setState({ message: "Saving..." });

    const res = await runeData.save(payload, activeProject);
    let message;
    if (res.status === 200) {
      message = "~> Rune saved. <~";
    } else {
      message = "!!Problem saving Rune!!";
    }
    this.setState({ message });
    await this.getRunes();
  };

  newRune = async () => {
    await this.saveRune();
    const res = await runeData.new(this.state.activeProject);
    await this.getRunes();
    if (res.status === 200) {
      const rune = this.state.runes[0];
      this.setState({ rune });
    }
  };

  newProject = async () => {
    console.log("Creating project");
    const res = await runeData.newProject();
    console.log(res);
  };

  deleteProject = async () => {};

  deleteRune = async (id) => {
    await runeData.delete(id, this.state.activeProject);
    this.getRunes();
  };

  setActiveRune = (activeRune) => {
    localStorage.setItem("activeRune", activeRune.id);
    if (typeof activeRune === "string") {
      activeRune = this.getRune(activeRune);
    }
    if (activeRune) {
      this.setState({ activeRune }, () => {
        console.log("Set activeRune", activeRune);
        this.parseInput(activeRune.source);
      });
    }
  };

  setActiveProject = (project) => {
    this.setState({ activeProject: project }, async () => {
      await this.getRunes();
      this.setActiveRune(this.state.runes[0]);
    });
  };

  startEditing = (id) => {
    this.setState({ showEditDialog: true });
  };

  finishEditing = (rune) => {
    console.log(this.state.runes, rune);
    this.updateRune(rune).then(() => {
      this.hideEditDialog();
      this.saveRune();
    });
  };

  parseInput = (source) => {
    console.log("Rendering...");
    // if (!source && this.state.rune) {
    //     source = this.state.rune.source;
    // }
    this.setState({ source });

    const { activeRune } = this.state;
    // Create token list
    //
    let lexed;
    try {
      lexed = lex(source);
    } catch (err) {
      console.log("Failed to lex", err);
      return;
    }
    // Create
    console.log("Finished lexing...", lexed);
    let parsed = { paths: () => null, grids: () => null };
    try {
      parsed = parse(lexed);
    } catch (err) {
      console.log("Failed to parse", err);
      return;
    }

    console.log("Finished parsing...");

    let svgString = "";

    try {
      // Create render tree
      svgString = renderToStaticMarkup(
        <RenderLayer PathElements={parse(lexed, false).paths} />
      );
      activeRune.svg = svgString;
    } catch (err) {
      console.log(err);
    }

    let width, height;

    const size = getDocumentSize(lexed);

    if (lexed.length && lexed[0].name === "document") {
      const [w, h] = lexed[0].args;
      const padding = (lexed[0].args[2] || 0) * 2;
      width = (w === "a" ? size.width : w) + padding;
      height = (h === "a" ? size.height : h) + padding;
    } else {
      width = size.width;
      height = size.height;
    }

    this.setState({
      parsed,
      lexed,
      width,
      height,
      ratio: width / height,
      activeRune,
    });
  };

  cursorChange = (selection) => {
    // console.log('Cursor change', selection.lead.row, selection);
  };

  setExample = (source) => {
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
    const {
      state,
      deleteProject,
      deleteRune,
      newProject,
      newRune,
      setActiveRune,
      setActiveProject,
    } = this;

    const {
      activeProject,
      activeRune,
      parsed,
      lexed,
      source,
      runes,
      projects,
      width,
      height,
      ratio,
      message,
      showEditDialog,
      showHelpDialog,
    } = state;

    return (
      <div className="workspace">
        {showEditDialog && (
          <EditRuneDialog
            rune={activeRune}
            updateRune={this.finishEditing}
            close={this.hideEditDialog}
          />
        )}
        {showHelpDialog && <HelpDialog close={this.hideHelpDialog} />}
        <StatusBar
          activeRune={activeRune}
          save={this.saveRune}
          message={message}
          edit={this.startEditing}
          help={this.showHelpDialog}
        />
        {activeProject && activeRune && (
          <Browser
            runes={runes}
            activeRune={activeRune}
            projects={projects}
            activeProject={activeProject}
            newRune={newRune}
            newProject={newProject}
            setActiveRune={setActiveRune}
            setActiveProject={setActiveProject}
            deleteProject={deleteProject}
            deleteRune={deleteRune}
          />
        )}
        <Source
          value={source}
          parseInput={this.parseInput}
          setExample={this.setExample}
          handleCursorChange={this.cursorChange}
        />
        {parsed && activeRune && (
          <>
            <Preview rendered={activeRune.svg} />
            <Renderer
              width={width}
              height={height}
              ratio={ratio}
              rune={activeRune}
              elements={parsed}
              lexed={lexed}
            />
          </>
        )}
      </div>
    );
  }
}
