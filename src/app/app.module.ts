import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';
import { GhModule } from '../providers/gh-module/gh-module';

import { GoogleMaps } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
// import { SocketIoModule, SocketIoCon fig } from 'ng-socket-io';

// const config: SocketIoConfig = { url: 'http://localhost:8988', options: {} };

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    // SocketIoModule.forRoot(config) 
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    GhModule,
    GoogleMaps,
    Geolocation
  ]
})
export class AppModule { }
