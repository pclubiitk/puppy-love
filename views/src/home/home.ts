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

  timeouts = [];

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

      // 3. This will return without doing anything
      // if the user has not submitted yet.
      this.submit();
    });

    // Start the action!
    this.dataservice.computing = true;
    this.dataservice.callnetwork();

    this.people = [];

    // Prompt if data is saving and user wants to exit
    window.onbeforeunload = () => {
      this.cleartimeouts(() => {});
      if (this.dataservice.saving === 'Saving ...' ||
          this.dataservice.computing) {
        this.toast('Please wait a few seconds to allow your data to be saved');
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
      if (!people) {
        return;
      }
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

  // Goes over the compute table, and sends final value messages to server
  submit() {
    if (this.dataservice.submitted === 'check') {

      // Only if pks succeeds
      this.pks.callnetwork(() => {

        this.dataservice.computing = true;

        // Hearts component needs to send hearts now
        this.dataservice.emitsend.emit(true);

        // Populate the declare table
        // NO, this does NOT mean you are telling your choices
        this.declareyourchoices();
      });
    }
  }

  declareyourchoices() {
    let declarePayload = {_id: this.id};
    let declarevalues = [];

    let pubk: string;
    for (let p of this.dataservice.choices) {
      pubk = this.pks.pubkeys[p.roll];
      if (!pubk) {
        console.log(p.roll);
        continue;
      }
      declarevalues.push(
        this.dataservice.crypto.diffieHellman(pubk)
      );
    }

    let count = Math.min(4, declarevalues.length);
    for (let i = 0; i < count; i++) {
      declarePayload['t' + i] = declarevalues[i];
    }

    this.http.post(Config.declareChoices, declarePayload, null)
      .subscribe (
        response => {
          console.log('Saved declare values: ' + count);
          this.dataservice.computing = false;
          this.timeouts.push(
            setTimeout(() => {
              this.submit();
            }, 15000)
          );
        },
        error => {
          console.error('Error saving declare values!');
          this.toast('Error saving declare values!');
          this.dataservice.computing = false;
          this.timeouts.push(
            setTimeout(() => {
              this.submit();
            }, 15000)
          );
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
      this.toast('You have already submitted!');
    }
  }

  // Called when an entry is clicked in the search box
  personSelected(data: Person) {
    if (this.dataservice.submitted === 'check') {
      this.toast('You have already submitted. Cannot change now');
      return;
    }

    if (this.dataservice.choices.length <= 3) {
      for (let choice of this.dataservice.choices) {
        if (choice.roll === data.roll) {
          this.toast('You have already added this person.');
          return;
        }
      }
      this.dataservice.choices.push(data);
      this.dataservice.save();
    } else {
      this.toast('You cannot select more than 4 choices.');
    }
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

  cleartimeouts(callback: () => void): void {
    for (let event of this.timeouts) {
      try {
        clearTimeout(event);
      } finally {
        continue;
      }
    }
    callback();
  }

  logout() {
    this.cleartimeouts(() => {
      sessionStorage.removeItem('password');
      this.http.get(Config.logoutUrl)
        .subscribe(
          response => this.router.navigate(['login']),
          error => this.router.navigate(['login'])
        );
    });
  }

  aboutpage() {
    this.cleartimeouts(() => {
      this.router.navigate(['./about']);
    });
  }

  secure() {
    this.cleartimeouts(() => {
      this.router.navigate(['./secure']);
    });
  }

  creditspage() {
    this.cleartimeouts(() => {
      this.router.navigate(['./credits']);
    });
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
