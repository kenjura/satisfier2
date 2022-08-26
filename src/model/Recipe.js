// @flow

import moize from "moize";
import Part from "./Part";
import rawRecipes from "./data/recipes";
import rfdc from "rfdc/default";

export interface IRecipe {
  name: string;
  outputPart: Part;
  outputQuantity: number;
  inputPart1: ?Part;
  inputQuantity1: ?number;
  inputPart2: ?Part;
  inputQuantity2: ?number;
  inputPart3: ?Part;
  inputQuantity3: ?number;
  inputPart4: ?Part;
  inputQuantity4: ?number;
  byproductPart: ?Part;
  byproductQuantity: ?number;
  stage: number;
  building?: string;
  isAlternate: boolean;
  altScore: number;
}

export default class Recipe {
  name: string;
  outputPart: Part;
  outputQuantity: number;
  inputPart1: ?Part;
  inputQuantity1: ?number;
  inputPart2: ?Part;
  inputQuantity2: ?number;
  inputPart3: ?Part;
  inputQuantity3: ?number;
  inputPart4: ?Part;
  inputQuantity4: ?number;
  byproductPart: ?Part;
  byproductQuantity: ?number;
  stage: number = 0;
  building: ?string;
  isAlternate: ?boolean;
  altScore: number = 0;
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

const FORBIDDEN_RECIPES = ["Recycled Rubber", "Recycled Plastic"];

function findAll() {
  const data = rfdc(rawRecipes);
  const recipes = data
    .filter((recipe) => FORBIDDEN_RECIPES.indexOf(recipe.Recipe) < 0) // TODO: figure out a way to detect circular dependencies without a forbidden recipe list
    .map(
      (rawRecipe) =>
        new Recipe({
          name: rawRecipe.recipe,
          outputPart: Part.stubRequired(rawRecipe.output),
          outputQuantity: Number(rawRecipe.outputQtyPerMin),
          inputPart1: Part.stub(rawRecipe.item1),
          inputQuantity1: Number(rawRecipe.itemQty1),
          inputPart2: Part.stub(rawRecipe.item2),
          inputQuantity2: Number(rawRecipe.itemQty2),
          inputPart3: Part.stub(rawRecipe.item3),
          inputQuantity3: Number(rawRecipe.itemQty3),
          inputPart4: Part.stub(rawRecipe.item4),
          inputQuantity4: Number(rawRecipe.itemQty4),
          byproductPart: Part.stub(rawRecipe.byproduct),
          byproductQuantity: Number(rawRecipe.byproductQty),
          isAlternate: rawRecipe.alternate === "yes",
          altScore: Number(rawRecipe.altScore || 0),
          stage: Number(rawRecipe.stage),
          building: rawRecipe.building,
        })
    );
  return recipes;
}

function findAlternateRecipes() {
  const recipes = findAll();
  return recipes.filter((recipe: Recipe) => recipe.isAlternate);
}
