import { IonicPageModule } from 'ionic-angular';
import { NgModule } from '@angular/core';
import { MyModalComponent } from './my-modal/my-modal';
@NgModule({
	declarations: [MyModalComponent,
    MyModalComponent],
	imports: [IonicPageModule],
	exports: [MyModalComponent,
    MyModalComponent]
})
export class ComponentsModule {}
