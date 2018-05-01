import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';

import {HttpModule} from '@angular/http';

import {MyApp} from './app.component';
import {GhModule} from '../providers/gh-module/gh-module';

import {GoogleMaps} from '@ionic-native/google-maps';
import {Geolocation} from '@ionic-native/geolocation';

import {GhSocketProvider} from '../providers/gh-socket/gh-socket';
import {SocketIoModule, SocketIoConfig} from 'ng-socket-io';

const config: SocketIoConfig = {url: 'http://localhost:3000', options: {}};
// const config: SocketIoConfig = {url: 'http://52.148.83.12:8080/', options: {}};

@NgModule({
    declarations: [
        MyApp
    ],
    imports: [
        BrowserModule,
        HttpModule,
        IonicModule.forRoot(MyApp),
        SocketIoModule.forRoot(config),
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        GhModule,
        GoogleMaps,
        Geolocation,
        GhSocketProvider
    ]
})
export class AppModule {
}
