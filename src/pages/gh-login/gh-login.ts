import { GhModule } from '../../providers/gh-module/gh-module';
import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Tree } from '../../providers/classes/tree';

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
  });


  constructor(public navCtrl: NavController,
    private mAlert: AlertController,
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
      this.mGhModule.login(this.username.value, this.password.value)
        .subscribe(
          data => {
            if (data['response'].login == true) {
              this.navCtrl.push("GhLoadingPage");
            }
            else {
              let alert = this.mAlert.create({
                title: "Errors",
                message: "Đăng nhập thất bại, vui lòng kiểm tra lại thông tin",
                buttons: ["OK"]
              });
              alert.present();
            }
          },
          err => {
            let alert = this.mAlert.create({
              title: "Errors",
              message: err.title,
              buttons: ["OK"]
            });
            alert.present();
          }
        );
    }

    // try {
    //   this.mTrees.forEach(tree => {
    //     let body = {
    //       "size_id": tree.size_id,
    //       "lat": tree.latLng.lat,
    //       "long": tree.latLng.lng,
    //       "current_water_level": tree.current_water_level,
    //       "max_water_level": tree.max_water_level,
    //     };

    //     this.mGhModule.getHttpService().post(this.mGhModule.getUrl() + 'plant/', body).subscribe(data => {
    //       console.log(data);
    //       console.log("DONE");
    //     });
    //   });
    // }
    // catch (e) {
    //   console.log("error", e);

    // }
  }

  mTrees: Array<Tree> = [];
  onClickTitle() {
    // let i = 2;
    // this.mGhModule.trees.forEach(tree => {
    //   if (tree.size_id != 1) {
    //     tree.size_id = i;

    //     if (i < 20) {
    //       i++;
    //     }
    //     else {
    //       i = 2;
    //     }
    //   }

    //   if (tree.size_id != 1 && tree.size_id % 2 == 1) {
    //     tree.max_water_level = 8
    //   }
    //   else if (tree.size_id != 1 && tree.size_id % 2 == 0) {
    //     tree.max_water_level = 12
    //   }

    //   tree.current_water_level = Math.floor((Math.random() * tree.max_water_level) + 1);

    //   this.mTrees.push(tree);
    // });
    // console.log(this.mTrees);

  }
}
