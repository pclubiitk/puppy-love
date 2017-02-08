import { Injectable, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Person } from './common/person';
import { Crypto } from './common/crypto';
import { ToastService } from './toasts';
import { Config } from './config';

@Injectable()
export class DataService {
  // Stuff to be stored in private data
  choices: Person[];
  hearts = 0;
  lastcheck = 0;
  votessentto = [];

  your_image: string = '';
  your_gender: string = '';
  your_name: string = '';
  priv_key: string;
  submitted: string = 'close';
  saving: string = 'Fetching ...';

  dataToBeSent: Subject<any> = new Subject<any>();

  crypto: Crypto;

  emitdone: EventEmitter<boolean> = new EventEmitter<boolean>();
  emitsend: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public http: Http,
              public router: Router,
              public t: ToastService) {
    this.dataToBeSent.concatMap(
      data => this.http.post(Config.dataSaveUrl, {data: data}, null))
      .subscribe (
        response => this.saving = 'Saved ...',
        error => this.saving = 'Error saving your choices!'
      );
  }

  createcrypto(password: string) {
    this.crypto = new Crypto(password);
  }

  callnetwork() {
    this.http.get(Config.loginDataUrl)
      .subscribe(
        // Parse the information. Then do other actions from inside parseInfo
        response => this.parseinfo(response['_body']),
        error => {
          this.toast('Error loading data: ' + error.status);

          try {
            if (error.status === 403) {
              this.router.navigate(['login']);
            }
          } catch (e) {
            console.error(e);
            console.log(error);
          }
        }
      );
  }

  // Parse user's personal info. Lay bedrock for future actions.
  parseinfo(info: string) {
    var infoObj = null;
    try {
      infoObj = JSON.parse(info);
    } catch (e) {
      console.error(e);
      this.toast('Could not parse user data');
      return;
    }

    console.log('Your data =>');
    console.log(infoObj);

    if (!infoObj) return;

    this.your_name = infoObj.name;
    this.your_gender = infoObj.gender === '1' ? 'Male' : 'Female';
    this.your_image = infoObj.image;
    this.submitted = infoObj.submitted ? 'check' : 'close';

    // Extract public and private keys of the user
    this.crypto.deserializePriv(this.crypto.decryptSym(infoObj.privKey));
    this.crypto.deserializePub(infoObj.pubKey);

    // Decrypt stored choices info
    let data = Crypto.toJson(this.crypto.decryptSym(infoObj.data));
    this.choices = Person.deserialize(data.choices);

    this.hearts = data.hearts || 0;
    this.lastcheck = data.lastcheck || 0;
    this.votessentto = data.votessentto || [];

    this.saving = 'Saved ...';

    this.emitdone.emit(true);
  }

  // Save your (transient and changing) choices on the backend
  // Not for anyone else's eyes
  save() {
    let data = {
      choices: this.choices,
      hearts: this.hearts,
      lastcheck: this.lastcheck,
      votessentto: this.votessentto
    };
    let encData = this.crypto.encryptSym(Crypto.fromJson(data));
    this.saving = 'Saving ...';
    this.dataToBeSent.next(encData);
  }

  toast(message: string) {
    this.t.toast(message);
  }
}
