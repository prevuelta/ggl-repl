import React from 'react';
import { Button } from '.';
import { X } from '../icons';

const Dialog = ({ close, title, children }) => {
    return (
        <div className="overlay">
            <div className="dialog">
                <header>
                    <h2>{title}</h2>
                    <Button onClick={close} icon="true">
                        <X />
                    </Button>
                </header>
                {children}
            </div>
        </div>
    );
};

export default Dialog;
