import React, { useState } from 'react';
import { Dialog, Button } from '.';

export default ({ updateRune = () => {}, rune, close }) => {
    const [newRune, setRune] = useState(rune);

    return (
        <Dialog title="Edit Rune" close={close}>
            <label>Group</label>
            <input
                value={newRune.group}
                onChange={e => {
                    setRune({
                        ...newRune,
                        group: e.target.value,
                    });
                }}
                type="text"
            />
            <Button onClick={e => updateRune(newRune)}>Save</Button>
        </Dialog>
    );
};
