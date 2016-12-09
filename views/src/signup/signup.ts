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
          alert(error.text());
          console.log(error.text());
        }
      );
  }

  login(event) {
    event.preventDefault();
    this.router.navigate(['login']);
  }

}
