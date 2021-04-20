import React from "react";

import {
  // Button,
  // Source,
  // Renderer,
  // Browser,
  // Preview,
  // StatusBar,
  Dialog,
  // Modal,
  // EditRuneDialog,
} from ".";

import allCommands from "../../compiler/lexer/commands";

const groupedCommands = Object.entries(allCommands).reduce(
  (a, [key, value]) => {
    const { type } = value;
    value.ref = key;
    if (type) {
      a[type] ? a[type].push(value) : (a[type] = [value]);
    } else {
      a.ungrouped ? a.ungrouped.push(value) : (a.ungrouped = [value]);
    }
    return a;
  },
  {}
);

export default ({ close }) => (
  <Dialog title="Command Reference" id="help" close={close}>
    <p>Basic usage:</p>
    {"<command>: <args>"}
    <table className="help-commands">
      <thead>
        <tr>
          <th>Name</th>
          <th>Command</th>
          <th>Arguments</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(groupedCommands).map(([group, commands]) => (
          <>
            <tr>
              <td colspan="3">{group}</td>
            </tr>
            {commands.map(command => (
              <tr>
                <td className="help-command">{command.ref}:</td>
                <td>
                  {command.title ||
                    command.name
                      .replace(/-/, " ")
                      .replace(/^./, char => char.toUpperCase())}
                </td>
                <td>{command.args}</td>
              </tr>
            ))}
          </>
        ))}
      </tbody>
    </table>
  </Dialog>
);
