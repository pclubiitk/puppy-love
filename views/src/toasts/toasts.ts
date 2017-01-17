import {Component, Output, Input, EventEmitter} from '@angular/core';
import 'rxjs/Rx';

const styles = require('./toasts.css');
const template = require('./toasts.html');

class Toast {
  value: string;

  constructor(_value: string) {
    this.value = _value;
  }
};

@Component({
  selector: 'toasts',
  styles: [ styles ],
  template: template
})
export class Toasts {

  // This gets the events
  @Input() toasthandler: Observable<Array<string>>;

  // This is looped over to display toasts
  values: Array<Toast> = [];

  constructor() {
    this.newToast('abcd cool man casasdas daadas ');
    this.newToast('efghi');
  }

  ngOnInit() {
    let subscription = this.toasthandler.subscribe(
      value => {
        this.newToast(value);
      },
      error => {},
      () => {}
    );
  }

  newToast(value: string) {
    let nt = new Toast(value);
    this.values.push(nt);
    setTimeout(() => {
      this.removeItem(nt);
    }, 3000);
  }

  removeItem(value: Toast) {
    this.values.splice(this.values.indexOf(value), 1);
  }
}
