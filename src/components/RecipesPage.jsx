// @flow

import * as React from 'react';
import Recipe from '../model/Recipe';
import RecipesTable from './RecipesTable';
import { useMemo } from 'react';

export default function RecipesPage():React.MixedElement {
    const recipes = useMemo(Recipe.findAll);

    return <div>
        <RecipesTable recipes={recipes} />        
    </div>
}