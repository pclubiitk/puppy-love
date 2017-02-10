import { Injectable, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import { Crypto } from './common/crypto';
import { ToastService } from './toasts';
import { Config } from './config';
import { DataService } from './data.service';

@Injectable()
export class PubkeyService {

  pubkeys = {}; // Map from roll number to key

  emitdone: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(public http: Http,
              public t: ToastService,
              public dataservice: DataService) {
    this.dataservice.emitdone.subscribe(x => this.callnetwork());
  }

  callnetwork() {
    this.toast('Algorithm in progress... ' +
               'This may take up to 45 seconds if this is your first time');
    this.http.get(Config.listPubkey + '/' +
                  (this.dataservice.your_gender === 'Male' ? '0' : '1'))
      .subscribe (
        response => {
          let items = JSON.parse(response['_body']);
          for (let i in items) {
            this.pubkeys[items[i]['_id']] = items[i]['pubKey'];
          }
          // Negotiate compute values with people
          // Requires the public keys to be in memory
          this.emitdone.emit(true);
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
