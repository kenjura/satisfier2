// @flow

export interface IPart {
	name: string,
}

export default class Part {
	name: string;

	constructor(props: IPart) {
		this.name = props.name;
	}
}


const part1:Part = new Part({name:'blarg'});