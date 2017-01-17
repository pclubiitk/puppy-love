import {Component, Output, Input, EventEmitter,
        trigger, transition, style, animate, state} from '@angular/core';
import 'rxjs/Rx';

const styles = require('./toasts.css');
const template = require('./toasts.html');

class Toast {
  value: string;
  show: boolean;

  constructor(_value: string) {
    this.value = _value;
    this.show = false;
  }
};

@Component({
  selector: 'toasts',
  styles: [ styles ],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0)'})),
      transition('void => *', [
        style({transform: 'translateX(-100%)'}),
        animate(300)
      ]),
      transition('* => void', [
        animate(300, style({transform: 'translateX(100%)'}))
      ])
    ])
  ],
  template: template
})
export class Toasts {

  // This gets the events
  @Input() toasthandler: Observable<Array<string>>;

  // This is looped over to display toasts
  values: Array<Toast> = [];

  constructor() {
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
      nt.show = true;
    }, 100);
    setTimeout(() => {
      this.removeItem(nt);
    }, 3000);
  }

  removeItem(value: Toast) {
    value.show = false;
    setTimeout(() => {
      this.values.splice(this.values.indexOf(value), 1);
    }, 2000);
  }
}
