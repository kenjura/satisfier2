// @flow

import * as React from 'react';
import Recipe from '../model/Recipe';
import RecipesTable from './RecipesTable';
import { useMemo } from 'react';
import { getBestRecipeForEachPart } from "../helper/calculator";
import Part from '../model/Part';

const styles = {
    container: {
        display: 'grid',
        gridTemplateColumns: '50% 16px 50%',
    },
    col1: {
        gridColumn: '1',
        width: '100%',
        overflow: 'hidden',
        fontSize: '8px',
    },
    col3: {
        gridColumn: '3',
        width: '100%',
        overflow: 'hidden',
        fontSize: '8px',
    },
}

export default function RecipesPage():React.MixedElement {
    const recipes = useMemo(Recipe.findAll);

    return <div style={styles.container}>
        <RecipesTable recipes={recipes} />
    </div>
}