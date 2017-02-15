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

  totalstuff = 0;
  donestuff = 0;

  @Input('breakloop') breakloop: boolean;

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
  }

  getmorehearts() {
    this.toast('Fetching more hearts, just for you.. Please wait.');
    this.getvotehttp();
  }

  getvotehttp() {
    this.findinghearts = true;

    this.totalstuff = 0;
    this.donestuff = 0;

    this.http.get(Config.heartGet + '/' + this.dataservice.lastcheck2 + '/' +
                   (this.dataservice.your_gender === 'Male' ? '1' : '0') + '/' +
                   this.dataservice.id)
      .subscribe(
        response => {
          try {
            let resp = JSON.parse(response['_body']);
            this.processVotes(resp);
          } catch (err) {
            this.toast('Bad response for hearts');
            console.error('Could not parse hearts response');
            this.findinghearts = false;
            console.error(err);
          }
        },
        error => {
          this.toast('Could not get hearts');
          this.findinghearts = false;
        }
      );
  }

  processVotes(resp) {
    console.log('New votes since last time =>');
    console.log(resp);

    this.totalstuff = resp.votes.length;
    let totalvotes = resp.votes.length;
    let vote;

    // A recursive function to slowly process
    // all votes without blocking the DOM
    let voteparse = (fromindex: number) => {
      if (this.breakloop) {
        return;
      }
      this.donestuff = this.donestuff + 1;
      if (fromindex >= totalvotes) {
        console.log('Hearts: ' + this.dataservice.hearts);

        this.dataservice.lastcheck = resp.time;
        this.findinghearts = false;
        this.toast('Saving your heart count now..');

        this.dataservice.save();
        return;
      }

      console.log('Vote number: ' + fromindex);
      vote = resp.votes[fromindex];

      let dec_res: Option<string> =
        this.dataservice.crypto.decryptAsym(vote.v);

      if (dec_res.isNone()) {
        console.log('Could not catch heart');
      } else {
        this.dataservice.hearts = this.dataservice.hearts + 1;
        this.toast('New heart!');
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
