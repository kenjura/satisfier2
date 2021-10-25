import assert from "assert/strict";

import Part from "../model/Part.js";
import Recipe from "../model/Recipe.js";
import { getBestRecipeForPart } from "./calculator.js";

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
      outputPart: parts.find((part) => part.name === "widget"),
      outputQuantity: 1,
      inputPart1: parts.find((part) => part.name === "sprocket"),
      inputQuantity1: 1,
    }),
    new Recipe({
      name: "widget but more efficient",
      outputPart: parts.find((part) => part.name === "widget"),
      outputQuantity: 3,
      inputPart1: parts.find((part) => part.name === "sprocket"),
      inputQuantity1: 2,
      isAlternate: true,
      altScore: 95,
    }),
    new Recipe({
      name: "widget but less efficient",
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
      outputPart: parts.find((part) => part.name === "sprocket"),
      outputQuantity: 1,
    }),
    new Recipe({
      name: "thingamabob",
      outputPart: parts.find((part) => part.name === "thingamabob"),
      outputQuantity: 1,
    }),
  ];
  return { recipes, parts };
}
