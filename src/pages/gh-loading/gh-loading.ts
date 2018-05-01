import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { GhModule } from '../../providers/gh-module/gh-module'
import { LatLng } from '@ionic-native/google-maps';


@IonicPage()
@Component({
  selector: 'page-gh-loading',
  templateUrl: 'gh-loading.html',
})
export class GhLoadingPage {

  constructor(public navCtrl: NavController,
    public mAlertController: AlertController,
    public mGhModule: GhModule,
    public navParams: NavParams) {
  }

  ionViewDidEnter() {
    this.onLoginProcess();
  }

  onLoginProcess() {
    this.mGhModule.loadServerData().then(() => {
      setTimeout(() => {
        this.navCtrl.setRoot("GhHomePage");
      }, 1000);
    }).catch(() => {
      let alert = this.mAlertController.create({
        title: 'ERROR',
        subTitle: 'Không kêt nối được với Server, vui lòng kiểm tra lại kết nối',
        buttons: [{
          text: "Thử lại",
          handler: () => {
            this.onLoginProcess();
          }
        }]
      });
      alert.present();
    });
  }

}
