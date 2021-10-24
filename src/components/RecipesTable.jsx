// @flow

import type Recipe from '../model/Recipe';

import * as React from 'react';

type Props = {
    recipes: Array<Recipe>,
};

export default function RecipesTable({ recipes }:Props):React.MixedElement {
    return <table>
        <thead>
            <tr>
            <th>Name</th>
            <th>Output Part</th>
            <th>Output Qty/min</th>
            <th>Input 1 Part</th>
            <th>Input 1 Qty/min</th>
            <th>Input 2 Part</th>
            <th>Input 2 Qty/min</th>
            <th>Input 3 Part</th>
            <th>Input 3 Qty/min</th>
            <th>Input 4 Part</th>
            <th>Input 4 Qty/min</th>
            <th>Byproduct Part</th>
            <th>Byproduct Qty/min</th>
            <th>Alternate?</th>
            <th>Alt Score</th>
            <th>Stage</th>
            </tr>
        </thead>
        <tbody>
            {
                recipes.map(recipe => <tr key={recipe.name}>
                    <td>{recipe.name}</td>
                    <td>{recipe.outputPart.name}</td>
                    <td>{recipe.outputQuantity}</td>
                    <td>{recipe.inputPart1.name}</td>
                    <td>{recipe.inputQuantity1}</td>
                    <td>{recipe.inputPart2?.name}</td>
                    <td>{recipe.inputQuantity2}</td>
                    <td>{recipe.inputPart3?.name}</td>
                    <td>{recipe.inputQuantity3}</td>
                    <td>{recipe.inputPart4?.name}</td>
                    <td>{recipe.inputQuantity4}</td>
                    <td>{recipe.byproductPart?.name}</td>
                    <td>{recipe.byproductQuantity}</td>
                    <td>{recipe.isAlternate}</td>
                    <td>{recipe.altScore}</td>
                    <td>{recipe.stage}</td>
                </tr>)
            }
        </tbody>
    </table>
}