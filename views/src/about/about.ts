import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';
import { Crypto } from '../common/crypto';

const styles   = require('./about.css');
const template = require('./about.html');

@Component({
  selector: 'about',
  template: template,
  styles: [ styles ]
})
export class About {
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

  homepage() {
    this.router.navigate(['login']);
  }
}
