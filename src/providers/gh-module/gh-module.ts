import {Quest} from './../classes/quest';
import {Http, Headers} from '@angular/http';
import {Injectable, Query} from '@angular/core';

import {Spherical, LatLng} from '@ionic-native/google-maps';

import {Tree} from '../classes/tree';
import {TreeType} from '../classes/tree-type';
import {WaterResource} from '../classes/water-resourse';
import {User} from '../classes/user';

declare var google;

@Injectable()
export class GhModule {

    private directionService = new google.maps.DirectionsService();

    mUser: User = new User("");
    mTreeTypes: Array<TreeType> = [];
    trees: Array<Tree> = [];
    thirstyTrees: Array<Tree> = [];
    waters: Array<WaterResource> = [];
    quest: Quest;

    constructor(public http: Http) {
        // console.log('Hello GhModule Provider');
        // this.getDataConfig();
        // this.loadServerData();
    }

    login() {

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

                    if (tree.current_water_level / tree.max_water_level <= 0.3) {
                        this.thirstyTrees.push(tree);
                    }
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

    url = "http://52.148.83.12:8080/";

    loadServerData() {
        let i = 0;
        return new Promise((res, rej) => {
            this.getTreeData().subscribe(data => {

                if (data && data['status'] == 200) {

                    JSON.parse(data["_body"]).plants.forEach(element => {
                        let tree = new Tree();
                        tree.onResponseData(element);

                        this.trees.push(tree);
                    });
                    console.log(this.trees);


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
                        console.log("rej");

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
        let tempTree: Tree;
        let tempDistance: number = -1;

        return new Promise((res, rej) => {
            if (this.mUser.currentLocation) {
                let relevantTrees;

                if (this.thirstyTrees.length > 0) {
                    console.log("thirsty");

                    relevantTrees = this.thirstyTrees;
                }
                else {
                    relevantTrees = this.trees;
                }

                relevantTrees.forEach(tree => {
                    let distance = Spherical.computeDistanceBetween(this.mUser.currentLocation, tree.latLng);

                    if (!tempTree || (tempTree && (distance < tempDistance))) {
                        tempTree = tree;
                        tempDistance = distance;
                    }
                });

                if (tempTree) {
                    this.quest = new Quest(tempTree, tempDistance);
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
                    console.log(data);

                    res(data['routes'][0].overview_polyline);
                }
                rej();
            });
        })
    }
}
