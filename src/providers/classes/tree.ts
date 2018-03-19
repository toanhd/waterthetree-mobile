import { Marker, LatLng } from '@ionic-native/google-maps';

const isUseConfig = false;

export class Tree {
    id: string;
    name: string;
    size_id: number;
    type_id: number;
    type_name: string;
    max_water_level: number;
    current_water_level: number;
    latLng: LatLng;
    status: number;
    private marker: Marker;


    constructor() {
        this.id = "";
        this.name = "";
        this.size_id = -1;
        this.type_id = -1;
        this.type_name = "";
        this.max_water_level = -1;
        this.current_water_level = -1;
        this.latLng = new LatLng(-1, -1);
        this.status = -1;
    }

    onResponseData(data) {
        if (isUseConfig) {
            this.id = data.id;
            this.name = data.name;
            this.type_id = data.type_id;
            this.type_name = data.type_name;
            this.latLng = new LatLng(data.lat, data.lng);

            this.size_id = data.type_id == 3 ? 1 :
                (data.type_id == 2 || data.type_id == 4) ? 2 : 3;
            this.max_water_level = this.size_id == 1 ? 4 : (this.size_id == 2 ? 8 : 12);
            this.current_water_level = Math.floor((Math.random() * this.max_water_level) + 1);
        }
        else {
            this.id = data._id;
            this.size_id = data.size_id;
            this.latLng = new LatLng(data.lat, data.long);
            this.max_water_level = data.max_water_level;
            this.current_water_level = data.current_water_level;

            this.type_id = this.size_id == 1 ? 3 : (this.size_id == 2 ? 2 : 1);
            this.type_name = this.size_id == 1 ? "Ô cỏ" : (this.size_id == 2 ? "Cây cau lùn" : "Cây Phượng vĩ");;
        }
    }

    setMarker(marker: Marker) {
        this.marker = marker;
    }

    getMarker() {
        return this.marker;
    }
}