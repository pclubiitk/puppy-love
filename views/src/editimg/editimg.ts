import { Component, Input, trigger, HostListener,
         transition, style, state, animate } from '@angular/core';
import { Http } from '@angular/http';
import { Config } from '../config';
import { ToastService } from '../toasts';
import { DataService } from '../data.service';

const styles   = require('./editimg.css');
const template = require('./editimg.html');

@Component({
  selector: 'editimg',
  animations: [
    trigger('visibAnim', [
      state('shown' , style({ opacity: 1, transform: 'scale(1.0)' })),
      state('hidden', style({ opacity: 0, transform: 'scale(0.0)' })),
      transition('* => *', animate('.3s'))
    ])
  ],
  template: template,
  styles: [ styles ]
})
export class Editimg {
  textmode: boolean = false;

  constructor(public http: Http,
              public dataservice: DataService,
              public t: ToastService) {
  }

  @HostListener('focusout', ['$event'])
  focusout(event) {
    setTimeout(() => {
      this.textmode = false;
    }, 300);
  }

  setimg(event: Event, newurl: string) {
    console.log('Saving link: ' + newurl);
    this.http.post(Config.imageSaveUrl + '/' + this.dataservice.id, {'img': newurl})
      .subscribe(
        response => {
          this.t.toast('Saved new image');
          this.dataservice.your_image = newurl;
        },
        error => {
          this.t.toast('There was some issue saving your image');
        }
      );
  }
}
