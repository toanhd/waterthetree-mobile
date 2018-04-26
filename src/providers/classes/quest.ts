import { Tree } from "./tree";


export class Quest{
    constructor(private _tree: Tree, public _distance: number){

    }

    get tree(){
        return this._tree;
    }

    get distance(){
        return this._distance;
    }


}