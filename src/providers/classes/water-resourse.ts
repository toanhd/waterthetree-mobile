import { Marker, LatLng } from '@ionic-native/google-maps';

const isUseConfig = false;

export class WaterResource {
    id: string;
    name: string;
    latLng: LatLng;
    private marker: Marker;

    constructor() {

    }

    onResponseData(data) {
        if (isUseConfig) {
            this.id = data.id;
            this.name = data.name;
            this.latLng = new LatLng(data.lat, data.lng);
        }
        else {
            this.id = data._id;
            this.name = data.description;
            this.latLng = new LatLng(data.lat, data.long);
        }
    }

    setMarker(marker: Marker) {
        this.marker = marker;
    }

    getMarker() {
        return this.marker;
    }
}