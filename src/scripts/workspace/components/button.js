import React from "react";

export default function(props) {
  const classes = `button ${props.icon ? "icon" : ""}`;
  return (
    <button
      {...props}
      type="button"
      className={classes}
      onClick={props.onClick}
    >
      {props.children || props.symbol}
    </button>
  );
}
