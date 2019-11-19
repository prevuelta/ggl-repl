import React, { useState } from 'react';
import { Dialog, Button } from '.';

const values = ['name', 'group'];

export default ({ updateRune = () => {}, rune, close }) => {
    const [newRune, setRune] = useState(rune);

    function update(key, value) {
        setRune({ ...newRune, [key]: value });
    }

    return (
        <Dialog title="Edit Rune" close={close}>
            {values.map(val => (
                <>
                    <label>{val}</label>
                    <input value={newRune[val]} type="text" onChange={e => update(val, e.target.value)} />
                </>
            ))}
            <Button onClick={e => updateRune(newRune)}>Save</Button>
        </Dialog>
    );
};
