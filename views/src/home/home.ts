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
  id: string;
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

  pubkeys; // Map from roll number to key
  computetable; // Status of the compute table

  people: Person[];

  constructor(public router: Router, public http: Http, public authHttp: AuthHttp) {
    this.password = sessionStorage.getItem('password');
    this.id = sessionStorage.getItem('id');
    if (!this.password || !this.id) {
      this.router.navigate(['login']);
    }
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

    this.people = [];

    this.pubkeys = {};
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

    this.loadPeople();

    // Needs to be after the gender has been set
    this.getallpubkey();

    // Negotiate compute values with people
    this.getcomputetable();
  }

  loadPeople() {
    let parsePeople = (json) => {
      let people = JSON.parse(json._body);
      this.people = [];
      for (let person of people) {
        this.people.push(
          new Person(
            person.name,
            person._id,
            '',
            person.image
          ));
      }
    };

    this.http.get(Config.listGender + '/' +
                  (this.your_gender === 'Male' ? '0' : '1'))
      .subscribe(
        response => parsePeople(response),
        error => console.error('Could not get list of people')
      );
  }

  personSelected(data: Person) {
    this.choices.push(data);
    this.save();
  }

  personRemoved(data: string) {
    let remove = null;
    for (let i = 0; i < this.choices.length; i++) {
      if (this.choices[i].roll === data) {
        remove = i;
        break;
      }
    }

    if (remove === null) {
      console.error('Unknown person removed: ' + data);
    } else {
      this.choices.splice(remove, 1);
      this.save();
    }
  }

  save() {
    this.data = {choices: this.choices};
    let encData = this.crypto.encryptSym(Crypto.fromJson(this.data));
    this.saving = 'Saving ...';
    this.http.post(Config.dataSaveUrl, {data: encData}, null)
      .subscribe (
        response => this.saving = 'Saved ...',
        error => this.saving = 'Error saving your choices!'
      );
  }

  getallpubkey() {
    this.http.get(Config.listPubkey + '/' +
                  (this.your_gender === 'Male' ? '0' : '1'))
      .subscribe (
        response => {
          let items = JSON.parse(response['_body']);
          for (let i in items) {
            this.pubkeys[items[i]['_id']] = items[i]['pubKey'];
          }
        },
        error => console.error('Error getting public keys')
      );
  }

  getcomputetable() {
    this.http.get(Config.listCompute)
      .subscribe (
        response => {
          this.computetable = JSON.parse(response['_body']);
          this.actuponcompute();
        },
        error => console.error('Error getting compute table')
      );
  }

  // Sets up required communication via compute table on backend
  // To be run somewhat frequently
  actuponcompute() {
    let len = this.computetable.length;

    let token = [];
    let res = [];
    let errors = [];

    for (let item of this.computetable) {
      // po => Your index
      // op => Other's index
      let ids = item['_id'].split('-');
      let po = (ids[0] === this.id ? 0 : 1);
      let op = (po === 0 ? 1 : 0);
      let pubk = this.pubkeys[ids[op]];

      if (!pubk) {
        errors.push(ids[op]);
        console.error('No public key for ' + ids[op]);
        continue;
      }

      // Instantiate a crypto instance for this person
      let cry = new Crypto();
      cry.deserializePub(pubk);

      let checker = function(data) {
        if (!data['d0'] ||
            !data['d1']) {
          return false;
        }
        return true;
      };

      // You haven't set a random token for communication
      // with this person
      if (!checker) {

        // Store the random value for the other person as well as yourself
        let vv = Crypto.getRand();
        item['t' + po] = {};
        item['t' + po]['d' + po] = this.crypto.encryptAsym(vv);
        item['t' + po]['d' + op] = cry.encryptAsym(vv);

        token.push({
          id: item['_id'],
          v: item['t' + po]
        });
      }

      // Both of you have set a random token. Send the expected value to
      // the central server
      if (checker(item['t' + po]) &&
          checker(item['t' + op])) {

        let v0 = this.crypto.decryptAsym(item['t0'])['d' + po];
        let v1 = this.crypto.decryptAsym(item['t1'])['d' + po];

        let expRes = Crypto.hash(v0 + '-' + v1);
        res.push({
          id: item['_id'],
          v: expRes
        });
      }
    }

    this.http.post(Config.computeToken, token, null)
      .subscribe (
        response => console.log('Saved tokens'),
        error => console.error('Error saving tokens!')
      );

    this.http.post(Config.computeRes, res, null)
      .subscribe (
        response => console.log('Saved compute results'),
        error => console.error('Error saving compute results!')
      );
  }

  submit() {
    let values = [];
    for (let item of this.computetable) {

      let ids = item['_id'].split('-');
      let po = (ids[0] === this.id ? 0 : 1);
      let op = (po === 0 ? 1 : 0);

      let tosend = Crypto.getRand();
      for (let p of this.choices) {
        if (p.roll === ids[op]) {
          // This person is a choice
          tosend = this.crypto.decryptAsym(item['t' + po])['d' + po];
          break;
        }
      }

      values.push({
        id: item['_id'],
        v: tosend
      });
    }

    console.log(values);
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
