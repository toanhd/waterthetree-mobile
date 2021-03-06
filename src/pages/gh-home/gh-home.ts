import { UserBase } from './../../providers/classes/user-base';
import { WaterContainer } from '../../providers/classes/water-container';
import { Subject } from 'rxjs/Subject';
import { WorkStatus } from '../../providers/classes/user-base';
import { User } from '../../providers/classes/user';
import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import {
  GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions,
  ILatLng,
  Marker, MarkerOptions,
  HtmlInfoWindow,
  Spherical,
  LocationService,
  Polyline, PolylineOptions,
  Circle, CircleOptions, LatLng
} from '@ionic-native/google-maps';

import { GhModule } from '../../providers/gh-module/gh-module'
import { Tree } from '../../providers/classes/tree';
import { WaterResource } from '../../providers/classes/water-resourse';
import { GhSocketProvider } from "../../providers/gh-socket/gh-socket";


@IonicPage()
@Component({
  selector: 'page-gh-home',
  templateUrl: 'gh-home.html',
})
export class GhHomePage {
  @ViewChild('map') mapElement: ElementRef;

  @Input() showModal: Subject<any> = new Subject();

  map: GoogleMap;
  me: User;

  mTrees: Array<Tree> = [];
  infoWindow: HtmlInfoWindow;
  isShowAllTrees = false;
  myRadius = 70; // 50m

  mWaters: Array<WaterResource> = [];
  isShowAllWaters = true;
  waterRadius = 70;
  onLoading = false;

  mDatas = {
    // markers: [
    //   "",
    //   "small-",
    //   "medium-",
    //   "large-"
    // ]
  }


  constructor(public navCtrl: NavController,
    public mGeolocation: Geolocation,
    public mToastController: ToastController,
    public mAlertController: AlertController,
    public mGhModule: GhModule,
    private mPlatform: Platform,
    public navParams: NavParams,
    private ghSocketProvider: GhSocketProvider) {
    this.mTrees = mGhModule.getTrees();
    this.mWaters = mGhModule.getWaters();
    this.me = mGhModule.getUser();
  }


  tempUser = {
    id: "",
    location: {
      lat: 0,
      lng: 0
    }
  }

