import React from "react";

export default props => {
  return (
    <ul className="notifications">
      {props.notifications.map((notification, i) => {
        return <li key={i}>{notification}</li>;
      })}
    </ul>
  );
};
