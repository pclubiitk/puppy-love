import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';

const styles   = require('./signup.css');
const template = require('./signup.html');

@Component({
  selector: 'signup',
  template: template,
  styles: [ styles ]
})
export class Signup {
  message: string = '';
  constructor(public router: Router, public http: Http) {
  }

  signup(event, roll, password, authCode) {
    event.preventDefault();
    let passHash = password;
    let body = JSON.stringify({ roll, passHash, authCode });
    this.http.post(Config.loginFirstUrl, body, { headers: contentHeaders })
      .subscribe(
        response => {
          this.router.navigate(['home']);
        },
        error => {
          this.message = 'Wrong authentication code!';
          console.log(error.text());
        }
      );
  }

  login(event) {
    event.preventDefault();
    this.router.navigate(['login']);
  }

  mailer(event, roll) {
    event.preventDefault();
    this.http.get(Config.loginMailUrl + roll)
      .subscribe(
        response => {
          this.message = 'Mail sent to your @iitk ID !';
        },
        error => {
          this.message = 'There was an error. Please tell us at pclubiitk@gmail';
        }
      );
  }

}
