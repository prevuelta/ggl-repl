import React, { useState } from 'react';
import { Dialog, Button } from '.';

const values = ['name', 'group', '#padding'];

export default ({ updateRune = () => {}, rune, close }) => {
    const [newRune, setRune] = useState(rune);

    function update(key, value) {
        setRune({ ...newRune, [key]: value });
    }

    return (
        <Dialog title="Edit Rune" close={close}>
            {values.map(val => {
                const isNumberField = val.includes('#');
                return (
                    <>
                        <label>{val}</label>
                        {isNumberField ? (
                            <input value={newRune[val.substr(1)]} type="number" onChange={e => update(val.substr(1), e.target.value)} />
                        ) : (
                            <input value={newRune[val]} type="text" onChange={e => update(val, e.target.value)} />
                        )}
                    </>
                );
            })}
            <Button onClick={e => updateRune(newRune)}>Save</Button>
        </Dialog>
    );
};
