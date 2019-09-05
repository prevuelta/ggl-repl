import React from 'react';

export default props => {
    return (
        <ul className="notifications">
            {props.notifications.map(notification => {
                return <li>{notification}</li>;
            })}
        </ul>
    );
};
