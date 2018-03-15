import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GhHomePage } from './gh-home';

@NgModule({
  declarations: [
    GhHomePage,
  ],
  imports: [
    IonicPageModule.forChild(GhHomePage),
  ],
})
export class GhHomePageModule {}
