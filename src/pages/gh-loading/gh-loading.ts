import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the GhLoadingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gh-loading',
  templateUrl: 'gh-loading.html',
})
export class GhLoadingPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidEnter() {
    console.log('ionViewDidLoad GhLoadingPage');
    this.onLoginProcess()
  }

  onLoginProcess(){
    setTimeout(() => {
      this.navCtrl.push("GhHomePage");
    }, 2000);
  }

}
