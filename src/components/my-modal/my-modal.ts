import { WorkStatus } from './../../providers/classes/user-base';
import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'my-modal',
  templateUrl: 'my-modal.html'
})
export class MyModalComponent {
  @ViewChild('container') container: ElementRef;
  @ViewChild('backdrop') backdrop: ElementRef;
  @ViewChild('content') content: ElementRef;

  @Input('show') show: Subject<any>;

  @Output('startWork') startWork = new EventEmitter();
  @Output('changeContainer') changeContainer = new EventEmitter();
  @Output('updateRoute') updateRoute = new EventEmitter();

  mDatas = {
    userStatus: -1
  }

  mTexts = {
    title: "Settings",
    workTitle: "Bắt đầu phiên làm việc",
    changeWaterContainer: "Thay đổi bình tưới",
    updateRoute: "Cập nhật đường đi"
  }


  constructor() {
  }

  ngOnInit() {

    if (this.content) {
      this.content.nativeElement.addEventListener("click", (event) => {
        // event.preventDefault();
        event.stopPropagation();
      });
    }

    if (this.show) {
      this.show.subscribe(event => {
        this.mDatas.userStatus = event.status;
        this.mTexts.workTitle = this.mDatas.userStatus == WorkStatus.WORKING ? "Kết thúc phiên làm việc" : "Bắt đầu phiên làm việc";
        this.showModal();
      });
    }
  }

  hideModal() {
    if (!this.container.nativeElement.classList.contains('hidden')) {
      this.container.nativeElement.classList.add("hidden");
    }
  }

  showModal() {
    if (this.container.nativeElement.classList.contains('hidden')) {
      this.container.nativeElement.classList.remove("hidden");
    }
  }

  onClickClose() {
    this.hideModal();
  }

  onClickStart() {
    this.startWork.emit();
    this.hideModal();
  }

  onClickChangeContainer(){
    this.changeContainer.emit();
    this.hideModal();
  }

  onClickUpdateRoute(){
    this.updateRoute.emit();
    this.hideModal();
  }
}
