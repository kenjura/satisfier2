// @flow

import type { Building } from "../model/Building";
import type { DesiredPart as DesiredPartType } from "../model/DesiredPart";

import * as React from "react";
import Part from "../model/Part";
import Recipe from "../model/Recipe";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { getBuildingsForDesiredParts } from "../helper/calculator";
import {
  loadDesiredParts,
  getEnabledAlts,
  saveDesiredParts,
} from "../model/Preferences";

const TEMP_DESIRED_PARTS = [
  { uuid: uuidv4(), name: "Supercomputer", buildingQuantity: 1 },
];

export default function CalculatorPage(): React.MixedElement {
  const [desiredParts, setDesiredParts] = useState<Array<DesiredPartType>>(
    loadDesiredParts()
  );
  const [buildings, setBuildings] = useState<Array<Building>>([]);

  const onDesiredPartChange = (desiredPart, changes: DesiredPartChange) => {
    let newDesiredParts = [...desiredParts];
    let whichPart = newDesiredParts.find((dp) => dp.uuid === desiredPart.uuid);
    if (!whichPart) return;
    if (changes.hasOwnProperty("name")) {
      whichPart.name = changes?.name || "";
    }
    if (changes.hasOwnProperty("buildingQuantity")) {
      whichPart.buildingQuantity = changes?.buildingQuantity || 0;
    }
    setDesiredParts(newDesiredParts);
    saveDesiredParts(newDesiredParts);
  };

  const onDesiredPartRemove = (desiredPart) => {
    let newDesiredParts = [...desiredParts].filter(
      (dp) => dp.uuid !== desiredPart.uuid
    );
    setDesiredParts(newDesiredParts);
  };

  const onAddPart = () => {
    let newDesiredParts = [...desiredParts];
    const uuid = uuidv4();
    newDesiredParts.push({ uuid, name: "", buildingQuantity: 1 });
    setDesiredParts(newDesiredParts);
  };

  const calculate = () => {
    const recipes = Recipe.findAll();
    const enabledAlts = getEnabledAlts();
    const enabledAltRecipes = enabledAlts.map((alt) =>
      recipes.find((recipe) => recipe.name === alt)
    ).filter(Boolean);
    const buildings = getBuildingsForDesiredParts(
      desiredParts,
      recipes,
      enabledAltRecipes
    ).sort((a, b) => {
      if (a.stack > b.stack) return -1;
      if (a.stack < b.stack) return 1;
    //   if (a.recipe.stage > b.recipe.stage) return -1;
    //   if (a.recipe.stage < b.recipe.stage) return 1;
      if (a.type < b.type) return 1;
      if (a.type > b.type) return -1;
      if (a.recipe.name < b.recipe.name) return 1;
      if (a.recipe.name > b.recipe.name) return -1;
      return 0;
    });
    setBuildings(buildings);
  };

  const onCopyTSV = () => {
    const enhancedBuildings = buildings.map((building) => ({
      buildingQuantity: Math.round(building.buildingQuantity * 100) / 100,
      type: building.type,
      recipe: building.recipe.name,
      part: building.recipe.outputPart.name,
      outputQuantity:
        Math.round(
          building.recipe.outputQuantity * building.buildingQuantity * 100
        ) / 100,
      stage: building.recipe.stage,
    }));
    const tsv = [
      "buildingQuantity\ttype\trecipe\tpart\toutputQuantity\tstage",
      ...enhancedBuildings.map(
        (eb) =>
          `${eb.buildingQuantity}\t${eb.type}\t${eb.recipe}\t${eb.part}\t${eb.outputQuantity}\t${eb.stage}`
      ),
    ].join("\n");
    navigator.clipboard.writeText(tsv);
  };

  return (
    <div>
      {desiredParts.map((desiredPart) => (
        <DesiredPart
          key={desiredPart.uuid}
          name={desiredPart.name}
          buildingQuantity={desiredPart.buildingQuantity}
          onBuildingQuantityChange={(buildingQuantity) =>
            onDesiredPartChange(desiredPart, { buildingQuantity })
          }
          onNameChange={(name) => onDesiredPartChange(desiredPart, { name })}
          onDelete={() => onDesiredPartRemove(desiredPart)}
        />
      ))}
      <button onClick={onAddPart}>Add Part</button>

      <button onClick={calculate}>Calculate</button>

      <table>
        <thead>
          <tr>
            <th>Building Quantity</th>
            <th>Building Type</th>
            <th>Recipe</th>
            <th>Output per min</th>
            <th>Stage</th>
            <th colspan="2">Input 1</th>
            <th colspan="2">Input 2</th>
            <th colspan="2">Input 3</th>
            <th colspan="2">Input 4</th>
            <th>Byproduct</th>
          </tr>
        </thead>
        <tbody>
          {buildings.map((building) => (
            <tr key={building.recipe.name} onClick={() => console.log(building)}>
              <td
                title={`
                        mk2: ${(building.buildingQuantity / 1.5).toFixed(2)}
                        mk3: ${(building.buildingQuantity / 1.5 / 1.5).toFixed(
                          3
                        )}
                    `}
              >
                {Math.round(building.buildingQuantity * 100) / 100}
              </td>
              <td>{building.type}</td>
              <td>{building.recipe.name}</td>
              <td>
                {Math.round(
                  building.recipe.outputQuantity *
                    building.buildingQuantity *
                    100
                ) / 100}
              </td>
              <td title={`Recursion stack value: ${building.stack}`}>{building.recipe.stage}</td>
              <td>{building.recipe.inputPart1?.name||''}</td>
              <td>{building.recipe.inputQuantity1}</td>
              <td>{building.recipe.inputPart2?.name||''}</td>
              <td>{building.recipe.inputQuantity2}</td>
              <td>{building.recipe.inputPart3?.name||''}</td>
              <td>{building.recipe.inputQuantity3}</td>
              <td>{building.recipe.inputPart4?.name||''}</td>
              <td>{building.recipe.inputQuantity4}</td>
              <td>{building.recipe.byproductPart?.name||''}</td>
              <td>{building.recipe.byproductQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={onCopyTSV}>Copy TSV to Clipboard</button>
    </div>
  );
}

type DesiredPartChange = {
  name?: string,
  buildingQuantity?: number,
};

type DesiredPartProps = {
  buildingQuantity: ?number,
  name: ?string,
  onBuildingQuantityChange: (number) => void,
  onDelete: () => void,
  onNameChange: (string) => void,
};

function DesiredPart(props: DesiredPartProps): React.MixedElement {
  const parts = Part.findAll().sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });

  return (
    <div>
      <select
        value={props.name}
        onChange={(event) => props.onNameChange(event.target.value)}
      >
        <option>-- select a part --</option>
        {parts.map((part) => (
          <option key={part.name} value={part.name}>
            {part.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={props.buildingQuantity}
        onChange={(event) => props.onBuildingQuantityChange(event.target.value)}
      />
      <button onClick={() => props.onDelete()}>remove</button>
    </div>
  );
}
