import { Quest } from '../classes/quest';
import { Http, Headers, Response } from '@angular/http';
import { Injectable, Query } from '@angular/core';

import { Spherical, LatLng, Encoding } from '@ionic-native/google-maps';

import { Tree } from '../classes/tree';
import { TreeType } from '../classes/tree-type';
import { WaterResource } from '../classes/water-resourse';
import { User } from '../classes/user';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx'

declare var google;

@Injectable()
export class GhModule {
  url = "http://52.148.83.12:8080/";
  // url = "http://localhost:3000/";

  private directionService = new google.maps.DirectionsService();

  mUser: User = new User("");
  mTreeTypes: Array<TreeType> = [];
  trees: Array<Tree> = [];
  thirstyTrees: Array<Tree> = [];
  waters: Array<WaterResource> = [];
  quest: Quest;

  isConnecting = false;

  constructor(public http: Http) {
    console.log('Hello GhModule Provider');
    // this.getDataConfig();
    // this.loadServerData();
  }

  login(email: string, password: string): Observable<any> {
    let body = {
      "email": email,
      "password": password
    };
    let headers = new Headers({ 'Content-Type': 'application/json' });

    return this.getHttpService().post(this.url + 'authentication/login', body, { headers: headers })
      .map((response: Response) => {
        return {
          response: response.json(),
          code: response.status
        }
      }).catch((error: Response) => Observable.throw(error.json()));

  }

  getUser() {
    return this.mUser;
  }

  getHttpService() {
    return this.http;
  }

  getDataConfig() {
    this.getHttpService().get('./assets/data/trees.json').subscribe(data => {
      if (data && data['_body']) {
        JSON.parse(data['_body']).forEach(element => {
          let tree = new Tree();

          tree.onResponseData(element);
          this.trees.push(tree);
        });
      }
    });

    this.getHttpService().get('./assets/data/water.json').subscribe(data => {
      if (data && data['_body']) {
        JSON.parse(data['_body']).forEach(element => {
          let water = new WaterResource();

          water.onResponseData(element);

          this.waters.push(water);
        });
      }
    });
  }

  getTreeData() {
    return this.getHttpService().get(this.url + "plant/");
  }

  getWaterResourceData() {
    return this.getHttpService().get(this.url + "water-resource/");
  }


  getUrl() {
    return this.url;
  }

  loadServerData() {
    let i = 0;
    return new Promise((res, rej) => {
      this.getTreeData().subscribe(data => {

        if (data && data['status'] == 200) {

          JSON.parse(data["_body"]).plants.forEach(element => {
            let tree = new Tree();
            tree.onResponseData(element);

            this.trees.push(tree);

            if (tree.current_water_level / tree.max_water_level <= 0.34) {

              this.thirstyTrees.push(tree);
            }
          });

          i++;
          if (i == 2) {
            res();
          }
        }
        else {
          rej();
        }
      });

      let waterRes = this.getWaterResourceData();
      if (waterRes) {
        waterRes.subscribe(data => {
          if (data && data['status'] == 200) {
            JSON.parse(data["_body"]).water_resource.forEach(element => {
              let water = new WaterResource();
              water.onResponseData(element);

              this.waters.push(water);
            });

            i++;
            if (i == 2) {
              res();
            }
          }
          else {
            rej();
          }
        });
      }
      else {
        rej();
      }
    });
  }

  RefreshTreeData() {
    this.trees = [];

    return new Promise((res, rej) => {
      this.getTreeData().subscribe(data => {

        if (data && data['status'] == 200) {

          JSON.parse(data["_body"]).plants.forEach(element => {
            let tree = new Tree();
            tree.onResponseData(element);

            this.trees.push(tree);
          });

          res(this.trees);

        }
      });
    });
  }

  getTrees() {
    return this.trees;
  }

  getWaters() {
    return this.waters;
  }

  getQuest() {
    return this.quest;
  }

  updateQuests() {
    this.quest = null;
    let tempTree = {
      tree: null,
      ratio: 0,
      distance: -1
    };

    return new Promise((res, rej) => {
      if (this.mUser.currentLocation) {
        let relevantTrees;

        if (this.thirstyTrees.length > 0) {
          relevantTrees = this.thirstyTrees;
        }
        else {
          relevantTrees = this.trees;
        }


        relevantTrees.forEach((tree: Tree) => {
          let distance = Spherical.computeDistanceBetween(this.mUser.currentLocation, tree.latLng);
          let ratio = tree.current_water_level / tree.max_water_level;

          if (!tempTree.tree || (tempTree.tree && (distance < tempTree.distance) && (ratio < tempTree.ratio))) {
            tempTree.tree = tree;
            tempTree.ratio = tree.current_water_level / tree.max_water_level;
            tempTree.distance = distance;
          }
        });

        if (tempTree) {
          this.quest = new Quest(tempTree.tree, tempTree.distance);
          res();
        }
        else {
          rej();
        }
      }
      else {
        rej();
      }
    });
  }

  requestWaterTree(tree: Tree) {
    let body = {
      "plant_id": tree.id,
      "current_water_level": tree.current_water_level
    };
    return this.getHttpService().patch(this.getUrl() + 'plant/', body)
      .map((res: Response) => res.json())
      .catch(e => {
        console.log("error", e);

        return Observable.throw(e)
      })
  }

  startWorking() {
    return new Promise((res, rej) => {
      this.mUser.startWorking();
      this.updateQuests().then(() => {
        res();
      }).catch(() => {
        rej();
      });
    });
  }

  stopWorking() {
    this.quest.done().then(() => {
      this.mUser.stopWorking();
      this.quest = null;
    });
  }

  // function

  directionTo(origin: LatLng, destination: LatLng) {
    return new Promise((res, rej) => {
      let req = {
        origin: {
          lat: origin.lat,
          lng: origin.lng
        },
        destination: {
          lat: destination.lat,
          lng: destination.lng
        },
        optimizeWaypoints: true,
        travelMode: "WALKING",

      }

      this.directionService.route(req, (data) => {
        if (data && data['status'] == "OK") {
          let path = Encoding.decodePath(data['routes'][0].overview_polyline);

          res(path);
        }
        rej();
      });
    })
  }

  findNearestWaterResourse() {
    let water: WaterResource;
    let distance = -1;
    this.waters.forEach(w => {
      let d = Spherical.computeDistanceBetween(this.mUser.currentLocation, w.latLng);
      if (!water || d < distance) {
        water = w;
        distance = d;
      }
    });

    return water;
  }

  onQuestDone() {
    return new Promise((res, rej) => {
      this.quest.done().then(() => {
        this.thirstyTrees.splice(this.thirstyTrees.indexOf(this.quest.tree), 1);
        this.updateQuests().then(() => {
          res();
        }).catch(() => {
          rej();
        });
      });
    });
  }

  private arrangeTrees(arr: Array<Tree>) {
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        let ratio1 = arr[i].current_water_level / arr[i].max_water_level;
        let ratio2 = arr[j].current_water_level / arr[j].max_water_level;

        if (ratio1 > ratio2) {
          let temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
        }
      }
    }
  }
}
