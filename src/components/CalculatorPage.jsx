// @flow

import type { DesiredPart as DesiredPartType } from '../model/DesiredPart';

import * as React from 'react';
import Part from '../model/Part';
import { v4 as uuidv4 } from 'uuid';
import { useMemo, useReducer, useState } from "react";

const TEMP_DESIRED_PARTS = [
    { uuid:uuidv4(), name:'Computer', buildingQuantity: 1 },
    { uuid:uuidv4(), name:'Heavy Modular Frame', buildingQuantity: 1 },
];

export default function CalculatorPage():React.MixedElement {
    const [ desiredParts:DesiredPartType, setDesiredParts ] = useState(TEMP_DESIRED_PARTS);

    const onDesiredPartChange = (desiredPart, changes:DesiredPartChange) => {
        let newDesiredParts = [...desiredParts];
        let whichPart = newDesiredParts.find(dp => dp.uuid === desiredPart.uuid);
        if (!whichPart) return;
        if (changes.hasOwnProperty('name')) { whichPart.name = changes?.name || ''; }
        if (changes.hasOwnProperty('buildingQuantity')) { whichPart.buildingQuantity = changes?.buildingQuantity || 0; }
        setDesiredParts(newDesiredParts);
    }

    const onDesiredPartRemove = desiredPart => {
        let newDesiredParts = [...desiredParts].filter(dp => dp.uuid !== desiredPart.uuid);
        setDesiredParts(newDesiredParts);
    }

    const onAddPart = () => {
        let newDesiredParts = [...desiredParts];
        const uuid = uuidv4();
        newDesiredParts.push({ uuid, name:'', buildingQuantity:0 });
        setDesiredParts(newDesiredParts);

    }

    return <div>
        { desiredParts.map(desiredPart => <DesiredPart 
            key={desiredPart.uuid}
            name={desiredPart.name} 
            buildingQuantity={desiredPart.buildingQuantity} 
            onBuildingQuantityChange={buildingQuantity => onDesiredPartChange(desiredPart, { buildingQuantity})}
            onNameChange={name => onDesiredPartChange(desiredPart, { name})}
            onDelete={() => onDesiredPartRemove(desiredPart)}
        />)}
        <button onClick={onAddPart}>Add Part</button>
        <textarea value={JSON.stringify(desiredParts)} readOnly={true}></textarea>
    </div>
}

type DesiredPartChange = {
    name?: string,
    buildingQuantity?: number,
}

type DesiredPartProps = {
    buildingQuantity: ?number,
    name: ?string,
    onBuildingQuantityChange: number => void,
    onDelete: () => void,
    onNameChange: string => void;
}

function DesiredPart(props:DesiredPartProps):React.MixedElement {
    const parts = useMemo(Part.findAll);

    return <div>
        <select value={props.name} onChange={event => props.onNameChange(event.target.value)}>
            <option>-- select a part --</option>
            {parts.map(part => <option 
                key={part.name} 
                value={part.name}                
                >{part.name}</option>)}
        </select>
        <input type="number" value={props.buildingQuantity} onChange={event => props.onBuildingQuantityChange(event.target.value)} />
        <button onClick={() => props.onDelete()}>remove</button>
    </div>
}