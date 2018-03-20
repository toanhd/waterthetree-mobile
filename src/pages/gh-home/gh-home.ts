import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import {
  GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions,
  MapType,
  LatLng, LatLngBounds, ILatLng,
  Marker, MarkerOptions,
  HtmlInfoWindow,
  CameraPosition,
  GroundOverlay, GroundOverlayOptions,
  Spherical
} from '@ionic-native/google-maps';

import { GhModule } from '../../providers/gh-module/gh-module'
import { Utils } from '../../providers/app-utils';

import { Tree } from '../../providers/classes/tree';
import { WaterResource } from '../../providers/classes/water-resourse';

@IonicPage()
@Component({
  selector: 'page-gh-home',
  templateUrl: 'gh-home.html',
})
export class GhHomePage {
  url = "http://52.148.84.99:8080/";
  @ViewChild('map') mapElement: ElementRef;
  map: GoogleMap;
  mPosition: LatLng;
  me: Marker;

  mTrees: Array<Tree> = [];
  isShowAllTrees = true;
  myRadius = 50;

  mWaters: Array<WaterResource> = [];
  isShowAllWaters = true;
  waterRadius = 70;

  mDatas = {
    markers: [
      "",
      "small-",
      "medium-",
      "large-"
    ]
  }


  constructor(public navCtrl: NavController,
    public mGeolocation: Geolocation,
    public mToastController: ToastController,
    public mAlertController: AlertController,
    public mGhModule: GhModule,
    public navParams: NavParams) {
    this.mTrees = mGhModule.getTrees();
    this.mWaters = mGhModule.getWaters();
    // console.log(mGhModule.getTrees());
  }

