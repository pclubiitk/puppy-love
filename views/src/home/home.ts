import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { AuthHttp } from 'angular2-jwt';
import { Config } from '../config';
import { Crypto } from '../common/crypto';

const styles = require('./home.css');
const template = require('./home.html');

class Person {
  name: string;
  roll: string;
  dept: string;
  image: string;

  static deserialize(jsonData): Person[] {
    if (!jsonData) {
      return [];
    }

    let len = jsonData.length;
    let result: Person[] = [];
    for (let i = 0; i < len; i++) {
      result.push(new Person(
        jsonData[i].name,
        jsonData[i].roll,
        jsonData[i].dept,
        jsonData[i].image
      ));
    }
    return result;
  }

  constructor(public name: string,
              public roll: string,
              public dept: string,
              public image: string) {};
}

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
    // this.choices.push(new Person('nice', 'roll', 'CSE', 'something'));

    this.data = {
      choices: this.choices
    };
  }

  parseInfo(info: string) {
    var infoObj = JSON.parse(info);
    console.log(infoObj);
    this.your_name = infoObj.name;
    this.your_gender = infoObj.gender === '1' ? 'Male' : 'Female';
    this.your_image = infoObj.image;
    this.submitted = infoObj.submitted ? 'check' : 'close';

    this.data = this.crypto.toJson(this.crypto.decrypt(infoObj.data));
    this.choices = Person.deserialize(this.data.choices);

    console.log('Choices ==>');
    console.log(this.choices);

    this.saving = 'Saved ...';
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
    this.http.get(Config.logoutUrl)
      .subscribe(
        response => this.router.navigate(['login']),
        error => this.router.navigate(['login'])
      );
  }

  save() {
    let encData = this.crypto.encrypt(this.crypto.fromJson(this.data));
    this.saving = 'Saving ...';
    this.http.post(Config.dataSaveUrl, {data: encData}, null)
      .subscribe (
        response => this.saving = 'Saved ...',
        error => this.saving = 'Error saving your choices!'
      );
  }

  submit() {
    this.save();
  }
}
