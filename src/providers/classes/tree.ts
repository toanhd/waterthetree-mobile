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

    private trees = [
        "Ô cỏ",
        "Cây Phượng vĩ",
        "Cây Cau lùn",
        "Cây Sấu",
        "Cây Bằng Lăng",
        "Cây Bàng",
        "Cây Hoa Sứ",
        "Cây Sưa",
        "Cây Phượng nhỏ",
        "Cây Tùng",
        "Cây Bàng nhỏ",
        "Cây Đa",
        "Cây Phong",
        "Cây Xà cừ",
        "Cây Liễu",
        "Cây Hoa Sữa",
        "Cây Gạo",
        "Cây Sao đen",
        "Cây Sấu nhỏ",
        "Cây Sưa đỏ"
    ]

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

            this.type_id = this.size_id;
            this.type_name = this.trees[this.size_id - 1];
        }
    }

    setMarker(marker: Marker) {
        this.marker = marker;
    }

    getMarker() {
        return this.marker;
    }

    beWatered() {
        this.current_water_level += 1;
    }

    canBeWatered() {
        return this.current_water_level < this.max_water_level;
    }

    getRatio() {
        return this.current_water_level / this.max_water_level;
    }

    setCurrentWater(waterLevel: number) {
        this.current_water_level = waterLevel;
    }


    getIconUrl(visible?: boolean) {
        let markers = [
            "small-",
            "medium-",
            "large-"
        ]

        let result = './assets/imgs/';

        if (this.size_id == 1) {
            result += "small-";
        }
        else if (this.size_id % 2 != 0) {
            result += "medium-";
        }
        else {
            result += "large-";
        }

        if (this.getRatio() >= 0.75) {
            result += "high";
        }
        else if (this.getRatio() >= 0.5) {
            result += "medium";
        }
        else {
            result += "low";
        }

        if (visible) {
            result += ".png";
        }
        else {
            result += "-o.png";
        }

        return result;
    }
}