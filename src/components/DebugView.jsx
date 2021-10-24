// @flow

import Recipe from '../model/Recipe';

import * as React from 'react';
import { useMemo } from 'react';

type Props = {

}

export default function DebugView(props:Props):React.MixedElement {
	const recipes = useMemo(Recipe.findAll);

	console.log({recipes});

	return <div>
		debug time
	</div>
}