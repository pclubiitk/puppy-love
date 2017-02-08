import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';
import { Crypto } from '../common/crypto';
import { ToastService } from '../toasts';

const styles   = require('./login.css');
const template = require('./login.html');

@Component({
  selector: 'login',
  template: template,
  styles: [ styles ]
})
export class Login {
  constructor(public router: Router,
              public http: Http,
              public t: ToastService) {
  }

  login(event, username, _password) {
    event.preventDefault();

    let password = Crypto.hash(_password);

    let body = JSON.stringify({ username, password });

    this.http.post(Config.loginUrl, body, { headers: contentHeaders })
      .subscribe(
        response => {
          sessionStorage.setItem('password', _password);
          sessionStorage.setItem('id', username);
          this.router.navigate(['home']);
        },
        error => {
          if (error.status === 403) {
            this.t.toast('It seems you entered a wrong password');
          } else if (error.status === 404) {
            this.t.toast('Your username is wrong. Please use your IITK roll no.');
          } else {
            this.t.toast('There was an error signing you in');
          }
          console.error(error);
        }
      );
  }

  signup(event) {
    event.preventDefault();
    this.router.navigate(['signup']);
  }
}
