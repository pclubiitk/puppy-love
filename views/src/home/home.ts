import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { AuthHttp } from 'angular2-jwt';
import { Config } from '../config';

const styles = require('./home.css');
const template = require('./home.html');

@Component({
  selector: 'home',
  template: template,
  styles: [ styles ]
})
export class Home {
  password: string;
  response: string;
  api: string;

  your_image: string = '';
  your_gender: string = '';
  your_name: string = '';
  priv_key: string;
  submitted: boolean = false;
  greeting: string = '';

  constructor(public router: Router, public http: Http, public authHttp: AuthHttp) {
    this.password = sessionStorage.getItem('password');

    this.make_greeting();

    this.http.get(Config.loginDataUrl)
      .subscribe(
        response => this.parseInfo(response['_body']),
        error => window.alert('Error loading data')
      );
  }

  parseInfo(info: string) {
    var infoObj = JSON.parse(info);
    console.log(infoObj);
    this.your_name = infoObj.name;
    this.your_gender = infoObj.gender === '1' ? 'Male' : 'Female';
    this.your_image = infoObj.image;
    this.submitted = infoObj.submitted;
  }

  make_greeting() {
    var now = new Date().getHours();

    if (now >= 6 && now < 12) {
      this.greeting = 'Good Morning,';
    } else if (now >= 12 && now < 17) {
      this.greeting = 'Good Afternoon,';
    } else if (now >= 17 && now < 22 ) {
      this.greeting = 'Good Evening,';
    } else {
      this.greeting = 'Good Evening,';
    }
  }

  logout() {
    sessionStorage.removeItem('password');
    this.http.post(Config.logoutUrl, null)
      .subscribe(
        response => this.router.navigate(['login']),
        error => this.router.navigate(['login'])
      );
  }

  callAnonymousApi() {
    this._callApi('Anonymous', 'http://localhost:3001/api/random-quote');
  }

  callSecuredApi() {
    this._callApi('Secured', 'http://localhost:3001/api/protected/random-quote');
  }

  _callApi(type, url) {
    this.response = null;
    if (type === 'Anonymous') {
      // For non-protected routes, just use Http
      this.http.get(url)
        .subscribe(
          response => this.response = response.text(),
          error => this.response = error.text()
        );
    }
    if (type === 'Secured') {
      // For protected routes, use AuthHttp
      this.authHttp.get(url)
        .subscribe(
          response => this.response = response.text(),
          error => this.response = error.text()
        );
    }
  }
}
