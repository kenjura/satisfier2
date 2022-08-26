// @flow
import moize from "moize";
import Recipe from "./Recipe";

export interface IPart {
  name: string;
}

export default class Part {
  name: string;
  static findAll: () => Array<Part>;
  static stub: (string) => ?Part;
  static stubRequired: (string) => Part;

  constructor(props: IPart) {
    this.name = props.name;
  }
}

Part.findAll = moize(findAll);
Part.stub = moize(stub);
Part.stubRequired = moize(stub);

function findAll(): Array<Part> {
  const recipes = Recipe.findAll();
  let partNames = new Set<string>();
  recipes.forEach((recipe) => partNames.add(recipe.outputPart.name));
  return Array.from(partNames).map((partName) => new Part({ name: partName }));
}

function stub(name: ?string): ?Part {
  if (name === null || name === undefined) return null;
  return new Part({ name });
}

function stubRequired(name: string): ?Part {
  if (name === null || name === undefined) {
    // this data is loaded dynamically; Flow won't catch these errors
    throw new Error("Part > stubRequired > name must be supplied.");
  }
  return new Part({ name });
}
