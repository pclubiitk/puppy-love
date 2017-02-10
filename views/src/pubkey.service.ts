import { Injectable, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import { Crypto } from './common/crypto';
import { ToastService } from './toasts';
import { Config } from './config';
import { DataService } from './data.service';

@Injectable()
export class PubkeyService {

  pubkeys = {}; // Map from roll number to key

  constructor(public http: Http,
              public t: ToastService,
              public dataservice: DataService) {
  }

  callnetwork(callback: () => void) {
    this.http.get(Config.listPubkey + '/' +
                  (this.dataservice.your_gender === 'Male' ? '0' : '1'))
      .subscribe (
        response => {
          let items = JSON.parse(response['_body']);
          for (let i in items) {
            this.pubkeys[items[i]['_id']] = items[i]['pubKey'];
          }

          // Submit values and votes now :)
          callback();
        },
        error => {
          console.error('Error getting public keys');
          this.toast('Error getting public keys');
        }
      );
  }

  toast(message: string) {
    this.t.toast(message);
  }
}
