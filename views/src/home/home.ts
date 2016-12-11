import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { AuthHttp } from 'angular2-jwt';
import { Config } from '../config';
import { Search } from '../search';
import { Crypto } from '../common/crypto';
import { Person } from '../common/person';

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
  submitted: string = 'close';
  greeting: string = '';
  saving: string = 'Fetching ...';
  crypto: Crypto;
  choices: Person[];
  data;

  people: string[];

  constructor(public router: Router, public http: Http, public authHttp: AuthHttp) {
    this.password = sessionStorage.getItem('password');
    this.crypto = new Crypto(this.password);

    this.make_greeting();

    this.http.get(Config.loginDataUrl)
      .subscribe(
        response => this.parseInfo(response['_body']),
        error => window.alert('Error loading data')
      );

    this.choices = [];
    // this.choices.push(new Person(
    //   'Saksham', '14588', 'CSE',
    //   'https://avatars3.githubusercontent.com/u/10418596?v=3&s=460'));
    // this.choices.push(new Person(
    //   'Crazy', '12000', 'MTH',
    //   'https://www.gentoo.org/assets/img/logo/gentoo-3d-small.png'));
    // this.choices.push(new Person(
    //   'Saksham', '14588', 'CSE',
    //   'https://avatars3.githubusercontent.com/u/10418596?v=3&s=460'));
    // this.choices.push(new Person(
    //   'Crazy', '12000', 'MTH',
    //   'https://www.gentoo.org/assets/img/logo/gentoo-3d-small.png'));

    this.data = {
      choices: this.choices
    };

    this.people = ['Name1', 'Name2'];
  }

  parseInfo(info: string) {
    var infoObj = JSON.parse(info);
    console.log(infoObj);
    this.your_name = infoObj.name;
    this.your_gender = infoObj.gender === '1' ? 'Male' : 'Female';
    this.your_image = infoObj.image;
    this.submitted = infoObj.submitted ? 'check' : 'close';

    // Extract public and private keys
    this.crypto.deserializePriv(this.crypto.decryptSym(infoObj.privKey));
    this.crypto.deserializePub(infoObj.pubKey);

    // Decrypt stored choices info
    this.data = Crypto.toJson(this.crypto.decryptSym(infoObj.data));
    this.choices = Person.deserialize(this.data.choices);

    console.log('Choices ==>');
    console.log(this.choices);

    this.saving = 'Saved ...';
  }

  personSelected(data: string) {
    console.log('Clicked: ' + data);
  }

  save() {
    let encData = this.crypto.encryptSym(Crypto.fromJson(this.data));
    this.saving = 'Saving ...';
    this.http.post(Config.dataSaveUrl, {data: encData}, null)
      .subscribe (
        response => this.saving = 'Saved ...',
        error => this.saving = 'Error saving your choices!'
      );
  }

  submit() {
  }

  logout() {
    sessionStorage.removeItem('password');
    this.http.get(Config.logoutUrl)
      .subscribe(
        response => this.router.navigate(['login']),
        error => this.router.navigate(['login'])
      );
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
}
