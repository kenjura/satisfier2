import Recipe from '../model/Recipe';

import { useMemo, useState } from 'react';

import './RecipeSelector.scss';

type RecipeSelectorProps = {
    onChange: Recipe => void,
    recipe: Recipe,
};

export default function RecipeSelector({ onChange, recipe }: RecipeSelectorProps): React.MixedElement {
  const [ editMode, setEditMode ] = useState(false);

  const recipes = useMemo(() => Recipe.findAll().filter((rec: Recipe) => rec.outputPart.name === recipe.outputPart.name), [recipe]);

    // const onClick = evt => {
    //     setEditMode(!editMode);
    // }

    const onMouseEnter = evt => {
        setEditMode(true);
    }

    const onMouseLeave = evt => {
        setEditMode(false);
    }

    const onSelectChange = recipeName => {
        const recipe = Recipe.findAll().find(rec => rec.name === recipeName);
        onChange(recipe); // todo; check nulls
    }

  return <div className="recipe-selector" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
    
    { true && 
        <select value={recipe.name} onChange={event => onSelectChange(event.target.value)}>
            { recipes.map(recipe => <option
                key={recipe.name}
                value={recipe.name}>
                {recipe.name}
            </option>
             ) }
        </select>
     }
  </div>
}

/*
<option key={part.name} value={part.name}>
            {part.name}
          </option>
          */