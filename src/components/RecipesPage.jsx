// @flow

import * as React from 'react';
import rfdc from 'rfdc/default';
import Recipe from '../model/Recipe';
import RecipesTable from './RecipesTable';
import {
  getEnabledAlts,
  setEnabledAlts as saveEnabledAlts,
} from "../model/Preferences";
import { useState } from 'react';

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
    const [ enabledAlts, setEnabledAlts ] = useState(getEnabledAlts());
    const recipes = Recipe.findAll();

    const onEnabledAltChange = (recipe, isEnabled) => {
        let newEnabledAlts = rfdc(enabledAlts);
        if (isEnabled) {
            if (!newEnabledAlts.includes(recipe.name)) {
                newEnabledAlts.push(recipe.name);
            }
        } else {
            newEnabledAlts = newEnabledAlts.filter(alt => alt !== recipe.name);
        }
        saveEnabledAlts(newEnabledAlts);
        setEnabledAlts(newEnabledAlts);
    }

    const onSelectAll = () => {
        const allAlternateRecipes = recipes.filter(recipe => recipe.isAlternate).map(recipe => recipe.name);
        setEnabledAlts(allAlternateRecipes);
        saveEnabledAlts(allAlternateRecipes);
    }

    const onSelectNone = () => {
        setEnabledAlts([]);
        saveEnabledAlts([]);
    }

    return <div>
        <div>
            <button onClick={onSelectAll}>select all</button>
            <button onClick={onSelectNone}>select none</button>
        </div>
        <div style={styles.container}>
            <RecipesTable enabledAlts={enabledAlts} recipes={recipes} onEnabledAltChange={onEnabledAltChange} /> 
        </div>
    </div>
}