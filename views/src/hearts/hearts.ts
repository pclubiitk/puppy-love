import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';
import { Person } from '../common/person';
import { Crypto } from '../common/crypto';
import { DataService } from '../data.service';
import { ToastService } from '../toasts';
import { PubkeyService } from '../pubkey.service';

const styles   = require('./hearts.css');
const template = require('./hearts.html');

@Component({
  selector: 'hearts',
  template: template,
  styles: [ styles ]
})
export class Hearts {
  constructor(public http: Http,
              public dataservice: DataService,
              public t: ToastService,
              public pks: PubkeyService) {
  }

  ngOnInit() {
    this.dataservice.emitdone.subscribe(x => this.getmorehearts());
    this.dataservice.emitsend.subscribe(x => this.sendvotes());
  }

  sendvotes() {
    let tosend = [];

    for (let p of this.dataservice.choices) {
      if (this.dataservice.votessentto.indexOf(p.roll) === -1) {

        let pubk = this.pks.pubkeys[p.roll];

        if (!pubk) {
          continue;
        }

        // Instantiate a crypto instance for this person
        let cry = new Crypto();
        cry.deserializePub(pubk);

        tosend.push({'v': cry.encryptAsym('A heart!')});
      }
    }

    if (tosend.length === 0) return;

    this.http.post(Config.voteSend, tosend)
      .subscribe(
        response => {
          // Mark these people as done
          let toadd = [];
          for (let p of this.dataservice.choices) {
            if (this.dataservice.votessentto.indexOf(p.roll) === -1) {
              toadd.push(p.roll);
            }
          }
          this.dataservice.votessentto =
            this.dataservice.votessentto.concat(toadd);
          setTimeout(() => this.dataservice.save(), 3000);
        },
        error => this.toast('Could not send votes'));
  }

  getmorehearts() {

    let ctime = new Date().valueOf();

    this.http.get(Config.voteGet + '/' + this.dataservice.lastcheck)
      .subscribe(
        response => {
          try {
            let resp = JSON.parse(response['_body']);
            this.dataservice.lastcheck = resp.time;

            console.log(resp);
            for (let vote of resp.votes) {
              try {
                this.dataservice.crypto.decryptAsym(vote.v);
                this.dataservice.hearts = this.dataservice.hearts + 1;
                this.toast('New heart!');
              } catch (err) {
                console.error('Could not catch this vote');
                console.log(vote.v);
              }
            }

            console.log('Hearts now: ' + this.dataservice.hearts);
            this.dataservice.save();

          } catch (err) {
            this.toast('Bad response for votes');
            console.error('Could not parse vote response');
            console.error(err);
          }
        },
        error => this.toast('Could not get votes')
      );
  }

  range(value) {
    let a = [];
    for (let i = 0; i < value; ++i) {
      a.push(i + 1);
    }
    return a;
  }

  toast(val: string) {
    this.t.toast(val);
  }
}
