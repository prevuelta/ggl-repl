import React, { useState, useRef, useEffect } from "react";
import AceEditor from "react-ace";
import CustomRsMode from "./customRuneScriptMode";

export default ({ value, parseInput, handleCursorChange }) => {
  const aceEditor = useRef();
  useEffect(() => {
    const customRsMode = new CustomRsMode();
    aceEditor.current.editor.getSession().setMode(customRsMode);
  }, []);
  return (
    <div className="source-inspector">
      <AceEditor
        tabSize={2}
        className="editable"
        theme="github"
        mode="text"
        editorProps={{ $blockScrolling: true }}
        ref={aceEditor}
        value={value}
        onChange={(value, editor) => parseInput(value, editor)}
        onCursorChange={(v, h) => handleCursorChange(v, h)}
      />
      ;
    </div>
  );
};
