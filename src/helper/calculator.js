// @flow

import type { DesiredPart as DesiredPartType } from "../model/DesiredPart";

// import { getAlternateRecipes, getPart } from "../model/getAllParts";
import Part from "../model/Part";
import Recipe from "../model/Recipe";
import rfdc from "rfdc/default";
import { v4 as uuidv4 } from "uuid";

const alternateRecipes = Recipe.findAlternateRecipes();

type Building = {
  name: string,
  quantity: number,
  recipe: Recipe,
};

export default function calculate(
  desiredParts: Array<DesiredPartType>,
  enabledAlts: Array<string>
): Array<Building> {
  let buildingList = Object.values(rfdc(desiredParts));

  /**
   * for each desired part...
   * - for each input part...
   *   - find all recipes that produce that part
   *     - to do this, filter all recipes by part name, then filter again by enabledAlts
   *   - sort by altScore (WARNING: this assumes alts are ALWAYS better than non-alt)
   *   - return recipe
   * hold on, not yet done
   * ...
   * alternate implemenation
   * - step 1: come up with a list of all parts needed
   * - step 2: for each part, choose best recipe total all quantities
   * ...
   * alt 2
   * - map each part in global part list...
   *   - return best recipe
   * - for each part in list of parts with only best recipes...
   *   - go through desiredPart list, recursing through dependencies, and accumulate quantities
   *   - (max complexity = part count * desiredPart (always less than part count) * max depth, thus O(n^2)*max depth, where n is a few dozen)
   * - with all part quantities in hand, calculate buildings and return
  
   */
  //

  const allParts = Part.findAll();

  return [];
}

export function getBestRecipeForPart(
  part: Part,
  recipes: Array<Recipe>,
  enabledAlts: Array<Recipe>
): Recipe {
  const allRecipesForPart = recipes.filter(
    (recipe) => recipe.outputPart.name === part.name
  );
  const enabledRecipesForPart = allRecipesForPart.filter(
    (recipe) => enabledAlts.includes(recipe) // hmm
  );
  const bestRecipesForPart = enabledRecipesForPart.sort(
    ({ altScore: a }, { altScore: b }) => {
      if (a > b) return -1;
      if (a < b) return 1;
      return 0;
    }
  );
  return bestRecipesForPart[0]; // TODO: detect if this is null or undefined somehow
}

/*
  for (let depth = 0; depth < 10; depth++) {
    // buildingList.forEach(building => {
    for (let [key, building] of Object.entries(buildingList)) {
      if (building.processed) continue;

      const part = getPart(building.recipe);
      if (!part)
        throw new Error(
          `required part "${building.recipe}" does not exist in dataset`
        );

      const subParts = [
        {
          recipe: part["Item 1"],
          outputQtyPerParentBuilding: Number(part["Q1"]),
        },
        {
          recipe: part["Item 2"],
          outputQtyPerParentBuilding: Number(part["Q2"]),
        },
        {
          recipe: part["Item 3"],
          outputQtyPerParentBuilding: Number(part["Q3"]),
        },
        {
          recipe: part["Item 4"],
          outputQtyPerParentBuilding: Number(part["Q4"]),
        },
      ];

      const parentBuildingQty = building.buildingQty;

      subParts.forEach((sp) => {
        if (!sp.recipe) return;
        const subPart = getPart(sp.recipe);
        if (!subPart) return;

        // is there a better part? check alt recipes
        const altRecipes = alternateRecipes
          .filter((recipe) => recipe.Output === subPart.Output)
          .filter((recipe) => enabledAlts[recipe.recipe]);
        const finalRecipe = altRecipes.length
          ? altRecipes.sort((a, b) => b.altScore - a.altScore)[0]
          : subPart;

        const quantityOfSubPartNeeded =
          parentBuildingQty * sp.outputQtyPerParentBuilding;
        const quantityOfSubPartPerBuilding = Number(
          finalRecipe["Output qty/min"]
        );
        const quantityOfSubPartBuildingsNeeded =
          quantityOfSubPartNeeded / quantityOfSubPartPerBuilding;

        buildingList.push({
          recipe: finalRecipe.recipe,
          building: finalRecipe.Building,
          buildingQty: quantityOfSubPartBuildingsNeeded,
        });
      });

      building.processed = true;
    }
  }

  // dedupe
  let buildingListMap = {};
  buildingList.forEach((building) => {
    buildingListMap[building.recipe] = { recipe: building.recipe };
  });
  for (let buildingRecipe in buildingListMap) {
    if (!buildingListMap.hasOwnProperty(buildingRecipe)) continue;

    let buildingsWithRecipe = buildingList.filter(
      (building) => building.recipe === buildingRecipe
    );
    let totalBuildingQty = buildingsWithRecipe.reduce(
      (p, c) => c.buildingQty + p,
      0
    );

    buildingListMap[buildingRecipe].buildingQty = totalBuildingQty;

    buildingListMap[buildingRecipe].uid = uid();
  }

  // renderOutput(Object.values(buildingListMap));
  return buildingListMap;
}
*/
