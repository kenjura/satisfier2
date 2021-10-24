// @flow

import Recipe from "./Recipe";

export interface IPart {
  name: string;
}

export default class Part {
  name: string;
  static findAll: () => Array<Part>;

  constructor(props: IPart) {
    this.name = props.name;
  }
}

Part.findAll = (): Array<Part> => {
  const recipes = Recipe.findAll();
  let partNames = new Set<string>();
  recipes.forEach((recipe) => partNames.add(recipe.outputPart.name));
  return Array.from(partNames).map((partName) => new Part({ name: partName }));
};

const part1: Part = new Part({ name: "blarg" });
