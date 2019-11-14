import React from 'react';
import { Button } from '.';
import { X } from '../icons';

function Dialog(props) {
    return (
        <div className="overlay">
            <div className="dialogue">
                <header>
                    {props.title}
                    <Button onClick={props.hide}>
                        <X />
                    </Button>
                </header>
                {props.children}
            </div>
        </div>
    );
}

export default Dialog;
