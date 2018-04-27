import { GhModule } from './../../providers/gh-module/gh-module';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LatLng } from '@ionic-native/google-maps';


@IonicPage()
@Component({
  selector: 'page-gh-login',
  templateUrl: 'gh-login.html',
})
export class GhLoginPage {

  constructor(public navCtrl: NavController,
    public mGhModule: GhModule,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad GhLoginPage');
  }

  onClickLogin() {
    this.mGhModule.login();
    this.navCtrl.push("GhLoadingPage");
  }

  onClickTitle() {
    // this.sendMessage("Hello");
  }

  sendMessage(msg: string) {
    // this.socket.emit("message", msg);
  }

}
