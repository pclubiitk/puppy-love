import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { Config } from '../config';
import { Person } from '../common/person';
import { Crypto } from '../common/crypto';
import { DataService } from '../data.service';

const styles   = require('./hearts.css');
const template = require('./hearts.html');

@Component({
  selector: 'hearts',
  template: template,
  styles: [ styles ]
})
export class Hearts {
  @Input('infoloaded') infoloaded: EventEmitter<boolean>;

  @Input('pubkeys') pubkeys;
  @Input('dataObserver') dataObserver: Observer<any>;

  constructor(public http: Http,
              public dataservice: DataService) {
  }

  ngOnInit() {
    this.infoloaded.subscribe(x => this.getmorehearts());
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
    this.dataObserver.next(val);
  }
}