  ionViewDidEnter() {
    if (!this.map) {
      this.loadMap();
    }

    this.mGeolocation.getCurrentPosition().then((resp) => {
      this.mPosition = new LatLng(resp.coords.latitude, resp.coords.longitude);
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    let watch = this.mGeolocation.watchPosition();
    watch.subscribe((data) => {
      this.onChangePosition(data);
    });
  }

  loadMap() {
    let element: HTMLElement = document.getElementById('map');

    // this.map = this.mGoogleMaps.create(this.mapElement.nativeElement);
    this.map = GoogleMaps.create(element);

    let bachkhoa = new LatLng(21.005147, 105.843311);
    let ne = new LatLng(21.007658, 105.841205);
    let sw = new LatLng(21.003739, 105.845724);

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

        this.map.addMarker(me).then((marker: Marker) => {
          this.me = marker;
        });

        this.onPlanningTrees();
        this.onPutWaterResourses();

        this.map.animateCamera({
          target: location.latLng,
          duration: 100
        });

      });
      this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe(() => {
        this.findTreesAround();
        this.findWaterAround();
      });
    });
  }

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

  onPlanningTrees() {
    this.mTrees.forEach(tree => {
      let markerOpt: MarkerOptions = {
        icon: {
          url: './assets/imgs/' + (this.mDatas.markers[tree.size_id] + (((tree.current_water_level / tree.max_water_level >= 0.75) ? "high" : ((tree.current_water_level / tree.max_water_level >= 0.5 ? "medium" : "low"))) + ".png")),
          size: {
            width: 20,
            height: 30
          },
        },
        position: tree.latLng,
        visible: this.isShowAllTrees
      }

      this.map.addMarker(markerOpt).then((marker: Marker) => {
        tree.setMarker(marker);

        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          let htmlInfoWindow = new HtmlInfoWindow();

          var infoWindow = document.createElement("div");
          infoWindow.setAttribute("width", "100");

          let text = document.createElement("div");
          text.innerHTML = "id: " + tree.id + "<br>"
            + "Loại cây: " + tree.type_name + "<br>"
            + "lượng nước hiện tại: " + tree.current_water_level + "/" + tree.max_water_level;
          text.setAttribute("id", "info-text");



          let btn = document.createElement("button");
          btn.innerHTML = "Tưới cây";
          btn.setAttribute("padding", "1");
          // btn.setAttribute("background-color", "white");
          // btn.setAttribute("border", "1px solid black");
          btn.setAttribute("background", "white");
          btn.addEventListener("click", () => {
            if (tree.current_water_level < tree.max_water_level) {
              tree.current_water_level = tree.current_water_level + 1;

              this.onUpdateWater(tree);

              let toast = this.mToastController.create({
                message: "Tưới thành công",
                duration: 1000
              });
              toast.present();

              document.getElementById("info-text").innerHTML = "id: " + tree.id + "<br>"
                + "Loại cây: " + tree.type_name + "<br>"
                + "lượng nước hiện tại: " + tree.current_water_level + "/" + tree.max_water_level;

              marker.setIcon({
                url: './assets/imgs/' + (this.mDatas.markers[tree.size_id] + (((tree.current_water_level / tree.max_water_level >= 0.75) ? "high" : ((tree.current_water_level / tree.max_water_level >= 0.5 ? "medium" : "low"))) + ".png")),
                size: {
                  width: 20,
                  height: 30
                },
              });
            }
            else {
              let alert = this.mAlertController.create({
                title: 'Thông báo',
                subTitle: 'Không thể tưới, cây đã đủ nước',
                buttons: ['OK']
              });
              alert.present();
            }
          });

          infoWindow.appendChild(text);
          infoWindow.appendChild(btn);

          htmlInfoWindow.setContent(infoWindow);
          htmlInfoWindow.open(marker);
        });
        this.findTreesAround();
      });
    });
  }

  treeAround: Array<Tree> = [];
  findTreesAround() {
    if (!this.isShowAllTrees) {
      this.mTrees.forEach(tree => {
        let distance = Spherical.computeDistanceBetween(this.map.getCameraTarget(), tree.latLng);

        if (distance < this.myRadius) {
          tree.getMarker().setVisible(true);
        }
        else {
          tree.getMarker().setVisible(false);
        }
      });
    }
  }

  showAllTrees() {
    this.mTrees.forEach(tree => {
      tree.getMarker().setVisible(true);
    });
  }

  onPutWaterResourses() {
    this.mWaters.forEach(water => {
      let markerOpt: MarkerOptions = {
        icon: {
          url: './assets/imgs/water-resource.png',
          size: {
            width: 20,
            height: 30
          },
        },
        position: water.latLng,
        visible: this.isShowAllTrees
      }

      this.map.addMarker(markerOpt).then(marker => {
        water.setMarker(marker);
      })
    });
  }

  findWaterAround() {
    if (!this.isShowAllWaters) {
      this.mWaters.forEach(water => {
        let distance = Spherical.computeDistanceBetween(this.map.getCameraTarget(), water.latLng);

        if (distance < this.waterRadius) {
          water.getMarker().setVisible(true);
        }
        else {
          water.getMarker().setVisible(false);
        }
      });
    }
  }

  showAllWaters() {
    this.mWaters.forEach(water => {
      water.getMarker().setVisible(true);
    });
  }

  onClickSetting() {
    let alert = this.mAlertController.create();
    alert.setTitle('Tree View');

    alert.addInput({
      type: 'radio',
      label: 'Show All',
      value: 'all',
      checked: this.isShowAllTrees
    });

    alert.addInput({
      type: 'radio',
      label: 'Show Around',
      value: 'around',
      checked: !this.isShowAllTrees
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        if (data == "all") {
          this.isShowAllTrees = true;
          this.showAllTrees();
        }
        else {
          this.isShowAllTrees = false;
          this.findTreesAround();
        }
      }
    });
    alert.present();
  }

  onClickWater() {
    let alert = this.mAlertController.create();
    alert.setTitle('Water Resource View');

    alert.addInput({
      type: 'radio',
      label: 'Show All',
      value: 'all',
      checked: this.isShowAllWaters
    });

    alert.addInput({
      type: 'radio',
      label: 'Show Around',
      value: 'around',
      checked: !this.isShowAllWaters
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        if (data == "all") {
          this.isShowAllWaters = true;
          this.showAllWaters();
        }
        else {
          this.isShowAllWaters = false;
          this.findWaterAround();
        }
      }
    });
    alert.present();
  }

  onClickPost() {
    try {
      // this.mTrees.forEach(tree => {
      //   let body = {
      //     "size_id": tree.size_id,
      //     "lat": tree.latLng.lat,
      //     "long": tree.latLng.lng,
      //     "current_water_level": tree.current_water_level,
      //     "max_water_level": tree.max_water_level,
      //   }

      //   this.mGhModule.getHttpService().post(this.url + 'plant/', body).subscribe(data => {
      //     console.log(data);
      //   });
      // });

      // let body = {
      //   "lat": 0,
      //   "lng": 1,
      //   "description": water.name
      // }

      // this.mGhModule.getHttpService().post(this.url + 'water-resource/', body).subscribe(data=>{
      //   console.log(data);

      // })

      // this.mWaters.forEach(water=>{
      //   let body = {
      //     "lat": water.latLng.lat,
      //     "long": water.latLng.lng,
      //     "description": water.name
      //   }

      //   this.mGhModule.getHttpService().post(this.url + 'water-resource/', body).subscribe(data=>{
      //     console.log(data);

      //   })
      // })
      console.log("DONE");
    }
    catch (e) {
      console.log("error", e);

    }
  }


  onClickGet() {
    try {
      // this.mGhModule.getHttpService().get(this.url + 'plant/').subscribe(data => {
      //   console.log(data['_body']);
      // });

      let body = {
        "size_id": 1,
        "lat": 21.005181384973508,
        "long": 105.84548046557654,
        "current_water": 10,
        "in_need_water": 80,
      };
      this.mGhModule.getHttpService().post(this.url + 'plant/', body).subscribe(data => {
        console.log(data);
      });
    } catch (e) {
      console.log("Error cmnr", e);
    }
  }

  onUpdateWater(tree: Tree) {
    try {
      let body = {
        "plant_id": tree.id,
        "current_water_level": tree.current_water_level
      }
      this.mGhModule.getHttpService().patch(this.url + 'plant/', body).subscribe(data => {
        console.log(data);
      });
    }
    catch (e) {
      let alert = this.mAlertController.create({
        title: 'ERROR',
        subTitle: 'Không thể tưới cây',
        buttons: ['OK']
      });
      alert.present();
    }
  }

  onTestUpdate() {
    let body = {
      "plant_id": "5aafdcee8b241f0b4cfff27e",
      "current_water_level": 1
    }
    this.mGhModule.getHttpService().patch(this.url + 'plant/', body).subscribe(data => {
      console.log(data);
    });
  }

  clearTreesMarker() {
    return new Promise((res, rej) => {

      this.mTrees.forEach(tree => {
        if (tree.getMarker()) {
          tree.getMarker().remove();
        }
      });
      res();
    });
  }

  onClickRefresh() {
    this.clearTreesMarker().then(() => {
      this.mGhModule.RefreshTreeData().then(data => {
        this.mTrees = this.mGhModule.getTrees();
        this.onPlanningTrees();
      });
    });
  }

}
