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
                url: _tree.getIconUrl(true),
                size: {
                    width: 25,
                    height: 35
                }
            }
            _tree.getMarker().setIcon(icon);
            _tree.getMarker().setVisible(true);
        }
    }

    done() {
        return new Promise((res, rej) => {
            if (this._tree.getMarker()) {
                let icon: MarkerIcon = {
                    url: this._tree.getIconUrl(),
                    size: {
                        width: 15,
                        height: 25
                    }
                }
                this._tree.getMarker().setIcon(icon);
                this._tree.getMarker().setVisible(true);
            }
            res();
        });
    }

    get tree() {
        return this._tree;
    }

    get distance() {
        return this._distance;
    }


}