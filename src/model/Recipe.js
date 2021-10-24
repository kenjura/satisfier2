// @flow

import moize from "moize";
import Part from "./Part";
import rawRecipes from "./data/recipes";
import rfdc from "rfdc/default";

export interface IRecipe {
  name: string;
  outputPart: Part;
  outputQuantity: number;
  inputPart1: Part;
  inputQuantity1: number;
  inputPart2?: Part;
  inputQuantity2?: number;
  inputPart3?: Part;
  inputQuantity3?: number;
  inputPart4?: Part;
  inputQuantity4?: number;
  byproductPart?: Part;
  byproductQuantity?: number;
  stage?: number;
  building?: string;
  isAlternate: boolean;
  altScore: number;
}

export default class Recipe {
  name: string;
  outputPart: Part;
  outputQuantity: number;
  inputPart1: Part;
  inputQuantity1: number;
  inputPart2: ?Part;
  inputQuantity2: ?number;
  inputPart3: ?Part;
  inputQuantity3: ?number;
  inputPart4: ?Part;
  inputQuantity4: ?number;
  byproductPart: ?Part;
  byproductQuantity: ?number;
  stage: ?number;
  building: ?string;
  isAlternate: ?boolean;
  altScore: number;
  static findAll: () => Array<Recipe>;
  static findAlternateRecipes: () => Array<Recipe>;

  constructor(props: IRecipe) {
    if (props) {
      Object.assign(this, props);
    }
  }
}

Recipe.findAll = moize(findAll);
Recipe.findAlternateRecipes = moize(findAlternateRecipes);

function findAll() {
  const data = rfdc(rawRecipes);
  const recipes = rawRecipes.map(
    (rawRecipe) =>
      new Recipe({
        name: rawRecipe.Recipe,
        outputPart: new Part({ name: rawRecipe["Output"] }),
        outputQuantity: Number(rawRecipe["Output qty/min"]),
        inputPart1: new Part({ name: rawRecipe["Item 1"] }),
        inputQuantity1: Number(rawRecipe["Q1"]),
        inputPart2: new Part({ name: rawRecipe["Item 2"] }),
        inputQuantity2: Number(rawRecipe["Q2"]),
        inputPart3: new Part({ name: rawRecipe["Item 3"] }),
        inputQuantity3: Number(rawRecipe["Q3"]),
        inputPart4: new Part({ name: rawRecipe["Item 4"] }),
        inputQuantity4: Number(rawRecipe["Q4"]),
        byproductPart: new Part({ name: rawRecipe["Byproduct"] }),
        byproductQuantity: Number(rawRecipe["QB"]),
        isAlternate: rawRecipe["Alternate"] === "yes",
        altScore: Number(rawRecipe["Alt Score"] || 0),
        stage: Number(rawRecipe["Stage"]),
        building: rawRecipe["Building"],
      })
  );
  return recipes;
}

function findAlternateRecipes() {
  const recipes = findAll();
  return recipes.filter((recipe: Recipe) => recipe.isAlternate);
}
