// @flow

import type { Building } from "../model/Building";
import type { DesiredPart as DesiredPartType } from "../model/DesiredPart";

import * as React from "react";
import Part from "../model/Part";
import Recipe from "../model/Recipe";
import RecipeSelector from "./RecipeSelector";
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

const ALT_SCORE_THRESHOLD = {
  MIN: 0,
  START: 50,
  MAX: 100,
};

const styles = {
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 16px 1fr 16px 1fr',
    },
    gridLeft: {
        gridColumn: '1',
        width: '100%',
    },
    gridMid: {
        gridColumn: '3',
        width: '100%',
    },
    gridRight: {
        gridColumn: '5',
        width: '100%',
    },
}

type Meta = {
  totalBuildings: number,
  smelters: number,
  foundries: number,
  constructors: number,
  assemblers: number,
  manufacturers: number,
  refineries: number,
  blenders: number,
  packagers: number,
}

export default function CalculatorPage(): React.MixedElement {
  const [desiredParts, setDesiredParts] = useState<Array<DesiredPartType>>(
    loadDesiredParts()
  );
  const [buildings, setBuildings] = useState<Array<Building>>([]);
  const [meta, setMeta] = useState<Meta>({ totalBuildings:0, smelters:0 });
  const [inputs, setInputs] = useState<Array<{ part:string, quantity:number }>>([]);
  const [altScoreThreshold, setAltScoreThreshold] = useState<number>(ALT_SCORE_THRESHOLD.START);
  const [preferredRecipes, setPreferredRecipes] = useState<Array<Recipe>>([]);

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

  const onRecipeSelectorChange = (recipe:Recipe):void => {
    // const oldPreferredRecipes = 
    const newPreferredRecipes = [].concat(preferredRecipes).filter(rec => rec.outputPart.name !== recipe.outputPart.name);
    newPreferredRecipes.push(recipe);
    setPreferredRecipes(newPreferredRecipes);
    calculate();
  };

  const calculate = () => {
    const recipes = Recipe.findAll();
    const enabledAlts = getEnabledAlts();
    const enabledAltRecipes = enabledAlts
      .map((alt:string):?Recipe =>
        recipes.find((recipe) => recipe.name === alt)
      )
      .filter(Boolean)
      .filter((recipe:Recipe):boolean => recipe.altScore >= altScoreThreshold);
    const buildings = getBuildingsForDesiredParts(
      desiredParts,
      recipes,
      enabledAltRecipes,
      preferredRecipes,
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
    setMeta({
      totalBuildings: buildings.reduce((p,c) => p + Math.ceil(c.buildingQuantity), 0),
      smelters: buildings.filter(building => building.type === 'Smelter').reduce((p,c) => p + Math.ceil(c.buildingQuantity), 0),
      foundries: buildings.filter(building => building.type === 'Foundry').reduce((p,c) => p + Math.ceil(c.buildingQuantity), 0),
      constructors: buildings.filter(building => building.type === 'Constructor').reduce((p,c) => p + Math.ceil(c.buildingQuantity), 0),
      assemblers: buildings.filter(building => building.type === 'Assembler').reduce((p,c) => p + Math.ceil(c.buildingQuantity), 0),
      manufacturers: buildings.filter(building => building.type === 'Manufacturer').reduce((p,c) => p + Math.ceil(c.buildingQuantity), 0),
      refineries: buildings.filter(building => building.type === 'Refinery').reduce((p,c) => p + Math.ceil(c.buildingQuantity), 0),
      blenders: buildings.filter(building => building.type === 'Blender').reduce((p,c) => p + Math.ceil(c.buildingQuantity), 0),
      packagers: buildings.filter(building => building.type === 'Packager').reduce((p,c) => p + Math.ceil(c.buildingQuantity), 0),
    });
    setInputs(buildings.filter(building => !building.recipe.inputPart1?.name).map(building => ({ part:building.recipe.outputPart.name, quantity:Math.floor((building.recipe.outputQuantity * building.buildingQuantity * 100))/100 })));
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
      stack: building.stack,
      input1Part: building.recipe.inputPart1?.name || '',
      input1Quantity: building.recipe.inputQuantity1 || 0,
      input2Part: building.recipe.inputPart2?.name || '',
      input2Quantity: building.recipe.inputQuantity2 || 0,
      input3Part: building.recipe.inputPart3?.name || '',
      input3Quantity: building.recipe.inputQuantity3 || 0,
      input4Part: building.recipe.inputPart4?.name || '',
      input4Quantity: building.recipe.inputQuantity4 || 0,
      byproductPart: building.recipe.byproductPart?.name || '',
      byproductQuantity: building.recipe.byproductQuantity || 0,
    }));
    const tsv = [
      "buildingQuantity\ttype\trecipe\tpart\toutputQuantity\tstage\tinput1part\tinput1qty\tinput2part\tinput2qty\tinput3part\tinput3qty\tinput4part\tinput4qty\tbyproductPage\tbyproductQuantity",
      ...enhancedBuildings.map(
        (eb) =>
          `${eb.buildingQuantity}\t${eb.type}\t${eb.recipe}\t${eb.part}\t${eb.outputQuantity}\t${eb.stage}\t${eb.input1Part}\t${eb.input1Quantity}\t${eb.input2Part}\t${eb.input2Quantity}\t${eb.input3Part}\t${eb.input3Quantity}\t${eb.input4Part}\t${eb.input4Quantity}\t${eb.byproductPart}\t${eb.byproductQuantity}`
      ),
    ].join("\n");
    navigator.clipboard.writeText(tsv);
  };

  const onAltScoreThresholdChange = ({ target }) => {
    setAltScoreThreshold(target.value);
  }

  return (
    <div>

      <div style={styles.gridContainer}>
        <div style={styles.gridLeft}>
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
        </div>
        <div style={styles.gridMid}>
          Alt Score Threshold
          <input type="number" min={ALT_SCORE_THRESHOLD.MIN} max={ALT_SCORE_THRESHOLD.MAX} value={altScoreThreshold} onChange={onAltScoreThresholdChange} />
        </div>
        <div style={styles.gridRight}>
          <div style={styles.gridContainer}>
          <div style={styles.gridLeft}>
            Buildings:
            <ul>
              <li>Total buildings: {meta.totalBuildings}</li>
              <li>Smelters: {meta.smelters}</li>
              <li>Constructors: {meta.constructors}</li>
              <li>Foundries: {meta.foundries}</li>
              <li>Assemblers: {meta.assemblers}</li>
              <li>Manufacturers: {meta.manufacturers}</li>
              <li>Refineries: {meta.refineries}</li>
              <li>Blenders: {meta.blenders}</li>
              <li>Packagers: {meta.packagers}</li>
            </ul>
          </div>
          <div style={styles.gridMid}>
            Inputs:
            <ul>
              {inputs.map(input => <li key={input.part}>{input.part}: {input.quantity}</li>)}
            </ul>
          </div>
          <div style={styles.gridRight}>
            Outputs: TBI
            <ul>
            </ul>
            Byproducts: TBI
            <ul>
            </ul>
          </div>
        </div>
        </div>
      </div>

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
              <td><RecipeSelector recipe={building.recipe} onChange={onRecipeSelectorChange} /></td>
              <td>
                {Math.round(
                  building.recipe.outputQuantity *
                    building.buildingQuantity *
                    100
                ) / 100}
              </td>
              <td title={`Recursion stack value: ${building.stack}`}>{building.recipe.stage}</td>
              <td>{building.recipe.inputPart1?.name||''}</td>
              <td>{(building.recipe.inputQuantity1 || 0) * building.buildingQuantity}</td>
              <td>{building.recipe.inputPart2?.name||''}</td>
              <td>{(building.recipe.inputQuantity2 || 0) * building.buildingQuantity}</td>
              <td>{building.recipe.inputPart3?.name||''}</td>
              <td>{(building.recipe.inputQuantity3 || 0) * building.buildingQuantity}</td>
              <td>{building.recipe.inputPart4?.name||''}</td>
              <td>{(building.recipe.inputQuantity4 || 0) * building.buildingQuantity}</td>
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
