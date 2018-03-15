import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GhLoadingPage } from './gh-loading';

@NgModule({
  declarations: [
    GhLoadingPage,
  ],
  imports: [
    IonicPageModule.forChild(GhLoadingPage),
  ],
})
export class GhLoadingPageModule {}
