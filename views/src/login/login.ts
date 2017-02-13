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

    let password = sessionStorage.getItem('password');
    let id = sessionStorage.getItem('id');
    console.log('Here=>');
    console.log(password);
    console.log(id);
    console.log(document.cookie);
    if (password && id) {
      this.router.navigate(['home']);
    } else {
      sessionStorage.removeItem('id');
      sessionStorage.removeItem('password');
    }

    Crypto.clearListCookies();
  }

  login(event, username, _password) {
    event.preventDefault();

    let password = Crypto.hash(_password);

    let body = JSON.stringify({ username, password });


    Crypto.clearListCookies();
    this.sendLoginReq(body, username, _password);

    //this.http.get(Config.logoutUrl)
    //.subscribe(
        //response => {
        //},
        //error => {
          //Crypto.clearListCookies();
          //this.sendLoginReq(body, username, _password);
        //}
    //);

  }

  sendLoginReq(body, username, _password) {
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