  ionViewDidEnter() {
    this.tempUser.id = "" + Math.floor((Math.random() * 1000) + 1);
    this.ghSocketProvider.getWaterLevel()
      .subscribe((tree: Tree) => {
        for (let i = 0; i < this.mTrees.length; i++) {
          if (this.mTrees[i].id == tree.id) {
            this.mTrees[i].setCurrentWater(tree.current_water_level);

            this.mTrees[i].getMarker().setIcon({
              url: this.mTrees[i].getIconUrl(tree.id == this.mGhModule.getQuest().tree.id),
              size: {
                width: this.mGhModule.getQuest() && (tree.id == this.mGhModule.getQuest().tree.id) ? 25 : 15,
                height: this.mGhModule.getQuest() && (tree.id == this.mGhModule.getQuest().tree.id) ? 35 : 25
              },
            });
            if (tree.id == this.mGhModule.getQuest().tree.id) {
              this.updateInfoWindow(this.mTrees[i]);
            }
            break;
          }
        }
      });

    this.ghSocketProvider.getUserLocation()
      .subscribe(user => {
        let u = this.mGhModule.getUserById(user.id);

        if (u) {
          u.move(user.location);
          u.updateTime(new Date().toString());
        }
        else {
          let u = new UserBase(user.id);
          u.setLocation(new LatLng(user.location.lat, user.location.lng));
          u.updateTime(new Date().toString());
          this.mGhModule.addUser(u);

          let markerOpt: MarkerOptions = {
            position: user.location
          }

          if (this.map) {
            this.map.addMarker(markerOpt).then(marker => {
              u.setMarker(marker);

              marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
                if (this.infoWindow) {
                  this.infoWindow.close();
                }
                this.infoWindow = new HtmlInfoWindow();
                this.infoWindow.setContent("UserID: " + user.id + "<br>" + "Last update: " + u.lastUpdate);

                this.infoWindow.open(marker);
              });
            });
          }
        }

      });

    this.mPlatform.ready().then(() => {
      if (this.mPlatform.is('android') || this.mPlatform.is('ios')) {
        if (!this.map) {
          this.loadMap();
        }

      }
    });
  }


  loadMap() {
    let mapElement: HTMLElement = document.getElementById('map');
    setTimeout(() => {
      if (!this.map) {
        this.loadMap();
      }
    }, 5000);
    LocationService.getMyLocation({ enableHighAccuracy: true }).then(location => {
      let watch = this.mGeolocation.watchPosition({ enableHighAccuracy: true });
      watch.subscribe((data) => {
        this.onChangePosition({ lat: data.coords.latitude, lng: data.coords.longitude });
      });

      let mapOption: GoogleMapOptions = {
        mapType: 'MAP_TYPE_ROADMAP',
        controls: {
          compass: false,
          myLocation: true,
          myLocationButton: false,
          indoorPicker: false,
          mapToolbar: false,
          zoom: false
        },
        gestures: {
          scroll: true,
          tile: false,
          zoom: true,
          rotate: false
        },
        styles: [
          {
            featureType: "transit.line",
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
          duration: 1000
        },
        preferences: {
          zoom: {
            minZoom: 16,
            maxZoom: 19
          },
          building: false,
        }
      }

      this.map = GoogleMaps.create(mapElement, mapOption);

      // let me: MarkerOptions = {
      //   position: location.latLng
      // }

      // this.map.addMarker(me).then((marker: Marker) => {
      //   this.me.marker = marker;
      // });

      let circleOption: CircleOptions = {
        center: { lat: 21.005618, lng: 105.843347 },
        radius: 240,
        strokeColor: "red",
        strokeWidth: 1,
        fillColor: "rgba(0,255,0,0.1)"
      }

      this.map.addCircle(circleOption).then((circle: Circle) => {

      });

      this.onPlanningTrees();
      this.onPutWaterResourses();

      this.onChangePosition(location.latLng);

      this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe(() => {
        this.findTreesAround();
      });
    }).catch(e => {
    });
  }

  onChangePosition(latlng: ILatLng) {
    if (this.me) {
      this.me.move(latlng);
      this.ghSocketProvider.updateUserLocation(this.me.id, latlng);
    }
  }

  nearest: WaterResource;

  onPlanningTrees() {
    this.mTrees.forEach(tree => {
      let markerOpt: MarkerOptions = {
        icon: {
          url: tree.getIconUrl(),
          size: {
            width: 15,
            height: 25
          },
        },
        position: tree.latLng,
        visible: this.isShowAllTrees
      }
      this.map.addMarker(markerOpt).then((marker: Marker) => {
        tree.setMarker(marker);

        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          if (this.infoWindow) {
            this.infoWindow.close();
          }
          this.infoWindow = new HtmlInfoWindow();

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
          btn.setAttribute("background", "white");
          btn.addEventListener("click", () => {
            if (!this.onLoading) {
              let distance = 0;
              // let distance = Spherical.computeDistanceBetween(this.me.currentLocation, tree.latLng);
              if (distance > 10) {
                let toast = this.mToastController.create({
                  message: "Bạn không trong phạm vi tưới cây!!!",
                  duration: 2000
                });

                toast.present();
              }
              else {
                if (this.me.waterContainer.currentLevel <= 0) {
                  let alert = this.mAlertController.create({
                    title: 'Hết nước',
                    subTitle: 'Tìm điểm lấy nước?'
                  });
                  alert.addButton('Cancel');
                  alert.addButton({
                    text: 'Tìm',
                    handler: data => {
                      this.onLoading = true;
                      this.showAllWaters();
                      this.moveToMe();
                      this.nearest = this.mGhModule.findNearestWaterResourse();

                      this.mGhModule.directionTo(this.me.currentLocation, this.nearest.latLng).then((data: Array<ILatLng>) => {

                        this.drawDirection(data);
                        this.onLoading = false;
                      });
                    }
                  });

                  alert.present();
                }
                else {
                  if (tree.id == this.mGhModule.getQuest().tree.id) {
                    this.waterTree(tree);
                  }
                  else {
                    let alert = this.mAlertController.create({
                      title: 'Thông báo',
                      subTitle: 'Cây này không phải nhiệm vụ hiện tại. Bạn chắc chắn muốn tưới?',
                    });

                    alert.addButton('Cancel');
                    alert.addButton({
                      text: 'OK',
                      handler: data => {
                        this.waterTree(tree);
                      }
                    });

                    alert.present();
                  }
                }
              }
            }
          });

          infoWindow.appendChild(text);
          if (this.me.status == WorkStatus.WORKING) {
            infoWindow.appendChild(btn);
          }

          this.infoWindow.setContent(infoWindow);
          this.infoWindow.open(marker);
        });
        this.findTreesAround();
      });
    });
  }

  updateInfoWindow(tree: Tree) {
    if (this.infoWindow) {
      this.infoWindow.close();
    }

    this.infoWindow = new HtmlInfoWindow();

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
    btn.setAttribute("background", "white");
    btn.addEventListener("click", () => {
      if (!this.onLoading) {
        let distance = 0;
        // let distance = Spherical.computeDistanceBetween(this.me.currentLocation, tree.latLng);
        if (distance > 10) {
          let toast = this.mToastController.create({
            message: "Bạn không trong phạm vi tưới cây!!!",
            duration: 2000
          });

          toast.present();
        }
        else {
          if (this.me.waterContainer.currentLevel <= 0) {
            let alert = this.mAlertController.create({
              title: 'Hết nước',
              subTitle: 'Tìm điểm lấy nước?'
            });
            alert.addButton('Cancel');
            alert.addButton({
              text: 'Tìm',
              handler: data => {
                this.onLoading = true;
                this.showAllWaters();
                this.moveToMe();
                this.nearest = this.mGhModule.findNearestWaterResourse();

                this.mGhModule.directionTo(this.me.currentLocation, this.nearest.latLng).then((data: Array<ILatLng>) => {

                  this.drawDirection(data);
                  this.onLoading = false;
                });
              }
            });

            alert.present();
          }
          else {
            if (tree.id == this.mGhModule.getQuest().tree.id) {
              this.waterTree(tree);
            }
            else {
              let alert = this.mAlertController.create({
                title: 'Thông báo',
                subTitle: 'Cây này không phải nhiệm vụ hiện tại. Bạn chắc chắn muốn tưới?',
              });

              alert.addButton('Cancel');
              alert.addButton({
                text: 'OK',
                handler: data => {
                  this.waterTree(tree);
                }
              });

              alert.present();
            }
          }
        }
      }
    });

    infoWindow.appendChild(text);
    if (this.me.status == WorkStatus.WORKING) {
      infoWindow.appendChild(btn);
    }

    this.infoWindow.setContent(infoWindow);
    this.infoWindow.open(tree.getMarker());
  }

  treeAround: Array<Tree> = [];

  findTreesAround() {
    if (!this.isShowAllTrees) {
      this.mTrees.forEach(tree => {
        if (!this.mGhModule.getQuest() || (tree.id != this.mGhModule.getQuest().tree.id)) {
          let distance = Spherical.computeDistanceBetween(this.map.getCameraTarget(), tree.latLng);

          if (distance < this.myRadius) {
            if (tree.getMarker()) {
              tree.getMarker().setVisible(true);
            }
          }
          else {
            if (tree.getMarker()) {
              tree.getMarker().setVisible(false);
            }
          }
        }
      });
    }
  }

  showAllTrees() {
    this.mTrees.forEach(tree => {
      tree.getMarker().setVisible(true);
    });
  }

  hideAllTrees() {
    this.mTrees.forEach(tree => {
      if (tree.getMarker())
        tree.getMarker().setVisible(false);
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
      });
    });
  }

  findWaterAround() {
    if (!this.isShowAllWaters) {
      this.mWaters.forEach(water => {
        let distance = Spherical.computeDistanceBetween(this.map.getCameraTarget(), water.latLng);

        if (distance < this.waterRadius) {
          if (water.getMarker()) {
            water.getMarker().setVisible(true);
          }
        }
        else {
          if (water.getMarker()) {
            water.getMarker().setVisible(false);
          }
        }
      });
    }
  }

  showAllWaters() {
    this.mWaters.forEach(water => {
      water.getMarker().setVisible(true);
    });
  }

  hideAllWaters() {
    this.mWaters.forEach(water => {
      water.getMarker().setVisible(false);
    });
  }

  onClickSetting() {
    // send event to show modal
    this.showModal.next({ status: this.me.status });

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
    // alert.present();
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
      //   };
      //
      //   this.mGhModule.getHttpService().post(this.mGhModule.getUrl() + 'plant/', body).subscribe(data => {
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
      this.mGhModule.getHttpService().post(this.mGhModule.getUrl() + 'plant/', body).subscribe(data => {
        console.log(data);
      });
    } catch (e) {
      console.log("Error cmnr", e);
    }
  }

  onUpdateWater(tree: Tree) {
    // this.ghSocketProvider.updateWaterLevel(tree.current_water_level);
    try {
      this.onLoading = true;
      this.mGhModule.requestWaterTree(tree)
        .subscribe(data => {
          this.onLoading = false;
          let toast;

          if (data['success'] == 1) {

            if (tree.canBeWatered()) {
              tree.beWatered();
              this.waterTreeSuccess(1);
            }

            document.getElementById("info-text").innerHTML = "id: " + tree.id + "<br>"
              + "Loại cây: " + tree.type_name + "<br>"
              + "lượng nước hiện tại: " + tree.current_water_level + "/" + tree.max_water_level;

            tree.getMarker().setIcon({
              url: tree.getIconUrl(tree.id == this.mGhModule.getQuest().tree.id),
              size: {
                width: this.mGhModule.getQuest() && (tree.id == this.mGhModule.getQuest().tree.id) ? 25 : 15,
                height: this.mGhModule.getQuest() && (tree.id == this.mGhModule.getQuest().tree.id) ? 35 : 25
              },
            });

            this.socketWaterTree(tree);

            toast = this.mToastController.create({
              message: "Tưới thành công",
              duration: 1000
            });
          }
          else {
            toast = this.mToastController.create({
              message: "Tưới thất bại",
              duration: 3000
            });
          }
          toast.present();
        });
    }
    catch (e) {
      this.onLoading = false;
      let alert = this.mAlertController.create({
        title: 'ERROR',
        subTitle: 'Không thể tưới cây',
        buttons: ['OK']
      });
      alert.present();
    }
  }


  socketWaterTree(tree: Tree) {

    this.ghSocketProvider.updateWaterLevel(
      {
        current_water_level: tree.current_water_level,
        id: tree.id
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

  onChangeWaterLevel() {
    if (this.me.waterContainer) {
      let level = this.me.waterContainer.currentLevel / this.me.waterContainer.maxLevel;

      let elm = document.getElementById("water-level");

      elm.style.height = level * 100 + "%";

      if (level <= .1) {
        elm.style.backgroundColor = "red";
      }
      else if (level <= .3) {
        elm.style.backgroundColor = "#FBF138";
      }
      else if (level <= .6) {
        elm.style.backgroundColor = "#5DA326";
      }
      else {
        elm.style.backgroundColor = "lightblue";
      }
    }
  }

  onClickWaterLevel() {
    this.waterTreeSuccess(1);
  }

  i = 1;

  onClickTitle() {
    // this.i++;
    // if (this.i % 2 == 0) {
    //   this.onChangePosition({
    //     lat: 21.005618,
    //     lng: 105.843347
    //   });
    // }
    // else{
    //   this.onChangePosition({
    //     lat: 21.003790,
    //     lng: 105.844415
    //   });
    // }

  }

  // ---------------------------------------FUNCTION
  onChangeWorkStatus() {
    if (this.me.status == WorkStatus.WORKING) {
      this.mGhModule.stopWorking();

      this.me.emptyWaterContainer();
      if (this.infoWindow)
        this.infoWindow.close();
      this.onChangeWaterLevel();
      this.deletePolyline();
      this.findTreesAround();
    }
    else {
      this.onChooseWaterContainer();
    }
  }

  waterTreeSuccess(water: number) {
    if (this.me.waterContainer) {
      this.me.waterSuccess(water);
      this.onChangeWaterLevel();
    }
  }

  fillWaterContainer() {
    let distance = 0;
    // let distance = Spherical.computeDistanceBetween(this.me.currentLocation, this.nearest.latLng);

    if (this.me.waterContainer.currentLevel == 0) {
      if (distance > 10) {
        let toast = this.mToastController.create({
          message: "Bạn không trong phạm vi lấy nước!!!",
          duration: 2000
        });

        toast.present();
      }
      else {
        this.me.fillWaterContainer();
        this.onChangeWaterLevel();
        this.hideAllWaters();
        this.onDoingQuest();
        this.moveToMe();
      }
    }
  }

  myPolyline: Polyline;

  onChooseWaterContainer() {
    let alert = this.mAlertController.create();
    alert.setTitle('Pick Water Container');

    alert.addInput({
      type: 'radio',
      label: '4L',
      value: '4',
      checked: this.me.waterContainer && this.me.waterContainer.maxLevel == 4
    });

    alert.addInput({
      type: 'radio',
      label: '6L',
      value: '6',
      checked: this.me.waterContainer && this.me.waterContainer.maxLevel == 6
    });

    alert.addInput({
      type: 'radio',
      label: '8L',
      value: '8',
      checked: this.me.waterContainer && this.me.waterContainer.maxLevel == 8
    });

    alert.addInput({
      type: 'radio',
      label: '10L',
      value: '10',
      checked: this.me.waterContainer && this.me.waterContainer.maxLevel == 10
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        if (!this.me.waterContainer || !(parseInt(data, 10) == this.me.waterContainer.maxLevel)) {
          if (data && data != "") {
            if (data == "4") {
              this.me.waterContainer = new WaterContainer(4, 4);
            }
            else if (data == "6") {
              this.me.waterContainer = new WaterContainer(6, 6);
            }
            else if (data == "8") {
              this.me.waterContainer = new WaterContainer(8, 8);
            }
            else if (data == "10") {
              this.me.waterContainer = new WaterContainer(10, 10);
            }
            this.onLoading = true;
            this.mGhModule.startWorking().then(() => {
              this.onLoading = false;
              this.onChangeWaterLevel();
              this.onDoingQuest();
            }).catch(() => {
              console.log("ko co cay can tuoi");
              let alert = this.mAlertController.create({
                title: 'ERROR',
                subTitle: 'ko co cay can tuoi',
                buttons: ['OK']
              });
              alert.present();
            });
          }
        }
      }
    });
    alert.present();
  }

  onUpdateRoute() {

    if (this.me.waterContainer.currentLevel <= 0) {
      this.onLoading = true;
      this.nearest = this.mGhModule.findNearestWaterResourse();

      this.mGhModule.directionTo(this.me.currentLocation, this.nearest.latLng).then((data: Array<ILatLng>) => {

        this.drawDirection(data);
        this.onLoading = false;
      });
    }
    else {
      this.onDoingQuest();
    }
  }

  drawDirection(path: Array<ILatLng>) {

    let option: PolylineOptions = {
      points: path
    }
    this.map.addPolyline(option).then(polyline => {
      if (this.myPolyline) {
        this.deletePolyline();
      }
      this.myPolyline = polyline;
    });
  }

  onDoingQuest() {
    this.onLoading = true;
    this.mGhModule.directionTo(this.me.currentLocation, this.mGhModule.getQuest().tree.latLng).then((data: Array<ILatLng>) => {

      this.onLoading = false;
      this.drawDirection(data);
    });
  }

  deletePolyline() {
    this.myPolyline.remove();
    this.myPolyline = null;
  }

  waterTree(tree: Tree) {
    if (tree.canBeWatered()) {
      this.onUpdateWater(tree);
    }
    else {
      let alert = this.mAlertController.create({
        title: 'Thông báo',
        subTitle: 'Không thể tưới, cây đã đủ nước'
      });

      alert.addButton('Cancel');
      if (this.mGhModule.getQuest() && (tree.id == this.mGhModule.getQuest().tree.id)) {
        alert.addButton({
          text: 'Hoàn thành nhiệm vụ',
          handler: data => {
            this.infoWindow.close();
            this.mGhModule.onQuestDone().then(() => {
              this.moveToMe();
              this.onDoingQuest();
            });
          }
        });
      }
      alert.present();
    }
  }

  moveToMe() {
    LocationService.getMyLocation({ enableHighAccuracy: true }).then(location => {
      this.map.animateCamera({
        target: location.latLng,
        duration: 200
      });
    });
  }

  onClickMyLocation() {
    this.moveToMe();
  }

  onClickMyBK() {
    this.map.animateCamera({
      target: { lat: 21.005618, lng: 105.843347 },
      duration: 200
    });
  }
}
