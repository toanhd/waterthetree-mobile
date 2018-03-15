import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class GhModule {

  constructor(public http: HttpClient) {
    console.log('Hello GhModule Provider');
  }

}
