import assert from "assert/strict";

import Part from "../model/Part.js";
import Recipe from "../model/Recipe.js";
import {
  convertDesiredPartToPartAndQuantity,
  getBestRecipeForPart,
  getBuildingsForDesiredParts,
  getBuildingsForPart,
} from "./calculator.js";
import type { DesiredPart } from "../model/DesiredPart";

describe("calculate", () => {
  describe("getBestRecipeForPart", () => {
    it("exists", () => {
      expect(getBestRecipeForPart).toBeTruthy();
    });

    describe("tests with data", () => {
      const { recipes, parts } = getDemoData();
      const part = parts.find((p) => p.name === "widget");

      test("getBestRecipeForPart (all alts enabled)", () => {
        const enabledAlts = [...recipes];
        const bestRecipe = getBestRecipeForPart(part, recipes, enabledAlts);
        expect(bestRecipe?.name).toEqual("widget but more efficient");
      });

      test("getBestRecipeForPart (some alts enabled)", () => {
        const enabledAlts = [...recipes].filter(
          (r) => r.name === "widget but less efficient"
        );
        const bestRecipe = getBestRecipeForPart(part, recipes, enabledAlts);
        expect(bestRecipe?.name).toEqual("widget but less efficient");
      });

      //   test("getDependentRecipes", () => {
      //     const startRecipe = recipes.find((r) => r.name === "widget");
      //     const dependentRecipes = getDependentRecipes(startRecipe, recipes);
      //     expect(dependentRecipes).toEqual(
      //       expect.arrayContaining([
      //         expect.objectContaining({ name: "widget" }),
      //         expect.objectContaining({ name: "sprocket" }),
      //         expect.objectContaining({ name: "thingamabob" }),
      //       ])
      //     );
      //   });

      test("getBuildingsForPart - single part", () => {
        const part = parts.find((part) => part.name === "widget");
        const buildings = getBuildingsForPart(part, 12, recipes, recipes);
        expect(buildings).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              buildingQuantity: 4,
              recipe: expect.objectContaining({
                outputPart: expect.objectContaining({ name: "widget" }),
              }),
            }),
            expect.objectContaining({
              buildingQuantity: 8,
              recipe: expect.objectContaining({
                outputPart: expect.objectContaining({ name: "sprocket" }),
              }),
            }),
          ])
        );
      });

      test("convertDesiredPartToPartAndQuantity", () => {
        const desiredPart: DesiredPartType = {
          uuid: "foo",
          name: "widget",
          buildingQuantity: 4,
        };
        const { part, quantity } = convertDesiredPartToPartAndQuantity(
          desiredPart,
          recipes,
          recipes
        );
        expect(part).toEqual(expect.objectContaining({ name: "widget" }));
        expect(quantity).toEqual(12);
      });

      test("getBuildingsForDesiredParts", () => {
        const desiredParts = [
          {
            uuid: "foo",
            name: "widget",
            buildingQuantity: 4,
          },
          {
            uuid: "bar",
            name: "sprocket",
            buildingQuantity: 10,
          },
        ];
        const buildings = getBuildingsForDesiredParts(
          desiredParts,
          recipes,
          recipes
        );
        expect(buildings).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              buildingQuantity: 4,
              recipe: expect.objectContaining({
                outputPart: expect.objectContaining({ name: "widget" }),
              }),
            }),
            expect.objectContaining({
              buildingQuantity: 18,
              recipe: expect.objectContaining({
                outputPart: expect.objectContaining({ name: "sprocket" }),
              }),
            }),
          ])
        );
      });
    });
  });
});

function getDemoData() {
  const parts = [
    new Part({
      name: "widget",
    }),
    new Part({
      name: "thingamabob",
    }),
    new Part({
      name: "sprocket",
    }),
  ];
  const recipes = [
    new Recipe({
      name: "widget",
      building: "constructor",
      outputPart: parts.find((part) => part.name === "widget"),
      outputQuantity: 1,
      inputPart1: parts.find((part) => part.name === "sprocket"),
      inputQuantity1: 1,
    }),
    new Recipe({
      name: "widget but more efficient",
      building: "constructor",
      outputPart: parts.find((part) => part.name === "widget"),
      outputQuantity: 3,
      inputPart1: parts.find((part) => part.name === "sprocket"),
      inputQuantity1: 2,
      isAlternate: true,
      altScore: 95,
    }),
    new Recipe({
      name: "widget but less efficient",
      building: "constructor",
      outputPart: parts.find((part) => part.name === "widget"),
      outputQuantity: 1,
      inputPart1: parts.find((part) => part.name === "sprocket"),
      inputQuantity1: 2,
      inputPart2: parts.find((part) => part.name === "thingamabob"),
      inputQuantity2: 1,
      isAlternate: true,
      altScore: 5,
    }),
    new Recipe({
      name: "sprocket",
      building: "smelter",
      outputPart: parts.find((part) => part.name === "sprocket"),
      outputQuantity: 1,
      inputPart1: parts.find((part) => part.name === "thingamabob"),
      inputQuantity: 1.5,
    }),
    new Recipe({
      name: "thingamabob",
      building: "miner",
      outputPart: parts.find((part) => part.name === "thingamabob"),
      outputQuantity: 1,
    }),
  ];
  return { recipes, parts };
}
