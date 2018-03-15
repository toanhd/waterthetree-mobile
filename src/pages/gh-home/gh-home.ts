import {Component, ViewChild, ElementRef} from '@angular/core';
import {IonicPage, NavController, NavParams, AlertController} from 'ionic-angular';

import {Geolocation} from '@ionic-native/geolocation';

import {
  GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions,
  MapType,
  LatLng, LatLngBounds, ILatLng,
  Marker, MarkerOptions,
  CameraPosition,
  GroundOverlay, GroundOverlayOptions
} from '@ionic-native/google-maps';

import {GhModule} from '../../providers/gh-module/gh-module'

@IonicPage()
@Component({
  selector: 'page-gh-home',
  templateUrl: 'gh-home.html',
})
export class GhHomePage {
  @ViewChild('map') mapElement: ElementRef;
  map: GoogleMap;

  mPosition: LatLng;

  me: Marker;

  constructor(public navCtrl: NavController,
              public mGeolocation: Geolocation,
              public mAlertController: AlertController,
              public mGhModule: GhModule,
              public navParams: NavParams) {
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter GhHomePage');

    if (!this.map) {
      this.loadMap();
    }

    this.mGeolocation.getCurrentPosition().then((resp) => {
      console.log(resp);

      this.mPosition = new LatLng(resp.coords.latitude, resp.coords.longitude);

      // resp.coords.latitude
      // resp.coords.longitude
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    let watch = this.mGeolocation.watchPosition();
    watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      // data.coords.latitude
      // data.coords.longitude

      if (!this.isShowingAlert) {
        this.onChangePosition(data);
      }
    });

  }

  loadMap() {
    let element: HTMLElement = document.getElementById('map');

    // this.map = this.mGoogleMaps.create(this.mapElement.nativeElement);
    this.map = GoogleMaps.create(element);

    let bachkhoa = new LatLng(21.005147, 105.843311);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      console.log('Map is ready!');

      this.map.getMyLocation().then(location => {
        console.log(location);

        let mapOptions: GoogleMapOptions = {
          mapType: 'MAP_TYPE_NORMAL',
          controls: {
            compass: false,
            myLocationButton: false,
            indoorPicker: false,
            mapToolbar: false
          },
          gestures: {
            scroll: true,
            tilt: false,
            zoom: true,
            rotate: false,
          },
          styles: [
            {
              featureType: "transit.station.bus",
              stylers: [
                {
                  "visibility": "off"
                }
              ]
            }
          ],
          camera: {
            target: location.latLng,
            zoom: 17,
            tilt: 0
          },
          preferences: {
            zoom: {
              minZoom: 16,
              maxZoom: 19
            },
            building: false,
          }
        }
        this.map.setOptions(mapOptions);

        let me: MarkerOptions = {
          position: location.latLng
        }

        this.map.addMarker(me).catch((marker: Marker) => {
          this.me = marker;
        });

        this.map.animateCamera({
          target: location.latLng,
          duration: 100
        });
      })
    });
  }

  isShowingAlert = false;

  onChangePosition(data) {
    this.mPosition = new LatLng(data.coords.latitude, data.coords.longitude);

    if (this.me) {
      this.me.setPosition(this.mPosition);
    }

    // if (this.map) {
    //   this.map.animateCamera({
    //     target: this.mPosition,
    //     duration: 100
    //   });
    // }
  }

  url = "http://localhost:3000/";

  onClickGet() {
    try {
      this.mGhModule.getHttpService().get(this.url + 'plant').subscribe(data => {
        console.log(data['_body']);
      });
    } catch (e) {
      console.log("Error cmnr", e);
    }
  }
}
