import { Tree } from "./tree";
import { MarkerIcon } from '@ionic-native/google-maps';

export class Quest {

    private mDatas = {
        markers: [
            "",
            "small-",
            "medium-",
            "large-"
        ]
    }
    constructor(private _tree: Tree, public _distance: number) {
        if (_tree.getMarker()) {
            let icon: MarkerIcon = {
                url: './assets/imgs/' + (this.mDatas.markers[_tree.size_id] + (((_tree.current_water_level / _tree.max_water_level >= 0.75) ? "high" : ((_tree.current_water_level / _tree.max_water_level >= 0.5 ? "medium" : "low"))) + ".png")),
                size: {
                    width: 20,
                    height: 30
                }
            }
            _tree.getMarker().setIcon(icon);
            _tree.getMarker().setVisible(true);
        }
    }

    get tree() {
        return this._tree;
    }

    get distance() {
        return this._distance;
    }


}