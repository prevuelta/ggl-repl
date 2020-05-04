import React from "react";
import Button from "./button";
import { MODE_TAGS } from "../../util/constants";
import Notifications from "./notifications";

export default ({ mode, save, edit, message, rune, help }) => (
  <div className="statusbar">
    <span className="tag">Rune</span>
    {rune && (
      <>
        <Button onClick={save}>Save</Button>
        <Button onClick={edit}>Edit</Button>
      </>
    )}
    {rune && <p>{rune.name}</p>}
    <Notifications notifications={[message]} />
    <Button style={{ marginLeft: "auto" }} onClick={help}>
      Help
    </Button>
  </div>
);
