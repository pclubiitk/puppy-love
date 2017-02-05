import { Component, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { AuthHttp } from 'angular2-jwt';
import { Config } from '../config';
import { Search } from '../search';
import { Option, Crypto } from '../common/crypto';
import { Person } from '../common/person';
import { Toasts, ToastService } from '../toasts';
import { Observable, Observer } from 'rxjs';
import { DataService } from '../data.service';
import { PubkeyService } from '../pubkey.service';

const styles = require('./home.css');
const template = require('./home.html');

@Component({
  selector: 'home',
  template: template,
  styles: [ styles ],
  providers: [ DataService, ToastService, PubkeyService ]
})
export class Home {
  password: string;
  id: string;
  response: string;
  api: string;

  greeting: string = '';

  computetable; // Status of the compute table

  people: Person[];

  // Safeguard to let people think a bit before locking
  canyousubmitrightnow: boolean = false;
  submittimeron: boolean = false;

  // Will be sent if you've submitted your choices
  declarevalues = [];

  toasthandler: Observable<string>;
  dataObserver: Observer<any>;

  private static checker(data): boolean {
    if (!data ||
        !data['d0'] ||
        !data['d1']) {
      return false;
    }
    return true;
  };

  constructor(public router: Router,
              public http: Http,
              public authHttp: AuthHttp,
              public dataservice: DataService,
              public t: ToastService,
              public pks: PubkeyService) {

    this.password = sessionStorage.getItem('password');
    this.id = sessionStorage.getItem('id');
    if (!this.password || !this.id) {
      this.router.navigate(['login']);
    }

    this.make_greeting();

    // All actions begin here
    // We fetch user's personal info
    this.dataservice.createcrypto(this.password);
    this.dataservice.emitdone.subscribe(x => {

      // 1. Fetch more hearts
      // Automatically happens. Hearts component
      // subscribes to this event.

      // 2. Useful for autocompletion
      this.loadPeople();

      // 3. Needs to be after the gender has been set
      // Automatically happens. Pubkey service
      // subscribes to this event.
    });
    this.pks.emitdone.subscribe(x => {
      this.getcomputetable();
    });

    // Start the action!
    this.dataservice.callnetwork();

    this.people = [];

    // Prompt if data is saving and user wants to exit
    window.onbeforeunload = () => {
      if (this.dataservice.saving === 'Saving ...') {
        return 'Please wait a few seconds to allow your data to be saved';
      }
      return undefined;
    };
  }

  // Fetch list of people for autocompletion search from backend
  // Updates value of this.people to list of all people
  loadPeople() {

    // Helper function called later
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
                  (this.dataservice.your_gender === 'Male' ? '0' : '1'))
      .subscribe(
        // Fetch list and parse
        response => parsePeople(response),
        error => {
          console.error('Could not get list of people');
          this.toast('Could not get list of people');
        }
      );
  }

  // Prerequisite knowledge:
  // * Compute table handles the matching part
  // * It has m*n rows, one for each girl-guy pair
  // * Table schema is as follows:
  //   + _id: Concatenated roll numbers (in lexical order)
  //   + t0: Token sent by 1st person
  //     - d0: Token of 1st person encrypted with his/her own public key
  //     - d1: Token of 1st person encrypted with the other person's public key
  //   + t1: Token sent by 1st person
  //     - d0: Token of 2nd person encrypted with 1st person's public key
  //     - d1: Token of 2nd person encrypted with 2nd person's public key
  //   + r0: Expected if-matched-hash according to 1st person
  //   + r1: Expected if-matched-hash according to 2nd person
  //   + v0: Value sent finally to server by 1st person
  //   + v1: Value sent finally to server by 2nd person

  // Get the complete compute table from backend
  getcomputetable() {
    if (this.router.url !== '/home') return;
    this.http.get(Config.listCompute)
      .subscribe (
        response => {
          this.computetable = JSON.parse(response['_body']);

          // Act upon the compute table now
          this.actuponcompute();

          // Queue itself to send a redo this after 20 seconds
          setTimeout(() => this.getcomputetable(), 20000);
        },
        error => {
          console.error('Error getting compute table');
          this.toast('Error getting compute table');
          try {
            if (error.code === 403) {
              this.router.navigate(['login']);
            }
          } catch (e) {
            console.error(e);
            console.log(error);
          }
          setTimeout(() => this.getcomputetable(), 10000);
        }
      );
  }

  // Sets up required communication via compute table on backend
  // To be run somewhat frequently
  actuponcompute() {
    let len = this.computetable.length;

    let token = [];
    let res = [];
    let errors = [];

    this.declarevalues = [];

    for (let item of this.computetable) {
      // po => Your index
      // op => Other's index
      let ids = item['_id'].split('-');
      let po = (ids[0] === this.id ? 0 : 1);
      let op = (po === 0 ? 1 : 0);
      let pubk = this.pks.pubkeys[ids[op]];

      if (!pubk) {
        continue;
      }

      // Instantiate a crypto instance for this person
      let cry = new Crypto();
      cry.deserializePub(pubk);

      // You haven't set a random token for communication
      // with this person
      if (!Home.checker(item['t' + po])) {

        // Store the random value for the other person as well as yourself
        let vv = Crypto.getRand();
        item['t' + po] = {};
        item['t' + po]['d' + po] = this.dataservice.crypto.encryptAsym(vv);
        item['t' + po]['d' + op] = cry.encryptAsym(vv);

        token.push({
          id: item['_id'],
          v: item['t' + po]
        });
      }

      // Both of you have set a random token. Send the expected value to
      // the central server
      if (Home.checker(item['t' + po]) &&
          Home.checker(item['t' + op])) {

        let v0 = this.dataservice.crypto.decryptAsym(item['t0']['d' + po]);
        let v1 = this.dataservice.crypto.decryptAsym(item['t1']['d' + po]);

        if (v0.isNone() || v1.isNone()) {
          let msg = 'Error decrypting tokens for ' + ids[op];
          console.error(msg);
          this.toast(msg);
          continue;
        }

        // You haven't sent the result yet
        if (!item['r' + po]) {
          let expRes = Crypto.hash(v0.get() + '-' + v1.get());
          res.push({
            id: item['_id'],
            v: expRes
          });
        }

        // And if this person is your choice, declare another
        // expected value
        for (let p of this.dataservice.choices) {
          if (p.roll === ids[op]) {
            // This person is a choice
            let expHash = Crypto.hash(v0 + '1231abcdsjklasdla1239042' + v1);
            this.declarevalues.push(expHash);
          }
        }
      }

    }

    // Save initial token messages
    this.http.post(Config.computeToken, token, null)
      .subscribe (
        response => console.log('Saved tokens: ' + token.length),
        error => {
          console.error('Error saving tokens!');
          this.toast('Error saving tokens!');
        }
      );

    // Tell expected hashes to server
    this.http.post(Config.computeRes, res, null)
      .subscribe (
        response => console.log('Saved compute results: ' + res.length),
        error => {
          console.error('Error saving compute results!');
          this.toast('Error saving compute results!');
        }
      );

    // Person might have submitted his choices
    // We should probably look at the submission thing again
    if (this.dataservice.submitted === 'check') {
      this.submit();
    }
  }

  // Goes over the compute table, and sends final value messages to server
  submit() {
    this.dataservice.emitsend.emit(true);

    let values = [];
    for (let item of this.computetable) {

      let ids = item['_id'].split('-');
      let po = (ids[0] === this.id ? 0 : 1);
      let op = (po === 0 ? 1 : 0);

      // If you have declared your token, and you have not
      // yet sent the final value to the backend
      if (Home.checker(item['t' + po]) && item['v' + po] === '') {

        // By default random token
        let tosend: string = Crypto.getRand();

        for (let p of this.dataservice.choices) {
          if (p.roll === ids[op]) {
            // This person is a choice
            // We should not send random thing
            let token: Option<string> =
              this.dataservice.crypto.decryptAsym(item['t' + po]['d' + po]);

            if (token.isNone()) {
              let msg = 'Error retrieving value to send for user ' + p.roll;
              console.error(msg);
              this.toast(msg);
              continue;
            }

            tosend = token.get();
            break;
          }
        }

        values.push({
          id: item['_id'],
          v: tosend
        });
      }
    }

    // Send the computed stuff
    this.http.post(Config.computeValue, values, null)
      .subscribe (
        response => console.log('Saved compute values: ' + values.length),
        error => {
          console.error('Error saving compute values!');
          this.toast('Error saving compute values!');
        }
      );

    // Populate the declare table
    // NO, this does NOT mean you are telling your choices
    this.declareyourchoices();
  }

  declareyourchoices() {
    let declarePayload = {
      _id: this.id
    };

    let count = Math.min(4, this.declarevalues.length);

    for (let i = 0; i < count; i++) {
      declarePayload['t' + i] = this.declarevalues[i];
    }

    this.http.post(Config.declareChoices, declarePayload, null)
      .subscribe (
        response => console.log('Saved declare values: ' + count),
        error => {
          console.error('Error saving declare values!');
          this.toast('Error saving declare values!');
        }
      );
  }

  // ===============================================
  // Handlers for click and user interaction buttons
  // ===============================================

  // Only used when submit button is pressed
  submitButton() {
    // Only proceed if not already submitted
    if (this.dataservice.submitted !== 'check') {

      if (this.canyousubmitrightnow) {
        this.http.post(Config.submitSaveUrl, null, null)
          .subscribe (
            response => {
              this.dataservice.submitted = 'check';
              this.submit();
            },
            error => {
              console.error('Could not submit choices');
              this.toast('Could not submit choices');
            }
          );
      } else {
        // You need to think for a while before locking choices
        this.toast(
          'You will not be able to change your choices. Wait 10 seconds before submitting');

        // If another timeout was running, then ignore
        if (!this.submittimeron) {
          this.submittimeron = true;
          setTimeout(() => {
            // Lets you lock your choices now
            this.canyousubmitrightnow = true;

            // But only for 20 more seconds
            setTimeout(() => {
              this.canyousubmitrightnow = false;
            }, 20000);
          }, 10000);
          this.submittimeron = false;
        }
      }
    } else {
      // TODO Some way of showing an error
      this.toast('You have already submitted! Do not be desperate :)');
    }
  }

  // Called when an entry is clicked in the search box
  personSelected(data: Person) {
    if (this.dataservice.submitted === 'check') {
      this.toast('You have already submitted. Cannot change now');
      return;
    }

    this.dataservice.choices.push(data);
    this.dataservice.save();
  }

  // Called when user removes a saved choice
  personRemoved(data: string) {
    if (this.dataservice.submitted === 'check') {
      this.toast('You have already submitted. Cannot change now');
      return;
    }

    let remove = null;
    for (let i = 0; i < this.dataservice.choices.length; i++) {
      if (this.dataservice.choices[i].roll === data) {
        remove = i;
        break;
      }
    }

    if (remove === null) {
      console.error('Unknown person removed: ' + data);
      this.toast('Unknown person removed: ' + data);
    } else {
      this.dataservice.choices.splice(remove, 1);
      this.dataservice.save();
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

  submitsidebutton() {
    if (this.dataservice.submitted === 'check') {
      this.toast('You\'ve submitted, hurray!');
    } else if (!this.dataservice.submitted) {
      this.toast('Still loading');
    } else {
      this.toast('You haven\'t yet submitted..');
    }
  }

  aboutpage() {
    this.router.navigate(['./about']);
  }

  creditspage() {
    this.router.navigate(['./credits']);
  }

  pclubpage() {
    window.open('http://pclub.in', '_blank');
  }

  sourcecodepage() {
    window.open('https://github.com/pclubiitk/puppy-love', '_blank');
  }

  toast(val: string) {
    this.t.toast(val);
  }
}
