import { Tree } from './tree';
import { UserBase, WorkStatus } from './user-base';
import { WaterContainer } from './water-container';


export class User extends UserBase {
    private _waterContainer: WaterContainer;

    constructor(private uid: string) {
        super(uid);
    }

    set waterContainer(waterContainer: WaterContainer) {
        this._waterContainer = waterContainer;
    }

    get waterContainer() {
        return this._waterContainer;
    }

    waterSuccess(waterLevel: number) {
        this._waterContainer.currentLevel -= waterLevel;
    }

    fillWaterContainer() {
        this._waterContainer.currentLevel = this._waterContainer.maxLevel;
    }

    emptyWaterContainer() {
        this._waterContainer.currentLevel = 0;
        setTimeout(() => {
            this._waterContainer = null;
        }, 1000);
    }

    stopWorking() {
        this.status = WorkStatus.ONLINE;
    }

    startWorking() {
        this.status = WorkStatus.WORKING;
    }





}