// @flow

import type { DesiredPart as DesiredPartType } from '../model/DesiredPart';

import * as React from 'react';
import Part from '../model/Part';
import Recipe from '../model/Recipe';
import { v4 as uuidv4 } from 'uuid';
import { useState } from "react";
import { getBuildingsForDesiredParts } from "../helper/calculator";
import { getEnabledAlts } from "../model/Preferences";

const TEMP_DESIRED_PARTS = [
    { uuid:uuidv4(), name:'Computer', buildingQuantity: 1 },
    { uuid:uuidv4(), name:'Heavy Modular Frame', buildingQuantity: 1 },
];

export default function CalculatorPage():React.MixedElement {
    const [ desiredParts:DesiredPartType, setDesiredParts ] = useState(TEMP_DESIRED_PARTS);
    const [ buildings, setBuildings ] = useState([]);

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

    const calculate = () => {
        const recipes = Recipe.findAll();
        const enabledAlts = getEnabledAlts();
        const enabledAltRecipes = enabledAlts.map(alt => recipes.find(recipe => recipe.name === alt));
        const buildings = getBuildingsForDesiredParts(desiredParts, recipes, enabledAltRecipes)
            .sort((a,b) => {
                if (a.recipe.stage > b.recipe.stage) return -1;
                if (a.recipe.stage < b.recipe.stage) return 1;
                if (a.type < b.type) return 1;
                if (a.type > b.type) return -1;
                if (a.recipe.name < b.recipe.name) return 1;
                if (a.recipe.name > b.recipe.name) return -1;
                return 0;
            });
        setBuildings(buildings);
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

        <button onClick={calculate}>Calculate</button>

        <table>
            <thead>
                <tr>
                    <th>Building Quantity</th>
                    <th>Building Type</th>
                    <th>Recipe</th>
                    <th>Output per min</th>
                    <th>Stage</th>
                </tr>
            </thead>
            <tbody>
                {buildings.map(building => <tr key={building.recipe.name}>
                    <td>{Math.round(building.buildingQuantity*100)/100}</td>
                    <td>{building.type}</td>
                    <td>{building.recipe.name}</td>
                    <td>{Math.round(building.recipe.outputQuantity * building.buildingQuantity * 100)/100}</td>
                    <td>{building.recipe.stage}</td>
                </tr>)}
            </tbody>
        </table>
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
    const parts = Part.findAll()

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