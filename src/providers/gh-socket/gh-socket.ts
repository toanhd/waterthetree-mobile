import {Injectable} from '@angular/core';
import {Socket} from 'ng-socket-io';
import 'rxjs/add/operator/map';
import {ILatLng} from "@ionic-native/google-maps";

/*
  Generated class for the GhSocketProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GhSocketProvider {

    constructor(private socket: Socket) {
    }

    updateWaterLevel(tree: {}) {
        this.socket.emit("waterlvl", tree);
    }

    getWaterLevel() {
        return this.socket
            .fromEvent("waterlvl")
            .map((data: any) => {
                return data.tree;
            });
    }

    updateUserLocation(id: string, location: ILatLng) {
        let user= {
            id: id,
            location: location
        };
        this.socket.emit("userposition", user);
    }

    getUserLocation() {
        return this.socket
            .fromEvent("userposition")
            .map((data: any) => {
                return data.user;
            });
    }
}
