import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';
import { Person } from '../common/person';
import { Option, Crypto } from '../common/crypto';
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
  findinghearts: boolean = false;
  findinghearts2: boolean = false;

  totalstuff = 0;
  donestuff = 0;

  constructor(public http: Http,
              public dataservice: DataService,
              public t: ToastService,
              public pks: PubkeyService) {
  }

  ngOnInit() {
    this.dataservice.emitdone.subscribe(x => {
      setTimeout(() => {
        this.getmorehearts();
      }, 2000);
    });
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

        tosend.push({'v': cry.encryptAsym(Crypto.getRand(2))});
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
    // Hack of the day
    if (this.dataservice.lastcheck.toString().substring(0, 4) === '2017') {
      // You need medication
      this.dataservice.lastcheck = 0;
      this.dataservice.hearts = 0;
    }

    if (!this.dataservice.rechecked || this.dataservice.rechecked === 0) {
      this.toast('Recounting your hearts :) This may take a few seconds..');
      this.dataservice.lastcheck = 0;
      this.dataservice.hearts = 0;
    } else {
      this.toast('Fetching more hearts, just for you.. Please wait.');
    }

    this.getvotehttp();
  }

  getvotehttp() {
    this.findinghearts = true;
    this.findinghearts2 = true;

    this.totalstuff = 0;
    this.donestuff = 0;

    this.http.get(Config.voteGet + '/' + this.dataservice.lastcheck)
      .subscribe(
        response => {
          try {
            let resp = JSON.parse(response['_body']);
            this.processVotes(resp, 1);
          } catch (err) {
            this.toast('Bad response for votes');
            console.error('Could not parse vote response');
            this.findinghearts = false;
            console.error(err);
          }
        },
        error => {
          this.toast('Could not get votes');
          this.findinghearts = false;
        }
      );

    this.http.get(Config.heartGet + '/' + this.dataservice.lastcheck2)
      .subscribe(
        response => {
          try {
            let resp = JSON.parse(response['_body']);
            this.processVotes(resp, 2);
          } catch (err) {
            this.toast('Bad response for hearts');
            console.error('Could not parse hearts response');
            this.findinghearts2 = false;
            console.error(err);
          }
        },
        error => {
          this.toast('Could not get hearts');
          this.findinghearts2 = false;
        }
      );
  }

  processVotes(resp, index: number) {
    console.log('New votes since last time =>');
    console.log(resp);

    this.totalstuff = this.totalstuff + resp.votes.length;
    let totalvotes = resp.votes.length;
    let vote;
    let voteparse = (fromindex: number) => {
      this.donestuff = this.donestuff + 1;
      if (fromindex >= totalvotes) {

        if (index === 1) {
          this.dataservice.lastcheck = resp.time;
          this.dataservice.rechecked = 1;
          this.toast('Saving your heart count now..');
          this.findinghearts = false;
        } else {
          this.dataservice.lastcheck2 = resp.time;
          this.findinghearts2 = false;
        }

        this.dataservice.save();
        return;
      }

      console.log('Vote number: ' + fromindex);
      vote = resp.votes[fromindex];

      let dec_res: Option<string> =
        this.dataservice.crypto.decryptAsym(vote.v);

      if (dec_res.isNone()) {
        console.log('Could not catch vote');
      } else {
        this.dataservice.hearts = this.dataservice.hearts + 1;

        if (index === 1) {
          this.toast('New heart!');
        }
      }

      fromindex = fromindex + 1;
      if (fromindex % 3 === 0) {
        setTimeout(() => {
          voteparse(fromindex);
        }, 70);
      } else {
        voteparse(fromindex);
      }
    };
    voteparse(0);
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
