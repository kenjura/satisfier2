// @flow

import type { Building } from "../model/Building";
import type { DesiredPart as DesiredPartType } from "../model/DesiredPart";

import Part from "../model/Part";
import Recipe from "../model/Recipe";

export function getBuildingsForDesiredParts(
  desiredParts: Array<DesiredPartType>,
  recipes: Array<Recipe>,
  enabledAlts: Array<Recipe>
): Array<Building> {
  const unmergedBuildingList = desiredParts
    .map((desiredPart) => {
      const { part, quantity } = convertDesiredPartToPartAndQuantity(
        desiredPart,
        recipes,
        enabledAlts
      );
      return getBuildingsForPart(part, quantity, recipes, enabledAlts);
    })
    .flat();

  const nonUniqueOutputPartNames = unmergedBuildingList.map(
    (building) => building.recipe.outputPart.name
  );
  const uniqueOutputPartNames = [...new Set(nonUniqueOutputPartNames)];
  const uniqueBuildings = uniqueOutputPartNames.map((outputPartName) => {
    const allBuildingsOfPart = unmergedBuildingList.filter(
      (building) => building.recipe.outputPart.name === outputPartName
    );

    const newBuildingQuantity = allBuildingsOfPart
      .map((building) => building.buildingQuantity)
      .reduce((p, c) => c + p, 0);
    const recipe = allBuildingsOfPart[0].recipe;
    const type = allBuildingsOfPart[0].recipe.building || "";
    return { recipe, type, buildingQuantity: newBuildingQuantity };
  });

  return uniqueBuildings;
}

export function convertDesiredPartToPartAndQuantity(
  desiredPart: DesiredPartType,
  recipes: Array<Recipe>,
  enabledAlts: Array<Recipe>
): {
  part: Part,
  quantity: number,
} {
  const part = new Part({ name: desiredPart.name }); // todo: don't fake it, grab a real Part
  const recipe = getBestRecipeForPart(part, recipes, enabledAlts);
  if (!recipe)
    throw new Error(`could not find recipe for part "${desiredPart.name}`);
  const quantity = desiredPart.buildingQuantity * recipe.outputQuantity;

  return {
    part,
    quantity,
  };
}

/**
 *  recipe: a recipe which may have dependent recipes
 *  recipes: an array of all recipes, with only one recipe per part
 * TODO fix this description
 */
export function getBuildingsForPart(
  // desiredPart: DesiredPartType,
  part: Part,
  quantity: number,
  recipes: Array<Recipe>,
  enabledAlts: Array<Recipe>
): Array<Building> {
  const recipe = getBestRecipeForPart(part, recipes, enabledAlts);
  if (!recipe) {
    debugger;
    throw new Error(`unable to find recipe for part "${part.name}"`);
  }

  // part = high speed connector, quantity = 15, buildingQuantity = 4
  const buildingQuantity = quantity / recipe.outputQuantity;

  const buildings = [
    {
      recipe,
      type: recipe.building || "",
      buildingQuantity,
    },
  ];

  if (recipe.inputPart1 && recipe.inputPart1.name !== "") {
    // TODO: loop this
    buildings.push(
      ...getBuildingsForPart(
        recipe.inputPart1,
        (recipe.inputQuantity1 || 0) * buildingQuantity,
        recipes,
        enabledAlts
      )
    );
  }

  if (recipe.inputPart2 && recipe.inputPart2.name !== "") {
    buildings.push(
      ...getBuildingsForPart(
        recipe.inputPart2,
        (recipe.inputQuantity2 || 0) * buildingQuantity,
        recipes,
        enabledAlts
      )
    );
  }

  if (recipe.inputPart3 && recipe.inputPart3.name !== "") {
    buildings.push(
      ...getBuildingsForPart(
        recipe.inputPart3,
        (recipe.inputQuantity3 || 0) * buildingQuantity,
        recipes,
        enabledAlts
      )
    );
  }

  if (recipe.inputPart4 && recipe.inputPart4.name !== "") {
    buildings.push(
      ...getBuildingsForPart(
        recipe.inputPart4,
        (recipe.inputQuantity4 || 0) * buildingQuantity,
        recipes,
        enabledAlts
      )
    );
  }

  return buildings;
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
    (recipe) => !recipe.isAlternate || enabledAlts.includes(recipe) // TODO: verify this comparison actually works
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

      const parentbuildingQuantity = building.buildingQuantity;

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
          parentbuildingQuantity * sp.outputQtyPerParentBuilding;
        const quantityOfSubPartPerBuilding = Number(
          finalRecipe["Output qty/min"]
        );
        const quantityOfSubPartBuildingsNeeded =
          quantityOfSubPartNeeded / quantityOfSubPartPerBuilding;

        buildingList.push({
          recipe: finalRecipe.recipe,
          building: finalRecipe.Building,
          buildingQuantity: quantityOfSubPartBuildingsNeeded,
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
    let totalbuildingQuantity = buildingsWithRecipe.reduce(
      (p, c) => c.buildingQuantity + p,
      0
    );

    buildingListMap[buildingRecipe].buildingQuantity = totalbuildingQuantity;

    buildingListMap[buildingRecipe].uid = uid();
  }

  // renderOutput(Object.values(buildingListMap));
  return buildingListMap;
}
*/
