import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { Config } from '../config';
import { Crypto } from '../common/crypto';
import { ToastService } from '../toasts';

const styles   = require('./secure.css');
const template = require('./secure.html');

@Component({
  selector: 'secure',
  template: template,
  styles: [ styles ]
})
export class Secure {
  constructor(public router: Router,
              public t: ToastService,
              public http: Http) {
  }

  homepage() {
    this.router.navigate(['home']);
  }

  savepass(event: Event, ccpass: string, ccpass2: string) {
    event.preventDefault();
    if (ccpass !== ccpass2) {
      this.toast('The 2 passwords do not match');
      return;
    }

    let password = sessionStorage.getItem('password');
    if (!password) {
      this.toast('You do not seemed to be logged in.');
      return;
    }

    let crypto: Crypto = new Crypto(password);

    let encpass = crypto.encryptSym(ccpass);

    this.http.post(Config.savePassUrl, {'pass': encpass})
      .subscribe(
        response => {
          this.toast('Your password has been secured');
          return;
        },
        error => {
          this.toast('There was an error securing your password');
          return;
        }
      );
  }

  toast(val: string) {
    this.t.toast(val);
  }
}
