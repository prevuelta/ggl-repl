import React from 'react';

export default props => {
    return (
        <ul className="notifications">
            {props.notifications.map(notification => {
                return <p>{notification.message}</p>;
            })}
        </ul>
    );
};
