import assert from "assert/strict";

import Part from "../model/Part.js";
import Recipe from "../model/Recipe.js";
import { getBestRecipeForEachPart } from "./calculator.js";

describe("calculate", () => {
  describe("getBestRecipeForEachPart", () => {
    it("exists", () => {
      expect(getBestRecipeForEachPart).toBeTruthy();
    });

    it("returns a value", () => {
      expect(getBestRecipeForEachPart([], [])).toBeTruthy();
    });

    describe("tests with data", () => {
      let recipes = Recipe.findAll();
      let parts = Part.findAll();

      it("returns ???", () => {
        console.log(getBestRecipeForEachPart(parts, recipes));
        expect(getBestRecipeForEachPart(parts, recipes)).toEqual("foo");
      });
    });
  });
});
