import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';
import { Crypto } from '../common/crypto';

const styles   = require('./login.css');
const template = require('./login.html');

@Component({
  selector: 'login',
  template: template,
  styles: [ styles ]
})
export class Login {
  constructor(public router: Router, public http: Http) {
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
          alert(error.text());
          console.log(error.text());
        }
      );
  }

  signup(event) {
    event.preventDefault();
    this.router.navigate(['signup']);
  }
}
