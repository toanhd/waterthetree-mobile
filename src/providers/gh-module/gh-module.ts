import { Http } from '@angular/http';
import { Injectable } from '@angular/core';


@Injectable()
export class GhModule {

  constructor(public http: Http) {
    console.log('Hello GhModule Provider');
  }

  getHttpService(){
    return this.http;
  }

}
