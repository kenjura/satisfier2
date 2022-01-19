// @flow

import Recipe from "./Recipe";

export type Building = {
  recipe: Recipe,
  type: string,
  buildingQuantity: number,
  stack: number,
};
