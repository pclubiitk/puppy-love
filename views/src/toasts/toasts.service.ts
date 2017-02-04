import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable()
export class ToastService {
  toasthandler: Observable<string>;
  dataObserver: Observer<any>;

  constructor() {
    this.toasthandler = new Observable<string>(observer => {
      this.dataObserver = observer;
    });
  }

  toast(val: string) {
    this.dataObserver.next(val);
  }
}
