import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Toasts, ToastService } from './toasts';
import { Observable, Observer } from 'rxjs';

const template = require('./app.html');

@Component({
  selector: 'puppy-app',
  template: template,
  providers: [ ToastService ]
})

export class App {
  toasthandler: Observable<string>;

  constructor(public router: Router,
              public t: ToastService) {}
}
