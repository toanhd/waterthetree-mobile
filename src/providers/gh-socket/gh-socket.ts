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

    sendMessage(msg: string) {
        this.socket.emit("msg", msg);
    }

    getMessage() {
        return this.socket
            .fromEvent("msg")
            .map((data:any) => {
                return data.msg;
            });
    }
}
