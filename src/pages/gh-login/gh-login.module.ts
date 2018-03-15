import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GhLoginPage } from './gh-login';

@NgModule({
  declarations: [
    GhLoginPage,
  ],
  imports: [
    IonicPageModule.forChild(GhLoginPage),
  ],
})
export class GhLoginPageModule {}
