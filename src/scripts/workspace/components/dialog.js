import React from 'react';
import { Button } from '.';
import { X } from '../icons';

function Dialog(props) {
    return (
        <div className="overlay">
            <div className="dialog">
                <header>
                    <h2>{props.title}</h2>
                    <Button onClick={props.hide} icon="true">
                        <X />
                    </Button>
                </header>
                {props.children}
            </div>
        </div>
    );
}

export default Dialog;
