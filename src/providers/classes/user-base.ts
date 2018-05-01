import { Marker, LatLng, ILatLng } from '@ionic-native/google-maps';

export enum WorkStatus {
    WORKING, ONLINE, OFFLINE
}

export class UserBase {
    currentLocation: LatLng = new LatLng(0, 0);
    newLocation: LatLng;
    marker: Marker;
    userType: number;
    status = WorkStatus.OFFLINE;

    private TIME = 1; // thời gian trễ 1s
    private velocity = new LatLng(0, 0);

    private animationFrameId = -1;
    private isRunning = false;

    constructor(private _id: string) {

    }

    get id() {
        return this._id;
    }

    setLocation(latLng: LatLng) {
        this.currentLocation = latLng;
    }

    move(latLng: ILatLng) {
        if (this.isRunning) {
            this.stop();
        }

        this.newLocation = new LatLng(latLng.lat, latLng.lng);
        this.calculateVelocity(this.currentLocation, this.newLocation);
        this.run();
    }

    private calculateVelocity(beginningPoint: LatLng, targetPoint: LatLng) {
        this.velocity = new LatLng((targetPoint.lat - beginningPoint.lat) / (this.TIME * 60), (targetPoint.lng - beginningPoint.lng) / (this.TIME * 60));
    }

    public stop() {
        cancelAnimationFrame(this.animationFrameId);
        this.isRunning = false;
    }

    private run() {
        this.isRunning = true;

        this.animationFrameId = requestAnimationFrame(() => {
            let calculatedLat = this.currentLocation.lat + this.velocity.lat;
            let calculatedLng = this.currentLocation.lng + this.velocity.lng;

            let conditionLat = (calculatedLat - this.newLocation.lat)
                * (calculatedLat - this.currentLocation.lat);
            let conditionLng = (calculatedLng - this.newLocation.lng)
                * (calculatedLng - this.currentLocation.lng);

            // Sau khi + vận tốc, điểm tiếp theo đi qua mất điểm đích => set tới đích luôn
            if (conditionLat > 0 || conditionLng > 0) {
                calculatedLat = this.newLocation.lat
                calculatedLng = this.newLocation.lng
                this.stop();
            }

            this.currentLocation = new LatLng(calculatedLat, calculatedLng);

            if (this.marker) {
                this.marker.setPosition(this.currentLocation);
            }

            if (this.isRunning) this.run();
        });
    }

}