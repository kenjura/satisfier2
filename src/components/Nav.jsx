// @flow

import * as React from 'react';
import { Link, Route, useRoute } from "wouter";

import "./Nav.scss";

export default function():React.MixedElement {
  const [isCalculator] = useRoute("/calculator");
  const [isRecipes] = useRoute("/recipes");

    return <nav id="nav-main"> 
        <Link href="/calculator" className={isCalculator ? 'active' :''}>Calculator</Link>
        <Link href="/recipes" className={isRecipes ? 'active' : ''}>Recipes</Link>
    </nav>
}