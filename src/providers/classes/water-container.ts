

export class WaterContainer {

    constructor(private _maxLevel: number, private _currentLevel: number) {

    }

    /**
     * Cập nhật lượng nước tối đa
     */
    set maxLevel(level: number) {
        this._maxLevel = level;
    }

    get maxLevel() {
        return this._maxLevel;
    }

    /**
     * Cập nhật lượng nước hiện tại
     */
    set currentLevel(level: number) {
        this._currentLevel = level;
    }

    get currentLevel(){
        return this._currentLevel;
    }
}