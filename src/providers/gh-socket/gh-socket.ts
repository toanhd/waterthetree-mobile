import {Injectable} from '@angular/core';
import {Socket} from 'ng-socket-io';
import 'rxjs/add/operator/map';

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

    updateUserLocation(user: {}) {
        this.socket.emit("user-position", user);
    }

    getUserLocation() {
        return this.socket
            .fromEvent("user-position")
            .map((data: any) => {
                return data.user;
            });
    }
}
