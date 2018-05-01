import { GhModule } from './../../providers/gh-module/gh-module';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LatLng } from '@ionic-native/google-maps';

import { FormControl, FormGroup, Validators } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-gh-login',
  templateUrl: 'gh-login.html',
})
export class GhLoginPage {

  form = new FormGroup({
    username: new FormControl('', [
      Validators.required
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ])
  })

  constructor(public navCtrl: NavController,
    public mGhModule: GhModule,
    public navParams: NavParams) {
  }

  get username() {
    return this.form.get('username');
  }

  get password() {
    return this.form.get('password');
  }

  onClickLogin() {
    if (this.form.valid) {
      this.mGhModule.login(this.username.value, this.password.value);
    }

  }

}
