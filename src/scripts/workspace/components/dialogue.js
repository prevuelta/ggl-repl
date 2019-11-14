import React from 'react';
import { Button } from '.';
import { X } from '../icons';

function Dialogue(props) {
    return (
        <div className="overlay">
            <div className="dialogue">
                <header>
                    {this.props.title}
                    <Button handler={this.hide.bind(this)}>
                        <X />
                    </Button>
                </header>
                {this.props.children}
            </div>
        </div>
    );
}

export default Dialogue;
